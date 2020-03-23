const path = require('path')
const Verifier = require('../models/shared/Verifier')
const WrapperBondingDeployer = require('../models/deployers/WrapperBondingDeployer')

const command = 'deploy-wrapper-bonding'
const describe = 'Deploy bonding curve wrapper'

const builder = {
  input: { alias: 'i', describe: 'Bonding curve wrapper config JS file', type: 'string', default: './data/input/wrapper-bonding' },
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output/wrapper-bonding' },
  verify: { describe: 'Verify deployed contracts on Etherscan, provide API key', type: 'string' },
}

const handlerAsync = async (environment, { network, input, output: outputDir, verify: apiKey }) => {
  const config = require(path.resolve(process.cwd(), input))[network]
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}.${network}.json`)

  const verifyer = apiKey ? new Verifier(environment, apiKey) : undefined
  const deployer = new WrapperBondingDeployer(config, environment, outputFilepath, verifyer)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
