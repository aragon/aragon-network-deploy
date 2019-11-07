const { bn, bigExp } = require('../../src/helpers/numbers')

const HOURS_8 = 60 * 60 * 8
const START_DATE = Math.floor(new Date('2020-01-31T12:30:00.000Z') / 1000) // 2020, Jan 31st 12.30 UTC

const ANJ = {
  symbol: 'ANJ',
  decimals: 18,
  address: undefined                                           // TODO
}

const DAI = {
  symbol: 'DAI',
  decimals: 18,
  address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
}

module.exports = {
  governor: {
    funds:                         undefined,                  // TODO
    config:                        undefined,                  // TODO
    modules:                       undefined,                  // TODO
  },
  clock: {
    termDuration:                  bn(HOURS_8),                // terms lasts 8 hours
    firstTermStartTime:            bn(START_DATE),             // first term start timestamp in seconds
  },
  court: {
    feeToken:                      DAI,                        // fee token for the court is DAI
    commitTerms:                   bn(6),                      // vote commits last 6 terms (2 days)
    revealTerms:                   bn(6),                      // vote reveals last 6 terms (2 days)
    appealTerms:                   bn(21),                     // appeals last 21 terms (1 week)
    appealConfirmTerms:            bn(42),                     // appeal confirmations last 42 terms (2 weeks)
    maxJurorsPerDraftBatch:        bn(81),                     // max number of jurors drafted per batch
    jurorFee:                      bigExp(10, DAI.decimals),   // 10 fee tokens for juror fees
    draftFee:                      bigExp(30, DAI.decimals),   // 30 fee tokens for draft fees
    settleFee:                     bigExp(40, DAI.decimals),   // 40 fee tokens for settle fees
    penaltyPct:                    bn(1000),                   // 10% of the min active balance will be locked to each drafted juror
    finalRoundReduction:           bn(8000),                   // 80% of discount for final rounds
    firstRoundJurorsNumber:        bn(3),                      // disputes will start with 3 jurors
    appealStepFactor:              bn(3),                      // the number of jurors to be drafted will be incremented 3 times on each appeal
    maxRegularAppealRounds:        bn(4),                      // there can be up to 4 appeals in total per dispute
    finalRoundLockTerms:           bn(21),                     // coherent jurors in the final round won't be able to withdraw for 21 terms (1 week)
    appealCollateralFactor:        bn(25000),                  // appeal collateral is 2.5x of the corresponding juror fees
    appealConfirmCollateralFactor: bn(35000),                  // appeal-confirmation collateral is 3.5x of the corresponding juror fees
    finalRoundWeightPrecision:     bn(1000),                   // use to improve division rounding for final round maths
  },
  jurors: {
    token:                         ANJ,
    minActiveBalance:              bigExp(100, ANJ.decimals),  // 100 ANJ is the minimum balance jurors must activate to participate in the Court
  },
  subscriptions: {
    feeToken:                      DAI,                        // fee token for subscriptions is DAI
    feeAmount:                     bigExp(500, DAI.decimals),  // 500 fee tokens per subscription period
    periodDuration:                bn(90),                     // each subscription period lasts 90 terms (30 days)
    prePaymentPeriods:             bn(12),                     // cannot pre-pay more than 12 periods in advance (1 year)
    resumePrePaidPeriods:          bn(12),                     // 12 pre-paid periods when resuming activity (1 year)
    latePaymentPenaltyPct:         bn(2000),                   // late payment subscriptions are charged 20%
    governorSharePct:              bn(1000),                   // 10% of the subscription fees
  },
  controller: {
    court:                        '0x26f3b895987e349a46d6d91132234924c6d45cfdc564b33427f53e3f9284955c',   // COURT module ID
    treasury:                     '0x06aa03964db1f7257357ef09714a5f0ca3633723df419e97015e0c7a3e83edb7',   // TREASURY module ID
    voting:                       '0x7cbb12e82a6d63ff16fe43977f43e3e2b247ecd4e62c0e340da8800a48c67346',   // VOTING module ID
    registry:                     '0x3b21d36b36308c830e6c4053fb40a3b6d79dde78947fbf6b0accd30720ab5370',   // JURORS_REGISTRY module ID
    subscriptions:                '0x2bfa3327fe52344390da94c32a346eeb1b65a8b583e4335a419b9471e88c1365'    // SUBSCRIPTIONS module ID
  }
}
