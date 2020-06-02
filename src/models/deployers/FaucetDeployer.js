const BaseDeployer = require('../shared/BaseDeployer')
const { tokenToString } = require('../../helpers/numbers')
const logger = require('../../helpers/logger')('MiniMeDeployer')

const VERIFICATION_HEADERS = [
  'Commit sha: a54385006dbd643ab774205ec3b32972b356df77',
  'GitHub repository: https://github.com/aragonone/erc20-faucet',
  'Tool used for the deploy: https://github.com/aragon/aragon-network-deploy',
]

module.exports = class extends BaseDeployer {
  constructor(config, environment, output, verifier = undefined) {
    super(environment, output, verifier)
    this.config = config
  }

  async call() {
    const address = this.previousDeploy.address
    const ERC20Faucet = await this.environment.getArtifact('ERC20Faucet', '@aragonone/erc20-faucet')

    if (address) await this._loadFaucet(ERC20Faucet, address)
    else await this._deployFaucet(ERC20Faucet)
    await this._verifyFaucet()
  }

  async _loadFaucet(ERC20Faucet, address) {
    logger.warn(`Using previous deployed faucet instance at ${address}`)
    this.faucet = await ERC20Faucet.at(address)
  }

  async _deployFaucet(ERC20Faucet) {
    const sender = await this.environment.getSender()
    this._printFaucetDeploy(sender)
    const { owner, tokens } = this.config

    const tokensAddresses = tokens.map(token => token.address)
    const quotaPeriods = tokens.map(token => token.period)
    const quotaAmounts = tokens.map(token => token.amount)
    this.faucet = await ERC20Faucet.new(tokensAddresses, quotaPeriods, quotaAmounts)

    if (owner) {
      logger.info(`Transferring ownership to specified address ${owner} ...`)
      await this.faucet.transferOwnership(owner)
    }

    const { address, transactionHash } = this.faucet
    logger.success(`Created faucet instance at ${address}`)
    this._saveDeploy({ address, transactionHash })
  }

  async _verifyFaucet() {
    if (this.verifier && this.previousDeploy && !this.previousDeploy.verification) {
      const url = await this.verifier.call(this.faucet, '@aragon/erc20-faucet', VERIFICATION_HEADERS)
      const { address, transactionHash } = this.previousDeploy
      this._saveDeploy({ address, transactionHash, verification: url })
    }
  }

  _printFaucetDeploy() {
    logger.info('Deploying ERC20Faucet contract with tokens:')
    logger.info(` - Owner:                                   ${this.config.owner || 'sender address'}`)
    this.config.tokens.forEach(token => {
      logger.info(' - Token:')
      logger.info(`   - Symbol:                                ${token.symbol}`)
      logger.info(`   - Address:                               ${token.address}`)
      logger.info(`   - Quota period:                          ${token.period.toString()} seconds`)
      logger.info(`   - Quota amount:                          ${tokenToString(token.amount, token)}`)
    })
  }
}
