const path = require('path')
const ControllerModulesManager = require('../models/modules/ControllerModulesManager.js')

const command = 'set-modules'
const describe = 'Change controller modules'

const builder = {
  input: { alias: 'i', describe: 'Controller modules config JS file', type: 'string', default: './data/input/court-addresses' },
  voting: { describe: 'Set voting module', type: 'string' },
  treasury: { describe: 'Set treasury module', type: 'string' },
  subscriptions: { describe: 'Set subscriptions module', type: 'string' },
  jurorsRegistry: { describe: 'Set jurors registry module', type: 'string' },
  disputeManager: { describe: 'Set dispute manager module', type: 'string' },
}

const handlerAsync = async (environment, { network, input, voting, treasury, subscriptions, jurorsRegistry, disputeManager }) => {
  const requestedChanges = voting || treasury || subscriptions || jurorsRegistry || disputeManager
  if (!requestedChanges) throw Error('Please indicate at least one module to be set')

  const config = require(path.resolve(process.cwd(), input))[network]
  const modules = { voting, treasury, subscriptions, jurorsRegistry, disputeManager }
  const manager = new ControllerModulesManager(config, environment, modules)
  await manager.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
