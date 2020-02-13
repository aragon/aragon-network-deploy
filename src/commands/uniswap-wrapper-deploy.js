const path = require('path')
const Verifier = require('../models/Verifier')
const UniswapWrapperDeployer = require('../models/deployers/UniswapWrapperDeployer')

const command = 'uniswap-wrapper-deploy'
const describe = 'Deploy Uniswap Wrapper'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output' },
  config: { alias: 'c', describe: 'Uniswap wrapper config JSON file', type: 'string', default: './data/config/uniswap-wrapper.js' },
  verify: { describe: 'Verify deployed contracts on Etherscan, provide API key', type: 'string' },
}

const handlerAsync = async (environment, {
  network,
  output: outputDir,
  config: configFilename,
  verify: apiKey,
}) => {
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}/uniswap-wrapper.${network}.json`)
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
