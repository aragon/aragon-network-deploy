const TruffleConfig = require('@aragon/truffle-config-v5/truffle-config')

TruffleConfig.compilers.solc.version = '0.5.8'
TruffleConfig.networks.rpc.gas = 7e6

module.exports = TruffleConfig
