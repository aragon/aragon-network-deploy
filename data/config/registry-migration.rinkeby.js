const { bn } = require('../../src/helpers/numbers')

const TERM_DURATION = 60 * 10                                        // 10 minutes
const START_DATE = Math.floor(new Date() / 1000 + 2 * TERM_DURATION) // 20 minutes from now

module.exports = {
  owner:              '0x9aedfbe0f3ed33cbb71f937cb9eb0ff1f4dfc076',       // Agent of AN DAO
  bondedToken:        '0x975Ef6B5fde81C24C4Ec605091f2e945872b6036',       // ANJ
  aragonNetworkDAO: {
    votingApp:        '0xb0c839957bc47541d747e5238c06990e3a41c2a3',       // Voting of AN DAO
    tokenManager:     '0x0cc31e2d5117d25fe50ee9d569613851e6bb0dd9',       // Token Manager of AN DAO
  },
  court:              '0xB5fFBe75FA785725eeA5f931b64FC04E516C9C5D',       // Court's controller
  disputeManager:     '0x830E8f727355Bb1949FA6b0b91D934A64e59BfEb',       // Original Dispute Manager
  oldRegistry:        '0xe089e929FFf1912796F55a0f09fA23190F94eD78',       // Court's old Jurors Registry instance
  newRegistry:        '',       // Court's new Jurors Registry instance
  migrator:           '',       // Address of migrator contract
  firstTermStartTime:  bn(START_DATE),                                    // first term start timestamp in seconds
}
