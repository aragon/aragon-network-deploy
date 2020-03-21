const { bn, bigExp } = require('../../src/helpers/numbers')

const TERM_DURATION = 60 * 60 * 8                                      // 8 hours
const START_DATE = Math.floor(new Date() / 1000 + TERM_DURATION + 120) // two minutes from now

const ANJ = {
  symbol: 'ANJ',
  decimals: 18,
  address: '0xc863E1CcC047befF17022F4229DBE6321A6BCe65'
}

const DAI = {
  symbol: 'DAI',
  decimals: 18,
  address: '0x4E1F48Db14D7E1ada090c42ffE15FF3024EEc8Bf'
}

module.exports = {
  governor: {
    funds:                         '0x0090aED150056316E37FE6DFa10Dc63E79D173B6', // EOA
    config:                        '0x0090aED150056316E37FE6DFa10Dc63E79D173B6', // EOA
    modules:                       '0x0090aED150056316E37FE6DFa10Dc63E79D173B6', // EOA
  },
  clock: {
    termDuration:                  bn(TERM_DURATION),            // terms lasts 8 hours
    firstTermStartTime:            bn(START_DATE),               // first term start timestamp in seconds
  },
  court: {
    feeToken:                      DAI,                          // fee token for the court is DAI
    evidenceTerms:                 bn(21),                       // evidence period lasts 21 terms (7 days)
    commitTerms:                   bn(6),                        // vote commits last 6 terms (2 days)
    revealTerms:                   bn(6),                        // vote reveals last 6 terms (2 days)
    appealTerms:                   bn(6),                        // appeals last 6 terms (2 days)
    appealConfirmTerms:            bn(6),                        // appeal confirmations last 6 terms (2 days)
    maxJurorsPerDraftBatch:        bn(81),                       // max number of jurors drafted per batch
    jurorFee:                      bigExp(10, DAI.decimals),     // 10 fee tokens for juror fees
    draftFee:                      bigExp(18, DAI.decimals - 2), // 0.18 fee tokens for draft fees
    settleFee:                     bigExp(1, DAI.decimals - 1),  // 0.1 fee tokens for settle fees
    penaltyPct:                    bn(1000),                     // 10% of the min active balance will be locked to each drafted juror
    finalRoundReduction:           bn(5000),                     // 50% of discount for final rounds
    firstRoundJurorsNumber:        bn(3),                        // disputes will start with 3 jurors
    appealStepFactor:              bn(3),                        // the number of jurors to be drafted will be incremented 3 times on each appeal
    maxRegularAppealRounds:        bn(4),                        // there can be up to 4 appeals in total per dispute
    finalRoundLockTerms:           bn(21),                       // coherent jurors in the final round won't be able to withdraw for 21 terms (7 days)
    appealCollateralFactor:        bn(30000),                    // appeal collateral is 3x of the corresponding juror fees
    appealConfirmCollateralFactor: bn(20000),                    // appeal-confirmation collateral is 2x of the corresponding juror fees
    finalRoundWeightPrecision:     bn(1000),                     // use to improve division rounding for final round maths
    skippedDisputes:               2,                            // number of dispute to skip
  },
  jurors: {
    token:                         ANJ,
    minActiveBalance:              bigExp(100, ANJ.decimals),    // 100 ANJ is the minimum balance jurors must activate to participate in the Court
  },
  subscriptions: {
    feeToken:                      DAI,                          // fee token for subscriptions is DAI
    feeAmount:                     bigExp(10, DAI.decimals),     // 10 fee tokens per subscription period
    periodDuration:                bn(90),                       // each subscription period lasts 90 terms (30 days)
    prePaymentPeriods:             bn(12),                       // cannot pre-pay more than 12 periods in advance (1 year)
    resumePrePaidPeriods:          bn(12),                       // 12 pre-paid periods when resuming activity (1 year)
    latePaymentPenaltyPct:         bn(1000),                     // late payment subscriptions are charged 20%
    governorSharePct:              bn(0),                        // 0% of the subscription fees
  }
}
