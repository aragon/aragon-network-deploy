const { bigExp } = require('../../src/helpers/numbers')

const ONE_WEEK = 60 * 60 * 24 * 7

module.exports = {
  rpc: {
    tokens: [],                                                       // No tokens set for local env
  },
  staging: {
    owner:        undefined,                                          // Ownership will remain to the sender
    tokens: [
      {
        symbol:   'ANT',
        address:  '0xd6257606740DE4A457B97D5DD469021ED72b6Ae7',       // ANT address in Staging
        period:   ONE_WEEK,                                           // The ANT quota period lasts 1 week
        amount:   bigExp(1000, 18)                                    // Accounts will be allowed to withdraw 1000 ANT per week maximum
      },
      {
        symbol:   'DAI',
        address:  '0xB88D8CBD8df85fb31b7cD17Fbc6fCC0FE110F5d0',       // Fee token (DAI) address in Staging
        period:   ONE_WEEK,                                           // The fee token quota period lasts 1 week
        amount:   bigExp(10000, 18)                                   // Accounts will be allowed to withdraw 1000 ANT per week maximum
      }
    ]
  },
  ropsten: {
    owner:        undefined,                                          // Ownership will remain to the sender
    tokens: [
      {
        symbol:   'ANT',
        address:  '0x0cb95D9537c8Fb0C947eD48FDafc66A7b72EfC86',       // ANT address in Ropsten
        period:   ONE_WEEK,                                           // The ANT quota period lasts 1 week
        amount:   bigExp(1000, 18)                                    // Accounts will be allowed to withdraw 1000 ANT per week maximum
      },
      {
        symbol:   'DAI',
        address:  '0x4E1F48Db14D7E1ada090c42ffE15FF3024EEc8Bf',       // Fee token (DAI) address in Ropsten
        period:   ONE_WEEK,                                           // The fee token quota period lasts 1 week
        amount:   bigExp(10000, 18)                                   // Accounts will be allowed to withdraw 1000 ANT per week maximum
      }
    ]
  },
  rinkeby: {
    owner:        undefined,                                          // Ownership will remain to the sender
    tokens: [
      {
        symbol:   'ANT',
        address:  '0x5cC7986D7A793b9930BD80067ca54c3E6D2F261B',       // ANT address in Rinkeby
        period:   ONE_WEEK,                                           // The ANT quota period lasts 1 week
        amount:   bigExp(1000, 18)                                    // Accounts will be allowed to withdraw 1000 ANT per week maximum
      },
      {
        symbol:   'DAI',
        address:  '0xe9A083D88Eed757B1d633321Ce0519F432c6284d',       // Fee token (DAI) address in Rinkeby
        period:   ONE_WEEK,                                           // The fee token quota period lasts 1 week
        amount:   bigExp(10000, 18)                                   // Accounts will be allowed to withdraw 10000 DAI per week maximum
      }
    ]
  },
  usability: {
    owner:        undefined,                                          // Ownership will remain to the sender
    tokens: [
      {
        symbol:   'ANT',
        address:  '0x5cC7986D7A793b9930BD80067ca54c3E6D2F261B',       // ANT address in Rinkeby for usability testing
        period:   ONE_WEEK,                                           // The ANT quota period lasts 1 week
        amount:   bigExp(1000, 18)                                    // Accounts will be allowed to withdraw 1000 DAI per week maximum
      },
      {
        symbol:   'ANJ',
        address:  '0x929F3B27a22a7A56FC8d89617033D22e53840aC9',       // ANT address in Rinkeby for usability testing
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
