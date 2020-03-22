const path = require('path')
const Verifier = require('../models/shared/Verifier')
const EOPBCTemplateDeployer = require('../models/deployers/EOPBCTemplateDeployer')

const command = 'deploy-template'
const describe = 'Deploy and instantiate EOPBC template'

const builder = {
  input: { alias: 'i', describe: 'EOPBC template config JS file', type: 'string', default: './data/input/template' },
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output/template' },
  verify: { describe: 'Verify deployed contracts on Etherscan, provide API key', type: 'string' },
}

const handlerAsync = async (environment, { network, input, output: outputDir, verify: apiKey }) => {
  const config = require(path.resolve(process.cwd(), input))[network]
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}.${network}.json`)

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
