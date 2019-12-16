const path = require('path')
const Verifier = require('../models/Verifier')
const FaucetDeployer = require('../models/deployers/FaucetDeployer')

const command = 'faucet'
const describe = 'Deploy ERC20 faucet contract'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output' },
  config: { alias: 'c', describe: 'Faucet config JSON file', type: 'string', default: `./data/config/${command}.js` },
  verify: { describe: 'Verify deployed contracts on Etherscan, provide API key', type: 'string' },
}

const handlerAsync = async (environment, { network, verify: apiKey, output: outputDir, config: configFilename }) => {
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}/${command}.${network}.json`)
  const config = require(path.resolve(process.cwd(), configFilename))[network]

  const verifyer = apiKey ? new Verifier(environment, apiKey) : undefined
  const deployer = new FaucetDeployer(config, environment, outputFilepath, verifyer)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
