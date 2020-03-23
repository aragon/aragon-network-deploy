const { bn } = require('../../src/helpers/numbers')
const { rinkeby: { agent, tokenManager, voting } } = require('./ANDAO')

const TERM_DURATION = 60 * 10                                        // 10 minutes
const START_DATE = Math.floor(new Date() / 1000 + 2 * TERM_DURATION) // 20 minutes from now

module.exports = {
  owner:              agent,                                              // Agent of AN DAO
  bondedToken:        '0x975Ef6B5fde81C24C4Ec605091f2e945872b6036',       // ANJ
  aragonNetworkDAO: {
    voting,
    tokenManager,
  },
  court:              '0xB5fFBe75FA785725eeA5f931b64FC04E516C9C5D',       // Court's controller
  disputeManager:     '0x830E8f727355Bb1949FA6b0b91D934A64e59BfEb',       // Original Dispute Manager
  oldRegistry:        '0xe089e929FFf1912796F55a0f09fA23190F94eD78',       // Court's old Jurors Registry instance
  newRegistry:        undefined,                                          // Court's new Jurors Registry instance (TBD)
  migrator:           undefined,                                          // Address of the migrator contract (TBD)
  firstTermStartTime:  bn(START_DATE),                                    // First term start timestamp in seconds
}
