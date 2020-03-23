const path = require('path')
const Verifier = require('../models/shared/Verifier')
const MiniMeDeployer = require('../models/deployers/MiniMeDeployer')

const command = 'deploy-minime'
const describe = 'Deploy ANJ token contract'

const builder = {
  input: { alias: 'i', describe: 'MiniMe config JS file', type: 'string', default: './data/input/minime' },
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output/minime' },
  verify: { describe: 'Verify deployed contracts on Etherscan, provide API key', type: 'string' },
}

const handlerAsync = async (environment, { network, input, output: outputDir, verify: apiKey }) => {
  const config = require(path.resolve(process.cwd(), input))[network]
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}.${network}.json`)

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
