const BaseDeployer = require('./BaseDeployer')
const CallsEncoder = require('../CallsEncoder')
const logger = require('../../helpers/logger')('SubscriptionsParams')

module.exports = class extends BaseDeployer {
  constructor(
    config,
    environment,
    output,
    feeToken,
    feeAmount,
    prePaymentPeriods,
    latePaymentPenaltyPct,
    governorSharePct,
    resumePrePaidPeriods,
  ) {
    super(environment, output, undefined, logger)
    this.config = config
    this.encoder = new CallsEncoder()
    this.feeToken = feeToken,
    this.feeAmount = feeAmount,
    this.prePaymentPeriods = prePaymentPeriods,
    this.latePaymentPenaltyPct = latePaymentPenaltyPct,
    this.governorSharePct = governorSharePct,
    this.resumePrePaidPeriods = resumePrePaidPeriods
  }

  async call() {
    await this._generateAndRunEvmScript(logger)
  }

  _generateEvmScript() {
    const {
      aragonNetworkDAO,
      subscriptions,
    } = this.config

    const agentCallsScript = []

    // fee token and amount
    if (this.feeToken) {
      this._addActionToCallsScript(agentCallsScript, aragonNetworkDAO.agent, this._setFeeToken(subscriptions.address, subscriptions.feeToken, subscriptions.feeAmount))
    } else if (this.feeAmount) {
      this._addActionToCallsScript(agentCallsScript, aragonNetworkDAO.agent, this._oneParamSetter(subscriptions.address, 'setFeeAmount', subscriptions.feeAmount))
    }

    // prepayment periods
    if (this.prePaymentPeriods) {
      this._addActionToCallsScript(agentCallsScript, aragonNetworkDAO.agent, this._oneParamSetter(subscriptions.address, 'setPrePaymentPeriods', subscriptions.prePaymentPeriods))
    }

    // late payment penalty pct
    if (this.latePaymentPenaltyPct) {
      this._addActionToCallsScript(agentCallsScript, aragonNetworkDAO.agent, this._oneParamSetter(subscriptions.address, 'setLatePaymentPenaltyPct', subscriptions.latePaymentPenaltyPct))
    }

    // governor pct share
    if (this.governorSharePct) {
      this._addActionToCallsScript(agentCallsScript, aragonNetworkDAO.agent, this._oneParamSetter(subscriptions.address, 'setGovernorSharePct', subscriptions.governorSharePct))
    }

    // resume prepaid periods
    if (this.resumePrePaidPeriods) {
      this._addActionToCallsScript(agentCallsScript, aragonNetworkDAO.agent, this._oneParamSetter(subscriptions.address, 'setResumePrePaidPeriods', subscriptions.resumePrePaidPeriods))
    }

    if (agentCallsScript.length == 0) {
      logger.error('No change requested')
      process.exit(1)
    }

    return this._encodeAgentCallScript(agentCallsScript)
  }

  _addActionToCallsScript(agentCallsScript, agent, data) {
    agentCallsScript.push({
      to: agent,
      data: data
    })
  }

  // sets one param setters
  _oneParamSetter(subscriptionsAddress, functionName, param) {
    const data = this.encoder.encodeSubscriptionsOneParamSetter(functionName, param)
    return this.encoder.encodeExecute(subscriptionsAddress, 0, data)
  }

  // sets Subscription fee token
  _setFeeToken(subscriptionsAddress, feeToken, feeAmount) {
    const data = this.encoder.encodeSubscriptionsSetFeeToken(feeToken, feeAmount)
    return this.encoder.encodeExecute(subscriptionsAddress, 0, data)
  }
}
