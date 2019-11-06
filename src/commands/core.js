const path = require('path')
const CoreDeployer = require('../models/CoreDeployer')

const command = 'core'
const describe = 'Deploy Court core contracts'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: '.' },
  config: { alias: 'i', describe: 'Court config JSON file', type: 'string', default: './court-config.js' },
}

const handlerAsync = async (environment, { output, config: configFilename }) => {
  const outputFilepath = path.resolve(process.cwd(), `${output}/core.json`)
  const config = require(path.resolve(process.cwd(), configFilename))
  const deployer = new CoreDeployer(config, environment, outputFilepath)

  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
