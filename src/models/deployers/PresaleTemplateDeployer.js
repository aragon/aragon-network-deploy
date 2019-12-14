const { APP_IDS } = require('@aragon/templates-externally-owned-presale-bonding-curve/lib/helpers/constants.js')
const BaseDeployer = require('./BaseDeployer')
const CallsEncoder = require('../CallsEncoder')
const logger = require('../../helpers/logger')('PresaleTemplateDeployer')
const { getInstalledApps, getInstalledAppsById } = require('../../helpers/events')
const { publishBalanceRedirectPresale } = require('../../helpers/balance_redirect_presale.js')

const VERIFICATION_HEADERS = [
  'Commit sha: 68b894fe4fd81cbf43c8b1e128be9ddfffd41380',
  'GitHub repository: https://github.com/aragonone/fundraising',
  'Tool used for the deploy: https://github.com/aragon/aragon-network-deploy',
]

const VERIFICATION_HEADERS_OS = [
  'Commit sha: c85d34e4bae0bf5b1ab78340b32e712d895179a7',
  'GitHub repository: https://github.com/aragon/aragonOS',
  'Tool used for the deploy: https://github.com/aragon/aragon-network-deploy',
]

const ZERO_ADDRESS = '0x' + '0'.repeat(40)

module.exports = class extends BaseDeployer {
  constructor(config, environment, output, verifier = undefined, deployInstance = false, generateEvmScript = false) {
    super(environment, output, verifier, logger)
    this.config = config
    this.deployInstance = deployInstance
    this.generateEvmScript = generateEvmScript
    this.encoder = new CallsEncoder()
  }

  async call() {
    const configTemplate = this.previousDeploy.presaleTemplate
    const PresaleTemplate = await this.environment.getArtifact('EOPBCTemplate', '@aragon/templates-externally-owned-presale-bonding-curve')

    if (configTemplate && configTemplate.address) {
      await this._loadPresaleTemplate(PresaleTemplate, configTemplate.address)
    } else {
      await this._deployPresaleTemplate(PresaleTemplate)
    }

    await this._verifyPresaleTemplate()

    // TODO: remove once it's in aragen
    if (this.environment.isLocal()) {
      await publishBalanceRedirectPresale(this.environment, this.config, logger)
    }

    if (this.deployInstance) {
      const installedApps = await this._deployPresaleInstance()
      await this._verifyFundraisingContracts(installedApps)
    }

    if (this.generateEvmScript) {
      const callsScript = this._generateEvmScript()
      logger.info(`Call script sent to AN DAO token manager forwarder: ${callsScript}`)
      await this._runEvmScript(callsScript)
    }
  }

  // ************ Template ************* //

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
    await this._verifyNonProxy('presaleTemplate')
  }

  // ************ Instance ************* //

  async _deployPresaleInstance() {
    const sender = await this.environment.getSender()

    const {
      owner,
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

    const instanceOwner = owner || sender

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

    const Kernel = await this.environment.getArtifact('Kernel', '@aragon/os')
    const installedApps = getInstalledAppsById(instanceReceipt, APP_IDS, Kernel)
    Object.keys(installedApps).map((name) => {
      const addresses = installedApps[name]
      if (addresses.length == 0) {
        delete installedApps[name]
        return
      }
      logger.success(`Created ${name} contract at ${addresses[0]}`)
      this._saveDeploy({ [name]: { address: addresses[0], transactionHash: instanceReceipt.tx }})
    })

    return installedApps
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

  async _verifyNonProxy(contractName) {
    await this._verify(contractName, this[contractName], VERIFICATION_HEADERS)
  }

  async _verifyProxy(contractName, contractAdress) {
    const AppProxyUpgradeable = await this.environment.getArtifact('AppProxyUpgradeable', '@aragon/os')
    const proxyContract = await AppProxyUpgradeable.at(contractAdress)
    await this._verify(contractName, proxyContract, VERIFICATION_HEADERS_OS)
  }

  async _verify(contractName, contract, verificationHeaders) {
    const previousContract = this.previousDeploy[contractName]
    if (this.verifier && previousContract && !previousContract.verification) {
      const url = await this.verifier.call(contract, verificationHeaders)
      const { address, transactionHash } = previousContract
      this._saveDeploy({ [contractName]: { address, transactionHash, verification: url } })
    }
  }

  _generateEvmScript() {
    // owner of the instance is the agent of the external DAO
    const { owner } = this.config.instance
    const agentCallsScript = []
    agentCallsScript.push({
      to: owner,
      data: this._changeControllerScript()
    })
    agentCallsScript.push({
      to: owner,
      data: this._newInstanceScript()
    })

    const { votingApp, voteDescription } = this.config.aragonNetworkDao
    const tokenManagerScript = [ {
      to: votingApp,
      data: this.encoder.encodeNewVote(this.encoder.encodeCallsScript(agentCallsScript), voteDescription)
    }]
    return this.encoder.encodeCallsScript(tokenManagerScript)
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

  async _runEvmScript(callsScript) {
    const TokenManager = await this.environment.getArtifact('TokenManager', '@aragon/apps-token-manager')
    const { tokenManager: tokenManagerAddress } = this.config.aragonNetworkDao
    const tokenManager = await TokenManager.at(tokenManagerAddress)
    const receipt = await tokenManager.forward(callsScript)
    logger.info(`EVM Script run on tx: ${receipt.tx}. Gas used: ${receipt.receipt.gasUsed}`)
  }
}
