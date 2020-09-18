const path = require('path')
const Verifier = require('../models/shared/Verifier')
const VotingAppInstaller = require('../models/apps/VotingAppInstaller')

const command = 'install-voting'
const describe = 'Install Voting app into the governor DAO'

const builder = {
  input: { alias: 'i', describe: 'Voting installation config JS file', type: 'string', default: './data/input/voting-installation' },
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output/voting-installation' },
  verify: { describe: 'Verify deployed contracts on Etherscan, provide API key', type: 'string' },
}

const handlerAsync = async (environment, { network, input, output: outputDir, verify: apiKey }) => {
  const config = require(path.resolve(process.cwd(), input))[network]
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}.${network}.json`)

  const verifier = apiKey ? new Verifier(environment, apiKey) : undefined
  const deployer = new VotingAppInstaller(config, environment, outputFilepath, verifier)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
