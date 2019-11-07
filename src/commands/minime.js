const fs = require('fs')
const path = require('path')
const MiniMeDeployer = require('../models/deployers/MiniMeDeployer')

const command = 'minime'
const describe = 'Deploy ANJ token contract'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output' },
  config: { alias: 'c', describe: 'Court config JSON file', type: 'string', default: `./data/config/${command}.js` },
}

const handlerAsync = async (environment, { network, output: outputDir, config: configFilename }) => {
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}/${command}.${network}.json`)
  const config = require(path.resolve(process.cwd(), configFilename))[network]
  const deployer = new MiniMeDeployer(config, environment, outputFilepath)

  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
