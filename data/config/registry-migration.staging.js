const { bn } = require('../../src/helpers/numbers')
const { staging: { agent, tokenManager, voting } } = require('./ANDAO')

const TERM_DURATION = 60 * 10                                        // 10 minutes
const START_DATE = Math.floor(new Date() / 1000 + 2 * TERM_DURATION) // 20 minutes from now

module.exports = {
  owner:              agent,                                              // Agent of AN DAO
  bondedToken:        '0xae83b8A9983b934Ebed4167BfDC4170d2A1E3D76',       // ANJ
  aragonNetworkDAO: {
    voting,
    tokenManager,
  },
  court:              '0xD0DcFC6B5b36f7E77f3Daa2D9031B241651A6916',       // Court's controller
  disputeManager:     '0x8a8b31a2a20bb6153625c1D37c5E9bfBb52a30b7',       // Original Dispute Manager
  oldRegistry:        '0x3497b2F7eEB7f1BeEFb044c6DA90110C4D6d5C4E',       // Court's old Jurors Registry instance
  newRegistry:        undefined,                                          // Court's new Jurors Registry instance (TBD)
  migrator:           undefined,                                          // Address of the migrator contract (TBD)
  firstTermStartTime:  bn(START_DATE),                                    // First term start timestamp in seconds
}
