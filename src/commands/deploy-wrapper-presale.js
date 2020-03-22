const path = require('path')
const Verifier = require('../models/shared/Verifier')
const WrapperPresaleDeployer = require('../models/deployers/WrapperPresaleDeployer')

const command = 'deploy-wrapper-presale'
const describe = 'Deploy presale wrapper'

const builder = {
  input: { alias: 'i', describe: 'Presale wrapper config JS file', type: 'string', default: './data/input/wrapper-presale' },
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output/wrapper-presale' },
  verify: { describe: 'Verify deployed contracts on Etherscan, provide API key', type: 'string' },
}

const handlerAsync = async (environment, { network, input, output: outputDir, verify: apiKey }) => {
  const config = require(path.resolve(process.cwd(), input))[network]
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}.${network}.json`)

  const verifyer = apiKey ? new Verifier(environment, apiKey) : undefined
  const deployer = new WrapperPresaleDeployer(config, environment, outputFilepath, verifyer)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
