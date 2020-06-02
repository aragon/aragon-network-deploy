const CallsEncoder = require('../shared/CallsEncoder')
const BaseDeployer = require('../shared/BaseDeployer')
const logger = require('../../helpers/logger')('EOPBCTemplateDeployer')

const { getInstalledAppsById } = require('../../helpers/events')
const { APP_IDS } = require('@aragon/templates-externally-owned-presale-bonding-curve/lib/helpers/constants')

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
  constructor(config, environment, output, verifier = undefined) {
    super(environment, output, verifier)
    this.config = config
    this.encoder = new CallsEncoder()
  }

  async call() {
    await this._loadOrDeployTemplate()

    this.config.governor.isDAO()
      ? await this._instanceTemplateThroughDAO()
      : await this._instanceTemplateDirectly()
  }

  /** template methods **/

  async _loadOrDeployTemplate () {
    const { template } = this.previousDeploy
    const Template = await this.environment.getArtifact('EOPBCTemplate', '@aragon/templates-externally-owned-presale-bonding-curve')

    if (template && template.address) await this._loadTemplate(Template, template.address)
    else await this._deployTemplate(Template)
    await this._verify('template', this.template, '@aragon/templates-externally-owned-presale-bonding-curve', VERIFICATION_HEADERS)
  }

  async _loadTemplate(Template, templateAddress) {
    logger.warn(`Using previous deployed EOPBC Template at ${templateAddress}`)
    this.template = await Template.at(templateAddress)
  }

  async _deployTemplate(Template) {
    this._printTemplateDeploy()
    const { ens, daoFactory, registrar } = this.config.infra

    this.template = await Template.new(daoFactory, ens, registrar)
    const { address, transactionHash } = this.template
    logger.success(`Created EOPBC Template instance at ${address}`)
    this._saveDeploy({ template: { address, transactionHash }})
  }

  async _saveFundraisingAddresses(installedApps, transactionHash) {
    Object.keys(installedApps).forEach(name => {
      const address = installedApps[name][0]
      logger.success(`Created ${name} instance at ${address}`)
      this._saveDeploy({ [name]: { address: address, transactionHash }})
    })
  }

  /** instance methods **/

  async _instanceTemplateDirectly() {
    const sender = await this.environment.getSender()
    this._printTemplateInstance(sender)

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

    await this._changeBondedTokenController(bondedToken)

    const bondingParams = [exchangeRate, beneficiaryPct, reserveRatio, batchBlocks, slippage]
    const { receipt, tx } = await this.template.newInstance(sender, id, collateralToken, bondedToken, period, openDate, bondingParams)
    const installedApps = await this._getInstalledApps(receipt.rawLogs)
    await this._saveFundraisingAddresses(installedApps, tx)
    await this._verifyFundraisingContracts(installedApps)
  }

  async _instanceTemplateThroughDAO() {
    const { bondedToken, governor } = this.config.instance
    logger.info('Building EVM script to change ANJ controller and deploy new fundraising template...')
    const changeControllerData = this.encoder.encodeExecute(bondedToken, 0, this.encoder.encodeChangeController(this.template.address))
    const newInstanceData = this.encoder.encodeExecute(this.template.address, 0, this.encoder.encodeNewInstance(this.config.instance))
    const agentCallsScript = [{ to: governor.agent, data: changeControllerData }, { to: governor.agent, data: newInstanceData }]
    const voteDescription = 'Change ANJ controller to template and deploy new presale and bonding curve instance'
    await this._encodeAndSubmitEvmScript(governor, agentCallsScript, voteDescription)
  }

  async _changeBondedTokenController(bondedTokenAddress) {
    const MiniMeToken = await this.environment.getArtifact('MiniMeToken', '@aragon/minime')
    const bondedToken = await MiniMeToken.at(bondedTokenAddress)
    const currentController = await bondedToken.controller()

    if (currentController === this.template.address) {
      logger.success(`Bonded token controller is already owned by template`)
    } else {
      const sender = await this.environment.getSender()
      if (currentController !== sender) throw Error(`Bonded token controller is already owned by ${currentController}`)
      logger.info('Changing bonded token controller to template...')
      await bondedToken.changeController(this.template.address)
      logger.success(`Bonded token controller changed successfully`)
    }
  }

  /** verifying methods **/

  async _getInstalledApps(logs) {
    const Kernel = await this.environment.getArtifact('Kernel', '@aragon/os')
    return getInstalledAppsById(logs, APP_IDS, Kernel)
  }

  async _verifyFundraisingContracts(installedApps) {
    const AppProxyUpgradeable = await this.environment.getArtifact('AppProxyUpgradeable', '@aragon/os')
    for (const app in installedApps) {
      const proxyContract = await AppProxyUpgradeable.at(installedApps[app][0])
      await this._verify(app, proxyContract, '@aragon/os', VERIFICATION_HEADERS_OS)
    }
  }

  async _verify(contractName, contract, dependency, verificationHeaders) {
    const previousContract = this.previousDeploy[contractName]
    if (this.verifier && previousContract && !previousContract.verification) {
      const url = await this.verifier.call(contract, dependency, verificationHeaders)
      const { address, transactionHash } = previousContract
      this._saveDeploy({ [contractName]: { address, transactionHash, verification: url } })
    }
  }

  /** logging methods **/

  _printTemplateDeploy() {
    logger.info('Deploying EOPBC Template contract with config:')
    logger.info(` - ENS:                                     ${this.config.infra.ens}`)
    logger.info(` - Registrar:                               ${this.config.infra.registrar}`)
    logger.info(` - DAO factory:                             ${this.config.infra.daoFactory}`)
  }

  _printTemplateInstance(owner) {
    logger.info('Deploying new Presale instance with config:')
    logger.info(` - Owner:                                   ${owner}`)
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
}
