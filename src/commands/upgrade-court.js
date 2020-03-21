const fs = require('fs')
const path = require('path')
const Verifier = require('../models/Verifier')
const CourtUpgrader = require('../models/upgrades/CourtUpgrader.v1.1')
const { command: tokenCommand } = require('../commands/minime')

const command = 'upgrade-court'
const describe = 'Upgrade Court core contracts to v1.1'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output' },
  config: { alias: 'c', describe: 'Court config JS file', type: 'string', default: './data/config/court.js' },
  verify: { describe: 'Verify deployed contracts on Etherscan, provide API key', type: 'string' },
}

const handlerAsync = async (environment, { network, verify: apiKey, output: outputDir, config: configFilename }) => {
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}/court.${network}.json`)
  const config = require(path.resolve(process.cwd(), configFilename))[network]

  const verifyer = apiKey ? new Verifier(environment, apiKey) : undefined

  const tokenFilepath = path.resolve(process.cwd(), `${outputDir}/${tokenCommand}.${network}.json`)
  const tokenDeploy = fs.existsSync(tokenFilepath) ? require(tokenFilepath) : {}

  const jurorToken = config.jurors.token
  if (!jurorToken.address && tokenDeploy[jurorToken.symbol]) {
    jurorToken.address = tokenDeploy[jurorToken.symbol].address
  }

  const deployer = new CourtUpgrader(config, environment, outputFilepath, verifyer)
  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
