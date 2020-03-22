const BaseDeployer = require('../shared/BaseDeployer')
const logger = require('../../helpers/logger')('UniswapWrapperDeployer')

const VERSION = 'v1.0'

const VERIFICATION_HEADERS = [
  'Commit sha: e96cb7fa7834f8727102a55f0ee1192387da0a26',
  'GitHub repository: https://github.com/aragonone/court-presale-activate',
  'Tool used for the deploy: https://github.com/aragon/aragon-network-deploy',
]

module.exports = class extends BaseDeployer {
  constructor(config, environment, output, verifier = undefined) {
    super(environment, output, verifier)
    this.config = config
  }

  async call() {
    const address = this.previousDeploy.address
    const UniswapWrapper = await this.environment.getArtifact('UniswapWrapper', '@aragon/court-presale-activate')

    if (address) await this._loadWrapper(UniswapWrapper, address)
    else await this._deployWrapper(UniswapWrapper)
    await this._verifyWrapper()
  }

  async _loadWrapper(UniswapWrapper, address) {
    logger.warn(`Using previous deployed UniswapWrapper instance at ${address}`)
    this.wrapper = await UniswapWrapper.at(address)
  }

  async _deployWrapper(UniswapWrapper) {
    const { owner, bondedToken, registry, uniswap } = this.config
    const ownerAddress = typeof owner === 'string' ? owner : owner.agent
    this._printWrapperDeploy(ownerAddress)

    this.wrapper = await UniswapWrapper.new(ownerAddress, bondedToken, registry, uniswap)
    const { address, transactionHash } = this.wrapper
    logger.success(`Created UniswapWrapper instance at ${address}`)
    this._saveDeploy({ address, transactionHash, version: VERSION })
  }

  async _verifyWrapper() {
    if (this.verifier && this.previousDeploy && !this.previousDeploy.verification) {
      const url = await this.verifier.call(this.wrapper, '@aragon/court-presale-activate', VERIFICATION_HEADERS)
      const { address, transactionHash, version } = this.wrapper
      this._saveDeploy({ address, transactionHash, version, verification: url })
    }
  }

  _printWrapperDeploy(ownerAddress) {
    logger.info('Deploying UniswapWrapper contract:')
    logger.info(` - Owner:                                    ${ownerAddress}`)
    logger.info(` - Bonded Token:                             ${this.config.bondedToken}`)
    logger.info(` - Jurors Registry:                          ${this.config.registry}`)
    logger.info(` - Uniswap:                                  ${this.config.uniswap}`)
  }
}
