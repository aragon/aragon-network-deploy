const CallsEncoder = require('../CallsEncoder')
const BaseDeployer = require('../deployers/BaseDeployer')
const logger = require('../../helpers/logger')('SubscriptionsParamsManager')

module.exports = class extends BaseDeployer {
  constructor(config, environment, output, changes = {}) {
    super(environment, output, undefined, logger)
    this.config = config
    this.encoder = new CallsEncoder()
    this.changes = changes
  }

  async call() {
    (typeof this.config.governor.config === 'string')
      ? (await this.updateSubscriptionsConfig())
      : (await this.updateSubscriptionsConfigThroughDAO())
  }

  async updateSubscriptionsConfig() {
    const { modules: { subscriptions: address } } = this.config
    const Subscriptions = await this.environment.getArtifact('CourtSubscriptions', '@aragon/court')
    const subscriptions = await Subscriptions.at(address)

    if (this.changes.feeToken) {
      logger.info('Setting fee token...')
      await subscriptions.setFeeToken(config.feeToken.address, config.feeAmount)
      logger.success('Fee token set successfully')
    } else if (this.changes.feeAmount) {
      logger.info('Setting fee amount...')
      await subscriptions.setFeeAmount(config.feeAmount)
      logger.success('Fee amount set successfully')
    }

    if (this.changes.prePaymentPeriods) {
      logger.info('Setting pre payment periods...')
      await subscriptions.prePaymentPeriods(config.prePaymentPeriods)
      logger.success('Pre payment periods set successfully')
    }

    if (this.changes.latePaymentPenaltyPct) {
      logger.info('Setting late payment penalty pct...')
      await subscriptions.setLatePaymentPenaltyPct(config.latePaymentPenaltyPct)
      logger.success('Late payment penalty pct set successfully')
    }

    if (this.changes.governorSharePct) {
      logger.info('Setting governor share pct...')
      await subscriptions.setGovernorSharePct(config.governorSharePct)
      logger.success('Governor share pct set successfully')
    }

    if (this.changes.resumePrePaidPeriods) {
      logger.info('Setting resume pre-paid periods...')
      await subscriptions.setResumePrePaidPeriods(config.resumePrePaidPeriods)
      logger.success('Resume pre-paid periods set successfully')
    }
  }

  async updateSubscriptionsConfigThroughDAO() {
    logger.info('Building EVM script to configure subscriptions params through DAO...')
    const { subscriptions: config, governor: { config: dao } } = this.config

    if (this.feeToken) this._addSetFeeTokenAction(config.feeToken.address, config.feeAmount)
    else if (this.feeAmount) this._addSetterAction('setFeeAmount', config.feeAmount)

    if (this.prePaymentPeriods) this._addSetterAction('setPrePaymentPeriods', config.prePaymentPeriods)
    if (this.latePaymentPenaltyPct) this._addSetterAction('setLatePaymentPenaltyPct', config.latePaymentPenaltyPct)
    if (this.governorSharePct) this._addSetterAction('setGovernorSharePct', config.governorSharePct)
    if (this.resumePrePaidPeriods) this._addSetterAction('setResumePrePaidPeriods', config.resumePrePaidPeriods)

    await this._encodeAndSubmitEvmScript(dao, this.agentCallsScript, 'Update court subscriptions params')
  }

  _addSetterAction(functionName, param) {
    const { modules: { subscriptions } } = this.config
    const setterData = this.encoder.encodeSubscriptionsOneParamSetter(functionName, param)
    const executeData = this.encoder.encodeExecute(subscriptions, 0, setterData)
    this._addActionToAgentCallsScript(executeData)
  }

  _addSetFeeTokenAction(feeToken, feeAmount) {
    const { modules: { subscriptions } } = this.config
    const setterData = this.encoder.encodeSubscriptionsSetFeeToken(feeToken, feeAmount)
    const executeData = this.encoder.encodeExecute(subscriptions, 0, setterData)
    this._addActionToAgentCallsScript(executeData)
  }

  _addActionToAgentCallsScript(data) {
    const { governor: { config: agent } } = this.config
    if (!this.agentCallsScript) this.agentCallsScript = []
    this.agentCallsScript.push({ to: agent, data: data })
  }
}
