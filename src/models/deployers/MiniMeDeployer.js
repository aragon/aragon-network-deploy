const BaseDeployer = require('./BaseDeployer')
const logger = require('../../helpers/logger')('MiniMeDeployer')

const SNAPSHOT_BLOCK = 0
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const TRANSFERS_ENABLED_DEFAULT = true

module.exports = class extends BaseDeployer {
  constructor(config, environment, output) {
    super(environment, output, logger)
    this.config = config
  }

  async call() {
    const token = this.previousDeploy[this.config.symbol]
    const MiniMeToken = await this.environment.getArtifact('MiniMeToken', '@aragon/minime')

    if (token && token.address) await this._loadMiniMe(MiniMeToken, token.address)
    else await this._deployMiniMe(MiniMeToken)
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
