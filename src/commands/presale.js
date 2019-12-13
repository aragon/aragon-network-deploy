const path = require('path')
const Verifier = require('../models/Verifier')
const PresaleTemplateDeployer = require('../models/deployers/PresaleTemplateDeployer')

const command = 'presale'
const describe = 'Deploy Court pre-sale contracts'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output' },
  config: { alias: 'c', describe: 'Court config JSON file', type: 'string', default: `./data/config/${command}.js` },
  verify: { describe: 'Verify deployed contracts on Etherscan, provide API key', type: 'string' },
  instance: { describe: 'Deploy an instance of the template', type: 'boolean', default: false },
  evmScript: { describe: 'Generate EVM script to change bonded token controller and deploy an instance of the template', type: 'boolean', default: false },
}

const handlerAsync = async (environment, { network, verify: apiKey, output: outputDir, config: configFilename, instance: deployInstance, evmScript: generateEvmScript }) => {
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}/${command}.${network}.json`)
  const config = require(path.resolve(process.cwd(), configFilename))[network]

  const verifier = apiKey ? new Verifier(environment, apiKey) : undefined

  const deployer = new PresaleTemplateDeployer(config, environment, outputFilepath, verifier, deployInstance, generateEvmScript)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
