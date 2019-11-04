const path = require('path')
const TruffleContract = require('@truffle/contract')

module.exports = class Artifacts {
  constructor(provider, defaults) {
    this.defaults = defaults
    this.provider = provider
  }

  require(contractName) {
    // TODO: Fix to load the contract artifacts from node modules once dependencies provide them
    const schema = require(this._getLocalBuildPath(contractName))
    const Contract = TruffleContract(schema)
    Contract.defaults(this.defaults)
    Contract.setProvider(this.provider)
    return Contract
  }

  _getLocalBuildPath(contractName) {
    return path.resolve(process.cwd(), `./build/contracts/${contractName}.json`)
  }

  _getNodeModulesPath(dependency, contractName) {
    return `${process.cwd()}/node_modules/${dependency}/build/contracts/${contractName}.json`
  }
}
