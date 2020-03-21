const CallsEncoder = require('../shared/CallsEncoder')
const BaseDeployer = require('../shared/BaseDeployer')
const logger = require('../../helpers/logger')('PresaleTemplateDeployer')
const { getInstalledAppsById } = require('../../helpers/events')
const { APP_IDS } = require('@aragon/templates-externally-owned-presale-bonding-curve/lib/helpers/constants.js')

const VERIFICATION_HEADERS = [
  'Commit sha: 4e5e611272e5a1a124ec0e90e0d93b5f1470e783',
  'GitHub repository: https://github.com/aragonone/court-presale',
  'Tool used for the deploy: https://github.com/aragon/aragon-network-deploy',
]

const VERIFICATION_HEADERS_OS = [
  'Commit sha: c85d34e4bae0bf5b1ab78340b32e712d895179a7',
  'GitHub repository: https://github.com/aragon/aragonOS',
  'Tool used for the deploy: https://github.com/aragon/aragon-network-deploy',
]

module.exports = class extends BaseDeployer {
  constructor(config, environment, output, verifier = undefined, printFundraisingAddresses = undefined, deployWrapper = false) {
    super(environment, output, verifier)
    this.config = config
    this.printFundraisingAddresses = printFundraisingAddresses
    this.deployWrapper = deployWrapper
    this.encoder = new CallsEncoder()
  }

  async call() {

    if (this.printFundraisingAddresses !== undefined) {
      await this._printFundraisingAddresses()
      return
    }

    if (this.deployWrapper) {
      await this._deployWrapper()
      return
    }

    await this._loadOrDeployTemplate()
    await this._verifyPresaleTemplate()

    const { governor } = this.config
    if (typeof governor === 'string') {
      const installedApps = await this._deployPresaleInstance()
      await this._verifyFundraisingContracts(installedApps)
    } else {
      logger.info('Building EVM script to change ANJ controller and deploy new fundraising template...')
      const changeControllerData = this._changeControllerScript()
      const newInstanceData = this._newInstanceScript()
      const agentCallsScript = [{ to: governor.agent, data: changeControllerData }, { to: governor.agent, data: newInstanceData }]
      const voteDescription = 'Change ANJ controller to template and deploy new presale and bonding curve instance'
      await this._encodeAndSubmitEvmScript(governor, agentCallsScript, voteDescription)
    }
  }

  // ************ Template ************* //

  async _loadOrDeployTemplate () {
    const configTemplate = this.previousDeploy.presaleTemplate
    const PresaleTemplate = await this.environment.getArtifact('EOPBCTemplate', '@aragon/templates-externally-owned-presale-bonding-curve')

    if (configTemplate && configTemplate.address) {
      await this._loadPresaleTemplate(PresaleTemplate, configTemplate.address)
    } else {
      await this._deployPresaleTemplate(PresaleTemplate)
    }
  }

  async _loadPresaleTemplate(PresaleTemplate, templateAddress) {
    logger.warn(`Using previous deployed Presale Template at ${templateAddress}`)
    this.presaleTemplate = await PresaleTemplate.at(templateAddress)
  }

  async _deployPresaleTemplate(PresaleTemplate) {
    this._printPresaleTemplateDeploy()
    const { ens, daoFactory, registrar } = this.config.infra

    this.presaleTemplate = await PresaleTemplate.new(daoFactory, ens, registrar)

    const { address, transactionHash } = this.presaleTemplate
    logger.success(`Created Presale template contract at ${address}`)
    this._saveDeploy({ presaleTemplate: { address, transactionHash }})
  }

  _printPresaleTemplateDeploy() {
    logger.info('Deploying Presale Template contract with config:')
    logger.info(` - DAO factory:                             ${this.config.infra.daoFactory}`)
    logger.info(` - ENS:                                     ${this.config.infra.ens}`)
    logger.info(` - Registrar:                               ${this.config.infra.registrar}`)
  }

  async _verifyPresaleTemplate() {
    await this._verifyNonProxy('presaleTemplate', '@aragon/templates-externally-owned-presale-bonding-curve')
  }

  // ************ Instance ************* //

  async _deployPresaleInstance() {
    const sender = await this.environment.getSender()

    const {
      id,
      collateralToken,
      bondedToken,
      period,
      exchangeRate,
      beneficiaryPct,
      openDate,
      reserveRatio,
      batchBlocks,
      slippage
    } = this.config.instance

    const instanceOwner = sender

    this._printPresaleInstanceDeploy(instanceOwner)

    // change bonded token controller to Template
    await this._changeBondedTokenController(bondedToken)

    // new instance
    const instanceReceipt = await this.presaleTemplate.newInstance(
      instanceOwner,
      id,
      collateralToken,
      bondedToken,
      period,
      openDate,
      [
        exchangeRate,
        beneficiaryPct,
        reserveRatio,
        batchBlocks,
        slippage
      ]
    )

    return this._getInstalledApps(instanceReceipt.tx, instanceReceipt.receipt.rawLogs)
  }

  async _getInstalledApps(txHash, logs) {
    const Kernel = await this.environment.getArtifact('Kernel', '@aragon/os')
    const installedApps = getInstalledAppsById(logs, APP_IDS, Kernel)
    Object.keys(installedApps).map((name) => {
      const addresses = installedApps[name]
      if (addresses.length === 0) {
        delete installedApps[name]
        return
      }
      logger.success(`Created ${name} contract at ${addresses[0]}`)
      this._saveDeploy({ [name]: { address: addresses[0], transactionHash: txHash }})
    })

    return installedApps
  }

  async _printFundraisingAddresses() {
    const web3 = this.environment.getWeb3()
    const txReceipt = await web3.eth.getTransactionReceipt(this.printFundraisingAddresses)
    await this._getInstalledApps(txReceipt.transactionHash, txReceipt.logs)
  }

  async _verifyFundraisingContracts(installedApps) {
    for (const app in installedApps) {
      await this._verifyProxy(app, installedApps[app][0])
    }
  }

  _printPresaleInstanceDeploy(instanceOwner) {
    logger.info('Deploying new Presale instance with config:')
    logger.info(` - Owner:                                   ${instanceOwner}`)
    logger.info(` - Id:                                      ${this.config.instance.id}`)
    logger.info(` - Collateral token:                        ${this.config.instance.collateralToken}`)
    logger.info(` - Bonded token:                            ${this.config.instance.bondedToken}`)
    logger.info(` - Period:                                  ${this.config.instance.period}`)
    logger.info(` - Exchange rate:                           ${this.config.instance.exchangeRate}`)
    logger.info(` - Open date:                               ${this.config.instance.openDate}`)
    logger.info(` - Reserve ratio:                           ${this.config.instance.reserveRatio}`)
    logger.info(` - Batch blocks:                            ${this.config.instance.batchBlocks}`)
    logger.info(` - Slippage:                                ${this.config.instance.slippage}`)
  }

  async _changeBondedTokenController(bondedTokenAddress) {
    const MiniMeToken = await this.environment.getArtifact('MiniMeToken', '@aragon/minime')
    const miniMeBondedToken = await MiniMeToken.at(bondedTokenAddress)
    const currentController = await miniMeBondedToken.controller()
    if (currentController == this.presaleTemplate.address) {
      logger.warn(`Bonded token controller is already owned by template`)
      return
    }
    const sender = await this.environment.getSender()
    if (currentController != sender) {
      throw `Bonded token controller is already owned by ${currentController}`
    }
    logger.info(`Changing bonded token controller to template`)
    await miniMeBondedToken.changeController(this.presaleTemplate.address);
  }

  async _verifyNonProxy(contractName, dependency) {
    await this._verify(contractName, this[contractName], dependency, VERIFICATION_HEADERS)
  }

  async _verifyProxy(contractName, contractAdress) {
    const AppProxyUpgradeable = await this.environment.getArtifact('AppProxyUpgradeable', '@aragon/os')
    const proxyContract = await AppProxyUpgradeable.at(contractAdress)
    await this._verify(contractName, proxyContract, '@aragon/os', VERIFICATION_HEADERS_OS)
  }

  async _verify(contractName, contract, dependency, verificationHeaders) {
    const previousContract = this.previousDeploy[contractName]
    if (this.verifier && previousContract && !previousContract.verification) {
      const url = await this.verifier.call(contract, dependency, verificationHeaders)
      const { address, transactionHash } = previousContract
      this._saveDeploy({ [contractName]: { address, transactionHash, verification: url } })
    }
  }

  _changeControllerScript() {
    const { bondedToken } = this.config.instance
    const data = this.encoder.encodeChangeController(this.presaleTemplate.address)
    return this.encoder.encodeExecute(bondedToken, 0, data)
  }

  _newInstanceScript() {
    const data = this.encoder.encodeNewInstance(this.config.instance)
    return this.encoder.encodeExecute(this.presaleTemplate.address, 0, data)
  }

  // ************ Wrapper ************* //

  async _deployWrapper() {
    const { bondedToken } = this.config.instance
    const { registry, presale, uniswap } = this.config.wrapper
    const owner = typeof this.config.governor === 'string' ? this.config.governor : this.config.governor.agent

    const CourtPresaleActivate = await this.environment.getArtifact('CourtPresaleActivate', '@aragon/court-presale-activate')
    const wrapper = await CourtPresaleActivate.new(owner, bondedToken, registry, presale, uniswap)

    const { address, transactionHash } = wrapper
    logger.success(`Created Wrapper contract at ${address}`)
    this._saveDeploy({ wrapper: { address, transactionHash }})
  }
}
