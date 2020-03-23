const path = require('path')
const Verifier = require('../models/shared/Verifier')
const UniswapWrapperDeployer = require('../models/deployers/UniswapWrapperDeployer')

const command = 'deploy-uniswap-wrapper'
const describe = 'Deploy Uniswap wrapper'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output/uniswap-wrapper' },
  config: { alias: 'c', describe: 'Uniswap wrapper config JS file', type: 'string', default: './data/config/uniswap-wrapper' },
  verify: { describe: 'Verify deployed contracts on Etherscan, provide API key', type: 'string' },
}

const handlerAsync = async (environment, { network, output: outputDir, config: configFilename, verify: apiKey }) => {
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}.${network}.json`)
  const config = require(path.resolve(process.cwd(), configFilename))[network]

  const verifyer = apiKey ? new Verifier(environment, apiKey) : undefined
  const deployer = new UniswapWrapperDeployer(config, environment, outputFilepath, verifyer)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
