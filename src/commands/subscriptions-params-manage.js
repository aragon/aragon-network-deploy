const path = require('path')
const SubscriptionsParamsManager = require('../models/deployers/SubscriptionsParamsManager')

const command = 'subscriptions-params-manage'
const describe = 'Change Subscriptions parameters'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output' },
  config: { alias: 'c', describe: 'Management config JSON file', type: 'string', default: './data/config/subscriptions-params-management.js' },
  feeToken: { describe: 'Set ', type: 'string', default: false },
  feeAmount: { describe: 'Set ', type: 'string', default: false },
  prePaymentPeriods: { describe: 'Set ', type: 'string', default: false },
  latePaymentPenaltyPct: { describe: 'Set ', type: 'string', default: false },
  governorSharePct: { describe: 'Set ', type: 'string', default: false },
  resumePrePaidPeriods: { describe: 'Set ', type: 'string', default: false },
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
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}/${command}.${network}.json`)
  const config = require(path.resolve(process.cwd(), configFilename))[network]

  const deployer = new SubscriptionsParamsManager(
    config,
    environment,
    outputFilepath,
    feeToken,
    feeAmount,
    prePaymentPeriods,
    latePaymentPenaltyPct,
    governorSharePct,
    resumePrePaidPeriods,
)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}