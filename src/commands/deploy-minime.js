const path = require('path')
const Verifier = require('../models/shared/Verifier')
const MiniMeDeployer = require('../models/deployers/MiniMeDeployer')

const command = 'deploy-minime'
const describe = 'Deploy ANJ token contract'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output/minime' },
  config: { alias: 'c', describe: 'MiniMe config JS file', type: 'string', default: './data/config/minime' },
  verify: { describe: 'Verify deployed contracts on Etherscan, provide API key', type: 'string' },
}

const handlerAsync = async (environment, { network, verify: apiKey, output: outputDir, config: configFilename }) => {
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}.${network}.json`)
  const config = require(path.resolve(process.cwd(), configFilename))[network]

  const verifyer = apiKey ? new Verifier(environment, apiKey) : undefined
  const deployer = new MiniMeDeployer(config, environment, outputFilepath, verifyer)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
