const CallsEncoder = require('../shared/CallsEncoder')
const BaseDeployer = require('../shared/BaseDeployer')
const logger = require('../../helpers/logger')('JurorsRegistryMigrator')
const { JURORS_REGISTRY_ID, DISPUTE_MANAGER_ID } = require('../../helpers/court-modules')

module.exports = class extends BaseDeployer {
  constructor(config, environment, close = false) {
    super(environment)
    this.config = config
    this.close = close
    this.encoder = new CallsEncoder()
  }

  async call() {
    const isGovernorDAO = typeof this.config.governor === 'string'

    if (this.close) {
      isGovernorDAO
        ? await this.closeMigratorThroughDAO()
        : await this.closeMigratorDirectly()
    } else {
      isGovernorDAO
        ? await this.setupMigratorThroughDAO()
        : await this.setupMigratorDirectly()
    }
  }

  async setupMigratorDirectly() {
    const { bondedToken, court, oldRegistry, newRegistry, migrator } = this.config

    logger.info('Sending funds from old registry to migrator...')
    const JurorsRegistry = await this.environment.getArtifact('JurorsRegistry', '@aragon/court')
    const oldJurorsRegistry = await JurorsRegistry.at(oldRegistry)
    await oldJurorsRegistry.recoverFunds(bondedToken, migrator)
    logger.success('Funds successfully transferred to migrator')

    logger.info('Setting modules...')
    const AragonCourt = await this.environment.getArtifact('AragonCourt', '@aragon/court')
    const controller = await AragonCourt.at(court)
    await controller.setModules([JURORS_REGISTRY_ID, DISPUTE_MANAGER_ID], [newRegistry, migrator])
    logger.success('Modules set successfully')
    logger.success('Migrator set up successfully')
  }

  async setupMigratorThroughDAO() {
    const { governor, bondedToken, court, oldRegistry, newRegistry, migrator } = this.config
    logger.info('Building EVM script to set up registry migrator...')
    const recoverFundsData = this._buildRecoverFundsData(oldRegistry, bondedToken, migrator)
    const setModulesData = this._buildSetModulesData(court, newRegistry, migrator)
    const agentCallsScript = [{ to: governor.agent, data: recoverFundsData }, { to: governor.agent, data: setModulesData }]
    await this._encodeAndSubmitEvmScript(governor, agentCallsScript, 'Set up registry migrator')
  }

  async closeMigratorDirectly() {
    const { migrator } = this.config
    logger.info('Closing migrator...')
    const JurorsRegistryMigrator = await this.environment.getArtifact('JurorsRegistryMigrator', '@aragonone/court-registry-migrator')
    const registryMigrator = await JurorsRegistryMigrator.at(migrator)
    await registryMigrator.close()
    logger.success('Migrator closed successfully')
  }

  async closeMigratorThroughDAO() {
    const { governor, migrator } = this.config
    logger.info('Building EVM script to close migrator...')
    const closeData = this.encoder.encodeCloseMigrator()
    const executeData = this.encoder.encodeExecute(migrator, 0, closeData)
    const agentCallsScript = [{ to: governor.agent, data: executeData }]
    await this._encodeAndSubmitEvmScript(governor, agentCallsScript, 'Close registry migrator')
  }

  _buildRecoverFundsData(oldJurorsRegistryAddress, anj, migrator) {
    const data = this.encoder.encodeRecoverFunds(anj, migrator)
    return this.encoder.encodeExecute(oldJurorsRegistryAddress, 0, data)
  }

  _buildSetModulesData(controller, newJurorsRegistry, migrator) {
    const data = this.encoder.encodeSetModules([JURORS_REGISTRY_ID, DISPUTE_MANAGER_ID], [newJurorsRegistry, migrator])
    return this.encoder.encodeExecute(controller, 0, data)
  }
}
