const { bn } = require('../../src/helpers/numbers')
const { mainnet: { agent, tokenManager, voting } } = require('./ANDAO')

// 2020, Feb 10th 16.00 UTC, three years after: https://twitter.com/AragonProject/status/830013470737309697
const START_DATE = Math.floor(new Date('2020-02-10T16:00:00.000Z') / 1000)

module.exports = {
  owner:              agent,                                              // Agent of AN DAO
  bondedToken:        '0xcD62b1C403fa761BAadFC74C525ce2B51780b184',       // ANJ
  aragonNetworkDAO: {
    voting,
    tokenManager,
  },
  court:              '0xee4650cBe7a2B23701D416f58b41D8B76b617797',       // Court's controller
  disputeManager:     '0xCb36d7614ED8283cBb7e606AF876c75b372bB859',       // Original Dispute Manager
  oldRegistry:        '0xF9dDa954adf5E54b89f988C1560553A0a387CCE1',       // Court's old Jurors Registry instance
  newRegistry:        '0x0F7471C1df2021fF45f112878F755aAbe7AA16bF',       // Court's new Jurors Registry instance
  migrator:           '0x68380629555108aEae92e5a4C92973943073E811',       // Address of the migrator contract
  firstTermStartTime:  bn(START_DATE),                                    // First term start timestamp in seconds
}
