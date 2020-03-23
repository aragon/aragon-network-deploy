const path = require('path')
const SubscriptionsParamsManager = require('../models/modules/SubscriptionsParamsManager')

const command = 'set-subscriptions-params'
const describe = 'Change subscriptions parameters'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output' },
  config: { alias: 'c', describe: 'Subscriptions config JS file', type: 'string', default: './data/config/subscriptions-params-setter.js' },
  feeToken: { describe: 'Change fee token', type: 'boolean', default: false },
  feeAmount: { describe: 'Change fee amount', type: 'boolean', default: false },
  prePaymentPeriods: { describe: 'Change pre payment periods', type: 'boolean', default: false },
  latePaymentPenaltyPct: { describe: 'Change late payment penalty pct', type: 'boolean', default: false },
  governorSharePct: { describe: 'Change governor share pct', type: 'boolean', default: false },
  resumePrePaidPeriods: { describe: 'Change resume pre-paid periods', type: 'boolean', default: false },
}

const handlerAsync = async (environment, {
  network,
  output: outputDir,
  config: configFilename,
  feeToken,
  feeAmount,
  prePaymentPeriods,
  latePaymentPenaltyPct,
  governorSharePct,
  resumePrePaidPeriods,
}) => {
  const requestedChanges = feeToken || feeAmount || prePaymentPeriods || latePaymentPenaltyPct || governorSharePct || resumePrePaidPeriods
  if (!requestedChanges) throw Error('Please indicate at least one parameter to change')

  const outputFilepath = path.resolve(process.cwd(), `${outputDir}/${command}.${network}.json`)
  const config = require(path.resolve(process.cwd(), configFilename))[network]

  const manager = new SubscriptionsParamsManager(config, environment, outputFilepath, {
    feeToken,
    feeAmount,
    prePaymentPeriods,
    latePaymentPenaltyPct,
    governorSharePct,
    resumePrePaidPeriods,
  })

  await manager.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
