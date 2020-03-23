const path = require('path')
const Verifier = require('../models/shared/Verifier')
const WrapperPresaleDeployer = require('../models/deployers/WrapperPresaleDeployer')

const command = 'deploy-wrapper-presale'
const describe = 'Deploy presale wrapper'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output/wrapper-presale' },
  config: { alias: 'c', describe: 'Presale wrapper config JS file', type: 'string', default: './data/config/wrapper-presale' },
  verify: { describe: 'Verify deployed contracts on Etherscan, provide API key', type: 'string' },
}

const handlerAsync = async (environment, { network, output: outputDir, config: configFilename, verify: apiKey }) => {
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}.${network}.json`)
  const config = require(path.resolve(process.cwd(), configFilename))[network]

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
