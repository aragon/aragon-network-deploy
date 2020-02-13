const BaseDeployer = require('./BaseDeployer')
const CallsEncoder = require('../CallsEncoder')
const logger = require('../../helpers/logger')('UniswapWrapperDeployer')

const VERSION = 'v1.0'

const VERIFICATION_HEADERS = [
  'Commit sha: e96cb7fa7834f8727102a55f0ee1192387da0a26',
  'GitHub repository: https://github.com/aragonone/court-presale-activate',
  'Tool used for the deploy: https://github.com/aragon/aragon-network-deploy',
]

module.exports = class extends BaseDeployer {
  constructor(
    config,
    environment,
    output,
    verifier = undefined,
  ) {
    super(environment, output, verifier, logger)
    this.config = config
  }

  async call() {
    await this.loadOrDeployWrapper()
    await this.verifyContracts()
  }

  async loadOrDeployWrapper() {
    const { wrapper } = this.previousDeploy
    const UniswapWrapper = await this.environment.getArtifact('UniswapWrapper', '@aragon/court-presale-activate')

    if (wrapper && wrapper.address) {
      logger.warn(`Using previous deployed UniswapWrapper instance at ${wrapper.address}`)
      this.wrapper = await UniswapWrapper.at(wrapper.address)
    } else {
      const { owner, bondedToken, registry, uniswap } = this.config
      this.wrapper = await UniswapWrapper.new(owner, bondedToken, registry, uniswap)
      const { address, transactionHash } = this.wrapper
      logger.success(`Created UniswapWrapper instance at ${address}`)
      this._saveDeploy({ wrapper: { address, transactionHash, version: VERSION }})
    }
  }

  async verifyContracts() {
    if (this.verifier) {
      const wrapper = this.previousDeploy.wrapper
      if (!wrapper || !wrapper.verification) {
        const url = await this.verifier.call(this.wrapper, '@aragon/court-presale-activate', VERIFICATION_HEADERS)
        const { address, transactionHash, version } = wrapper
        this._saveDeploy({ wrapper: { address, transactionHash, version, verification: url } })
      }
    }
  }
}
