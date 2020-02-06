const { bn } = require('../../src/helpers/numbers')

const TERM_DURATION = 60 * 10                                        // 10 minutes
// 2020, Feb 10th 20.00 UTC, three years after: https://twitter.com/AragonProject/status/830013470737309697
const START_DATE = Math.floor(new Date('2020-02-10T20:00:00.000Z') / 1000)

module.exports = {
  owner:              '0x5e8c17a6065c35b172b10e80493d2266e2947df4',       // Agent of AN DAO
  bondedToken:        '0xcD62b1C403fa761BAadFC74C525ce2B51780b184',       // ANJ
  aragonNetworkDAO: {
    votingApp:        '0x240b4de6000b4ad52ceaa1057c2647bfc24ce697',       // Voting of AN DAO
    tokenManager:     '0xda15e525b09266488c95c2742e849ca71683a0f5',       // Token Manager of AN DAO
  },
  court:              '0xee4650cBe7a2B23701D416f58b41D8B76b617797',       // Court's controller
  disputeManager:     '0xCb36d7614ED8283cBb7e606AF876c75b372bB859',       // Original Dispute Manager
  oldRegistry:        '0xF9dDa954adf5E54b89f988C1560553A0a387CCE1',       // Court's old Jurors Registry instance
  newRegistry:        '',       // Court's new Jurors Registry instance
  migrator:           '',       // Address of migrator contract
  firstTermStartTime:  bn(START_DATE),                                    // first term start timestamp in seconds
}
