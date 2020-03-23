const path = require('path')
const Verifier = require('../models/shared/Verifier')
const PresaleTemplateDeployer = require('../models/deployers/PresaleTemplateDeployer')

const command = 'deploy-presale'
const describe = 'Deploy Court pre-sale contracts'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output/presale' },
  config: { alias: 'c', describe: 'Presale config JS file', type: 'string', default: './data/config/presale' },
  verify: { describe: 'Verify deployed contracts on Etherscan, provide API key', type: 'string' },
  print: { describe: 'Print installed apps for a given tx receipt', type: 'string' },
  wrapper: { describe: 'Deploy wrapper', type: 'boolean', default: false },
}

const handlerAsync = async (environment, { network, verify: apiKey, output: outputDir, config: configFilename, print: printFundraisingAddresses, wrapper: deployWrapper }) => {
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}.${network}.json`)
  const config = require(path.resolve(process.cwd(), configFilename))[network]

  const verifier = apiKey ? new Verifier(environment, apiKey) : undefined
  const deployer = new PresaleTemplateDeployer(config, environment, outputFilepath, verifier, printFundraisingAddresses, deployWrapper)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
