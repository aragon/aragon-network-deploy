const CallsEncoder = require('../shared/CallsEncoder')
const BaseDeployer = require('../shared/BaseDeployer')
const logger = require('../../helpers/logger')('ControllerModulesManager')

module.exports = class extends BaseDeployer {
  constructor(config, environment) {
    super(environment)
    this.config = config
    this.encoder = new CallsEncoder()
  }

  async call(governor) {
    this.config.governor.modules.isDAO()
      ? (await this.setGovernorThroughDAO(governor))
      : (await this.setGovernorDirectly(governor))
  }

  async setGovernorDirectly(governor) {
    logger.info('Changing governor...')
    const AragonCourt = await this.environment.getArtifact('AragonCourt', '@aragon/court')
    const controller = await AragonCourt.at(this.config.modules.court)
    await controller.changeConfigGovernor(governor)
    logger.success('Governor changed correctly')
  }

  async setGovernorThroughDAO(governor) {
    const { modules: { court }, governor: { modules: dao } } = this.config
    logger.info('Building EVM script to set modules through DAO...')
    const description = `Change court governor to ${governor}`
    const changeGovernorData = this.encoder.encodeChangeConfigGovernor(governor)
    const executeData = this.encoder.encodeExecute(court, 0, changeGovernorData)
    const agentCallsScript = [{ to: dao.agent, data: executeData }]
    await this._encodeAndSubmitEvmScript(dao, agentCallsScript, description)
  }
}
