const ANDAO = require('./ANDAO')

const environments = {
  mainnet: {
    oldRegistry:        '0xF9dDa954adf5E54b89f988C1560553A0a387CCE1',             // Court's old Jurors Registry instance
    newRegistry:        '0x0F7471C1df2021fF45f112878F755aAbe7AA16bF',             // Court's new Jurors Registry instance
    migrator:           '0x68380629555108aEae92e5a4C92973943073E811',             // Address of the migrator contract
    firstTermStartTime:  Math.floor(new Date('2020-02-10T16:00:00.000Z') / 1000), // 2020, Feb 10th 16.00 UTC
  },
  rinkeby: {
    oldRegistry:         '0xe089e929FFf1912796F55a0f09fA23190F94eD78',            // Court's old Jurors Registry instance
    newRegistry:         undefined,                                               // Court's new Jurors Registry instance (TBD)
    migrator:            undefined,                                               // Address of the migrator contract (TBD)
    firstTermStartTime:  Math.floor(new Date() / 1000 + 20 * 60)                  // 20 minutes from now
  },
  staging: {
    oldRegistry:         '0x3497b2F7eEB7f1BeEFb044c6DA90110C4D6d5C4E',            // Court's old Jurors Registry instance
    newRegistry:         undefined,                                               // Court's new Jurors Registry instance (TBD)
    migrator:            undefined,                                               // Address of the migrator contract (TBD)
    firstTermStartTime:  Math.floor(new Date() / 1000 + 20 * 60)                  // 20 minutes from now
  },
  usability: {
    oldRegistry:         '0x8FFD0Adb0Fc03a270dA84b6d10F87ec251296A50',            // Court's old Jurors Registry instance
    newRegistry:         undefined,                                               // Court's new Jurors Registry instance (TBD)
    migrator:            undefined,                                               // Address of the migrator contract (TBD)
    firstTermStartTime:  Math.floor(new Date() / 1000 + 20 * 60)                  // 20 minutes from now
  },
  ropsten: {
    oldRegistry:         '0x9099eFf2830D6E4A11d60064DD67A3f51409043e',            // Court's old Jurors Registry instance
    newRegistry:         '0x38398c6a6f2fcb0cae0cfef7395162bb9938f720',            // Court's new Jurors Registry instance (TBD)
    migrator:            '0x7720818bc53b41ad04a4346f6740770ca757543e',            // Address of the migrator contract (TBD)
    firstTermStartTime:  Math.floor(new Date() / 1000 + 20 * 60)                  // 20 minutes from now
  },
  rpc: {
    oldRegistry:         undefined,                                               // Court's old Jurors Registry instance
    newRegistry:         undefined,                                               // Court's new Jurors Registry instance (TBD)
    migrator:            undefined,                                               // Address of the migrator contract (TBD)
    firstTermStartTime:  Math.floor(new Date() / 1000 + 20 * 60)                  // 20 minutes from now
  },
}

Object.keys(environments).forEach(network => {
  environments[network].owner = ANDAO[network].agent
  environments[network].court = require(`../output/court.${network}`).court.address
  environments[network].bondedToken = require(`../output/minime.${network}`).ANJ.address
  environments[network].disputeManager = require(`../output/court.${network}`).disputeManager.address
  environments[network].aragonNetworkDAO = {
    voting: ANDAO[network].voting,
    tokenManager: ANDAO[network].tokenManager
  }
})

module.exports = environments
