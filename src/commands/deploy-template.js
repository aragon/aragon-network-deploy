const path = require('path')
const Verifier = require('../models/shared/Verifier')
const EOPBCTemplateDeployer = require('../models/deployers/EOPBCTemplateDeployer')

const command = 'deploy-template'
const describe = 'Deploy and instantiate EOPBC template'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output/template' },
  config: { alias: 'c', describe: 'EOPBC template config JS file', type: 'string', default: './data/config/template' },
  verify: { describe: 'Verify deployed contracts on Etherscan, provide API key', type: 'string' },
}

const handlerAsync = async (environment, { network, verify: apiKey, output: outputDir, config: configFilename }) => {
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}.${network}.json`)
  const config = require(path.resolve(process.cwd(), configFilename))[network]

  const verifier = apiKey ? new Verifier(environment, apiKey) : undefined
  const deployer = new EOPBCTemplateDeployer(config, environment, outputFilepath, verifier)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
