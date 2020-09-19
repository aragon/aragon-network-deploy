const path = require('path')
const Verifier = require('../models/shared/Verifier')
const GovernorTransitioner = require('../models/apps/GovernorTransitioner')

const command = 'transition-governor'
const describe = 'Transition Governor from AN Council to AN DAO'

const builder = {
  input: { alias: 'i', describe: 'config JS file', type: 'string', default: './data/input/transition-governor' },
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output/transition-governor' },
  verify: { describe: 'Verify deployed contracts on Etherscan, provide API key', type: 'string' },
}

const handlerAsync = async (environment, { network, input, output: outputDir, verify: apiKey }) => {
  const config = require(path.resolve(process.cwd(), input))[network]
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}.${network}.json`)

  const verifier = apiKey ? new Verifier(environment, apiKey) : undefined
  const deployer = new GovernorTransitioner(config, environment, outputFilepath, verifier)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
