const environments = require('./court')
const { requireOutput } = require('../../src/helpers/require-output')

Object.keys(environments).map(network => {
  const courtAddresses = requireOutput(`court.${network}`, addresses =>
    Object.keys(addresses).reduce((output, module) => {
      output[module] = addresses[module].address
      return output
    }, {}), {})

  const { court, disputes, subscriptions, voting, treasury, registry } = courtAddresses
  environments[network].modules = { court, voting, treasury, subscriptions, disputeManager: disputes, jurorsRegistry: registry }
})

module.exports = environments
