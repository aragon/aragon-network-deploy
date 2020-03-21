const BaseDeployer = require('./BaseDeployer')
const CallsEncoder = require('../CallsEncoder')
const logger = require('../../helpers/logger')('ControllerModulesManager')
const { DISPUTE_MANAGER_ID, JURORS_REGISTRY_ID, SUBSCRIPTIONS_ID, TREASURY_ID, VOTING_ID } = require('../../helpers/court-modules')

module.exports = class extends BaseDeployer {
  constructor(config, environment, output, modules = {}) {
    super(environment, output, undefined, logger)
    this.config = config
    this.modules = modules
    this.encoder = new CallsEncoder()
  }

  async call() {
    (typeof this.config.governor.modules === 'string')
      ? (await this.setModules())
      : (await this.setModulesThroughDAO())
  }

  async setModules() {
    logger.info('Setting modules...')
    const modules = this._getChangingModules()
    const ids = modules.map(module => module.id)
    const addresses = modules.map(module => module.address)
    const AragonCourt = await this.environment.getArtifact('AragonCourt', '@aragon/court')
    const controller = await AragonCourt.at(this.config.modules.court)
    await controller.setModules(ids, addresses)
    logger.success('Modules set successfully')
  }

  async setModulesThroughDAO() {
    const { modules: { court }, governor: { modules: dao } } = this.config
    logger.info('Building EVM script to set modules through DAO...')

    const modules = this._getChangingModules()
    const ids = modules.map(module => module.id)
    const addresses = modules.map(module => module.address)
    const description = modules.reduce((text, { id, address, name }) => `${text}\n${name} (ID ${id}) to ${address}`, 'Set modules:')

    const setModulesData = this.encoder.encodeSetModules(ids, addresses)
    const executeData = this.encoder.encodeExecute(court, 0, setModulesData)
    const agentCallsScript = [{ to: dao.agent, data: executeData }]
    await this._encodeAndSubmitEvmScript(dao, agentCallsScript, description)
  }

  _getChangingModules() {
    const modules = []
    if (this.modules.voting) modules.push({ id: VOTING_ID, address: this.modules.voting, name: 'Voting' })
    if (this.modules.treasury) modules.push({ id: TREASURY_ID, address: this.modules.treasury, name: 'Treasury' })
    if (this.modules.subscriptions) modules.push({ id: SUBSCRIPTIONS_ID, address: this.modules.subscriptions, name: 'Subscriptions' })
    if (this.modules.jurorsRegistry) modules.push({ id: JURORS_REGISTRY_ID, address: this.modules.jurorsRegistry, name: 'JurorsRegistry' })
    if (this.modules.disputeManager) modules.push({ id: DISPUTE_MANAGER_ID, address: this.modules.disputeManager, name: 'DisputeManager' })
    return modules
  }
}
