const environments = require('./court')

Object.keys(environments).map(network => {
  environments[network].subscriptions.address = require(`../output/court.${network}`).subscriptions.address
})

module.exports = environments
