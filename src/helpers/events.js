const abi = require('web3-eth-abi')

const decodeEvents = (logs, contractAbi, eventName) => {
  const eventAbi = contractAbi.filter(abi => abi.name === eventName && abi.type === 'event')[0]
  const eventSignature = abi.encodeEventSignature(eventAbi)
  const eventLogs = logs.filter(l => l.topics[0] === eventSignature)
  return eventLogs.map(log => {
    log.event = eventAbi.name
    log.args = abi.decodeLog(eventAbi.inputs, log.data, log.topics.slice(1))
    return log
  })
}

const getInstalledApps = (logs, appId, kernel) => {
  const events = decodeEvents(logs, kernel.abi, 'NewAppProxy')
  const appEvents = events.filter(event => event.args.appId === appId)
  const installedAddresses = appEvents.map(event => event.args.proxy)
  return installedAddresses
}

const getInstalledAppsById = (logs, appIds, kernel) => {
  return Object.keys(appIds).reduce((apps, appName) => {
    const addresses = getInstalledApps(logs, appIds[appName], kernel)
    if (addresses.length > 0) apps[appName] = addresses
    return apps
  }, {})
}

module.exports = {
  decodeEvents,
  getInstalledApps,
  getInstalledAppsById
}
