const Web3 = require('web3')
const Artifacts = require('./Artifacts')
const TruffleConfig = require('@truffle/config')

module.exports = class {
  constructor(network, sender = undefined) {
    this.network = network
    this.sender = sender
  }

  async getArtifact(contractName) {
    const artifacts = await this.getArtifacts()
    return artifacts.require(contractName)
  }

  async getArtifacts() {
    if (!this.artifacts) {
      let { from, gasPrice, gas, provider } = this._getNetworkConfig()
      if (!from) from = await this.getSender()
      const defaults = { from, gasPrice, gas }
      this.artifacts = new Artifacts(provider, defaults)
    }
    return this.artifacts
  }

  async getSender() {
    if (!this.sender) {
      const web3 = this.getWeb3()
      const accounts = await web3.eth.getAccounts()
      this.sender = accounts[0]
    }
    return this.sender
  }

  getWeb3() {
    if (!this.web3) {
      const { provider } = this._getNetworkConfig()
      this.web3 = new Web3(provider)
    }
    return this.web3
  }

  _getNetworkConfig() {
    if (!this.config) {
      this.config = TruffleConfig.detect({ logger: console })
      this.config.network = this.network
    }
    return this.config
  }
}
