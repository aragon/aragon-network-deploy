const fs = require('fs')
const path = require('path')
const Verifier = require('../models/shared/Verifier')
const CourtDeployer = require('../models/deployers/CourtDeployer.v1.0')
const { command: tokenCommand } = require('./deploy-minime')

const command = 'deploy-court'
const describe = 'Deploy Court core contracts v1'

const builder = {
  output: { alias: 'o', describe: 'Output dir', type: 'string', default: './data/output/court' },
  config: { alias: 'c', describe: 'Court config JS file', type: 'string', default: './data/config/court' },
  verify: { describe: 'Verify deployed contracts on Etherscan, provide API key', type: 'string' },
}

const handlerAsync = async (environment, { network, verify: apiKey, output: outputDir, config: configFilename }) => {
  const outputFilepath = path.resolve(process.cwd(), `${outputDir}.${network}.json`)
  const config = require(path.resolve(process.cwd(), configFilename))[network]

  const verifyer = apiKey ? new Verifier(environment, apiKey) : undefined
  const deployer = new CourtDeployer(config, environment, outputFilepath, verifyer)

  const tokenFilepath = path.resolve(process.cwd(), `${outputDir}/${tokenCommand}.${network}.json`)
  const tokenDeploy = fs.existsSync(tokenFilepath) ? require(tokenFilepath) : {}

  const jurorToken = config.jurors.token
  if (!jurorToken.address && tokenDeploy[jurorToken.symbol]) {
    jurorToken.address = tokenDeploy[jurorToken.symbol].address
  }

  const disputesFeeToken = config.court.feeToken
  if (!disputesFeeToken.address && tokenDeploy[disputesFeeToken.symbol]) {
    disputesFeeToken.address = tokenDeploy[disputesFeeToken.symbol].address
  }

  const subscriptionsFeeToken = config.subscriptions.feeToken
  if (!subscriptionsFeeToken.address && tokenDeploy[subscriptionsFeeToken.symbol]) {
    subscriptionsFeeToken.address = tokenDeploy[subscriptionsFeeToken.symbol].address
  }

  await deployer.call()
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
