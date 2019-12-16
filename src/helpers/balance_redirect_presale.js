const publishBalanceRedirectPresale = async(environment, config, logger) => {
  const name = 'balance-redirect-presale'
  const fullName = `${name}.aragonpm.eth`
  const contractName = 'BalanceRedirectPresale'

  // check already registered
  const ens = await _fetchENS(environment, config)
  const { hash: namehash } = require('eth-ens-namehash')
  const packageHash = namehash(`${fullName}`)
  const packageOwner = await ens.owner(packageHash)
  const isRegistered = packageOwner !== '0x0000000000000000000000000000000000000000' && packageOwner !== '0x'
  if (isRegistered) {
    logger.warn(`BalanceRedirectPresale already deployed, owner: ${packageOwner}`)
    return
  }

  const BalanceRedirectPresale = await environment.getArtifact(contractName, '@aragon/templates-externally-owned-presale-bonding-curve')
  const balanceRedirectPresale = await BalanceRedirectPresale.new()
  logger.info(`Registering package for ${contractName} as "${fullName}"`)
  const apm = await _fetchRegisteredAPM(environment, config)
  await apm.newRepoWithVersion(name, await environment.getSender(), [1, 0, 0], balanceRedirectPresale.address, '0x')
}

// TODO: remove once BalanceRedirectPresale is in aragen
const _fetchENS = async (environment, config) => {
  const ENS = await environment.getArtifact('ENS', '@aragon/os')
  const { ens: ensAddress } = config.infra
  return await ENS.at(ensAddress)
}

const _fetchRegisteredAPM = async (environment, config) => {
  const { hash: namehash } = require('eth-ens-namehash')
  const aragonPMHash = namehash('aragonpm.eth')
  const ens = await _fetchENS(environment, config)
  const PublicResolver = await environment.getArtifact('PublicResolver', '@aragon/os')
  const resolver = await PublicResolver.at(await ens.resolver(aragonPMHash))
  const apmAddress = await resolver.addr(aragonPMHash)
  const APM = await environment.getArtifact('APMRegistry', '@aragon/os')
  return await APM.at(apmAddress)
}

module.exports = {
  publishBalanceRedirectPresale
}
