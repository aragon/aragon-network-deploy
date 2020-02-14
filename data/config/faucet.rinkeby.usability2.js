const { bigExp } = require('../../src/helpers/numbers')

const ONE_WEEK = 60 * 60 * 24 * 7

module.exports = {
  rinkeby: {
    owner:        undefined,                                          // Ownership will remain to the sender
    tokens: [
      {
        symbol:   'ANT',
        address:  '0xbF932fdf8D600398d64614eF9A10401fF046f449',       // ANT address in Rinkeby for usability testing
        period:   ONE_WEEK,                                           // The ANT quota period lasts 1 week
        amount:   bigExp(1000, 18)                                    // Accounts will be allowed to withdraw 1000 DAI per week maximum
      },
      {
        symbol:   'ANJ',
        address:  '0xE9EFff723800bb86f31dB9A369E47C2Bf336008E',       // ANT address in Rinkeby for usability testing
        period:   ONE_WEEK,                                           // The ANT quota period lasts 1 week
        amount:   bigExp(10000, 18)                                   // Accounts will be allowed to withdraw 10000 ANJ per week maximum
      },
      {
        symbol:   'DAI',
        address:  '0x55Ab9B236CDC9e2CecBD41ADa45D8261f8A6049b',       // Fee token (DAI) address in Rinkeby for usability testing
        period:   ONE_WEEK,                                           // The fee token quota period lasts 1 week
        amount:   bigExp(10000, 18)                                   // Accounts will be allowed to withdraw 10000 ANT per week maximum
      }
    ]
  },
}
