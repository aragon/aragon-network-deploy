const fs = require('fs')
const path = require('path')
const logger = require('../helpers/logger')('Minter')
const { bigExp } = require('../helpers/numbers')
const { command: tokenCommand } = require('../commands/minime')

const command = 'mint'
const describe = 'Mint amount for a deployed token'

const builder = {
  to: { alias: 'r', describe: 'Recipient address', type: 'string', demand: true },
  token: { alias: 't', describe: 'Token symbol', type: 'string', demand: true },
  amount: { alias: 'a', describe: 'Amount to mint', type: 'string', demand: true },
  output: { alias: 'o', describe: 'Output dir to read deployed tokens', type: 'string', default: './data/output' },
}

const handlerAsync = async (environment, { network, to, token: symbol, amount, output: outputDir }) => {
  const tokenFilepath = path.resolve(process.cwd(), `${outputDir}/${tokenCommand}.${network}.json`)
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
