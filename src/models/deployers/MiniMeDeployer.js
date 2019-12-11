const BaseDeployer = require('./BaseDeployer')
const logger = require('../../helpers/logger')('MiniMeDeployer')

const SNAPSHOT_BLOCK = 0
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const TRANSFERS_ENABLED_DEFAULT = true

const VERIFICATION_HEADERS = [
  'Commit sha: 1d5251fc88eee5024ff318d95bc9f4c5de130430',
  'GitHub repository: https://github.com/aragon/minime',
  'Tool used for the deploy: https://github.com/aragon/aragon-network-deploy',
]

module.exports = class extends BaseDeployer {
  constructor(config, environment, output, verifier = undefined) {
    super(environment, output, verifier, logger)
    this.config = config
  }

  async call() {
    const token = this.previousDeploy[this.config.symbol]
    const MiniMeToken = await this.environment.getArtifact('MiniMeToken', '@aragon/minime')

    if (token && token.address) await this._loadMiniMe(MiniMeToken, token.address)
    else await this._deployMiniMe(MiniMeToken)
    await this._verifyMiniMe()
  }

  async _loadMiniMe(MiniMeToken, address) {
    logger.warn(`Using previous deployed ${this.config.symbol} instance at ${address}`)
    this.token = await MiniMeToken.at(address)
  }

  async _deployMiniMe(MiniMeToken) {
    const sender = await this.environment.getSender()
    this._printMiniMeDeploy(sender)
    const { symbol, name, decimals, transfersEnabled, controller } = this.config

    const factory = await this._deployOrLoadMiniMeFactory()
    this.token = await MiniMeToken.new(factory.address, ZERO_ADDRESS, SNAPSHOT_BLOCK, name, decimals, symbol, transfersEnabled || TRANSFERS_ENABLED_DEFAULT)

    if (controller) {
      logger.info(`Transferring ${symbol} controller to specified address ${controller} ...`)
      await this.token.changeController(controller)
    }

    const { address, transactionHash } = this.token
    logger.success(`Created ${symbol} token instance at ${address}`)
    this._saveDeploy({ [symbol]: { address, transactionHash }})
  }

  async _deployOrLoadMiniMeFactory() {
    const { factory } = this.config
    const MiniMeTokenFactory = await this.environment.getArtifact('MiniMeTokenFactory', '@aragon/minime')
    return factory ? MiniMeTokenFactory.at(factory) : MiniMeTokenFactory.new()
  }

  async _verifyMiniMe() {
    const { symbol } = this.config
    const token = this.previousDeploy[symbol]
    if (this.verifier && (!token || !token.verification)) {
      const url = await this.verifier.call(this.token, '@aragon/court', VERIFICATION_HEADERS)
      const { address, transactionHash } = token
      this._saveDeploy({ [symbol]: { address, transactionHash, verification: url } })
    }
  }

  _printMiniMeDeploy(sender) {
    logger.info('Deploying MiniMe contract with config:')
    logger.info(` - Name:                                    ${this.config.name}`)
    logger.info(` - Symbol:                                  ${this.config.symbol}`)
    logger.info(` - Decimals:                                ${this.config.decimals.toString()}`)
    logger.info(` - Controller:                              ${this.config.controller || sender}`)
    logger.info(` - Transfers enabled:                       ${this.config.transfersEnabled ? 'Yes' : 'No'}`)
    logger.info(` - Factory:                                 ${this.config.factory || 'custom deployed one'}`)
  }
}
