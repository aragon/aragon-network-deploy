const path = require('path')
const SubscriptionsParamsManager = require('../models/modules/SubscriptionsParamsManager')

const command = 'set-subscriptions-params'
const describe = 'Change subscriptions parameters'

const builder = {
  input: { alias: 'i', describe: 'Subscriptions config JS file', type: 'string', default: './data/input/court-addresses' },
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output' },
  feeToken: { describe: 'Change fee token', type: 'boolean', default: false },
  feeAmount: { describe: 'Change fee amount', type: 'boolean', default: false },
  prePaymentPeriods: { describe: 'Change pre payment periods', type: 'boolean', default: false },
  latePaymentPenaltyPct: { describe: 'Change late payment penalty pct', type: 'boolean', default: false },
  governorSharePct: { describe: 'Change governor share pct', type: 'boolean', default: false },
  resumePrePaidPeriods: { describe: 'Change resume pre-paid periods', type: 'boolean', default: false },
}

const handlerAsync = async (environment, {
  network,
  input,
  feeToken,
  feeAmount,
  prePaymentPeriods,
  latePaymentPenaltyPct,
  governorSharePct,
  resumePrePaidPeriods,
}) => {
  const requestedChanges = feeToken || feeAmount || prePaymentPeriods || latePaymentPenaltyPct || governorSharePct || resumePrePaidPeriods
  if (!requestedChanges) throw Error('Please indicate at least one parameter to change')

  const config = require(path.resolve(process.cwd(), input))[network]
  const params = { feeToken, feeAmount, prePaymentPeriods, latePaymentPenaltyPct, governorSharePct, resumePrePaidPeriods }
  const manager = new SubscriptionsParamsManager(config, environment, params)
  await manager.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
