const path = require('path')
const CourtDeployer = require('../models/deployers/CourtDeployer')

const command = 'court'
const describe = 'Deploy Court core contracts'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output' },
  config: { alias: 'c', describe: 'Court config JSON file', type: 'string', default: './data/config/court.js' },
}

const handlerAsync = async (environment, { network, output: outputDir, config: configFilename }) => {
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}/${command}.${network}.json`)
  const config = require(path.resolve(process.cwd(), configFilename))[network]
  const deployer = new CourtDeployer(config, environment, outputFilepath)

  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
