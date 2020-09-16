const path = require('path')
const Verifier = require('../models/shared/Verifier')
const ANCouncilVotingAppInstaller = require('../models/upgrades/ANCouncilVotingAppInstaller')

const command = 'install-voting'
const describe = 'Install voting app into the AN Council DAO and set permissions'

const builder = {
  input: { alias: 'i', describe: 'config JS file', type: 'string', default: './data/input/voting-installation' },
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output/voting-installation' },
  verify: { describe: 'Verify deployed contracts on Etherscan, provide API key', type: 'string' },
}

const handlerAsync = async (environment, { network, input, output: outputDir, verify: apiKey }) => {
  const config = require(path.resolve(process.cwd(), input))[network]
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}.${network}.json`)

  const verifier = apiKey ? new Verifier(environment, apiKey) : undefined
  const deployer = new ANCouncilVotingAppInstaller(config, environment, outputFilepath, verifier)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
