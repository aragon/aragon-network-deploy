const path = require('path')
const CourtDeployer = require('../models/CourtDeployer')

const command = 'court'
const describe = 'Deploy Court core contracts'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: '.' },
  config: { alias: 'i', describe: 'Court config JSON file', type: 'string', default: './config/court.js' },
}

const handlerAsync = async (environment, { output, config: configFilename }) => {
  const outputFilepath = path.resolve(process.cwd(), `${output}/court.json`)
  const config = require(path.resolve(process.cwd(), configFilename))
  const deployer = new CourtDeployer(config, environment, outputFilepath)

  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
