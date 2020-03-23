const fs = require('fs')
const path = require('path')
const logger = require('../helpers/logger')('Minter')
const { bigExp } = require('../helpers/numbers')
const { builder: { output: { default: tokenOutputDir } } } = require('./deploy-minime')

const command = 'mint'
const describe = 'Mint amount for a deployed token'

const builder = {
  to: { alias: 'r', describe: 'Recipient address', type: 'string', demand: true },
  token: { alias: 't', describe: 'Token symbol', type: 'string', demand: true },
  amount: { alias: 'a', describe: 'Amount to mint', type: 'string', demand: true },
}

const handlerAsync = async (environment, { network, to, token: symbol, amount }) => {
  const tokenFilepath = path.resolve(process.cwd(), `${tokenOutputDir}.${network}.json`)
  const tokenDeploys = fs.existsSync(tokenFilepath) ? require(tokenFilepath) : {}
  const tokenDeploy = tokenDeploys[symbol]
  if (!tokenDeploy) throw Error(`Could not find any deployed token at ${tokenFilepath} with symbol ${symbol}`)

  logger.info(`Minting ${symbol} ${amount} to ${to} ...`)
  const MiniMeToken = await environment.getArtifact('MiniMeToken', '@aragon/minime')
  const token = await MiniMeToken.at(tokenDeploy.address)
  const decimals = await token.decimals()
  await token.generateTokens(to, bigExp(amount, decimals))
  logger.success(`Minted ${symbol} ${amount} to ${to}`)
}

module.exports = {
  command,
  describe,
  builder,
  handlerAsync
}
