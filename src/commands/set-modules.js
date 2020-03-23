const path = require('path')
const ControllerModulesManager = require('../models/modules/ControllerModulesManager.js')

const command = 'set-modules'
const describe = 'Change controller modules'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output' },
  config: { alias: 'c', describe: 'Controller modules config JS file', type: 'string', default: './data/config/controller-modules-setter.js' },
  voting: { describe: 'Set voting module', type: 'string' },
  treasury: { describe: 'Set treasury module', type: 'string' },
  subscriptions: { describe: 'Set subscriptions module', type: 'string' },
  jurorsRegistry: { describe: 'Set jurors registry module', type: 'string' },
  disputeManager: { describe: 'Set dispute manager module', type: 'string' },
}

const handlerAsync = async (environment, {
  network,
  output: outputDir,
  config: configFilename,
  voting,
  treasury,
  subscriptions,
  jurorsRegistry,
  disputeManager,
}) => {
  const requestedChanges = voting || treasury || subscriptions || jurorsRegistry || disputeManager
  if (!requestedChanges) throw Error('Please indicate at least one module to be set')

  const outputFilepath = path.resolve(process.cwd(), `${outputDir}/${command}.${network}.json`)
  const config = require(path.resolve(process.cwd(), configFilename))[network]

  const manager = new ControllerModulesManager(config, environment, outputFilepath, {
    voting,
    treasury,
    subscriptions,
    jurorsRegistry,
    disputeManager
  })

  await manager.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
