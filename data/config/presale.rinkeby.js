module.exports = {
  infra: {
    ens: '0x98df287b6c145399aaa709692c8d308357bc085d',
    daoFactory: '0xad4d106b43b480faa3ef7f98464ffc27fc1faa96',
    registrar: '0x3665e7bfd4d3254ae7796779800f5b603c43c60d'
  },
  instance: {
    owner: '',
    id: 'anj-presale',
    collateralToken: '',
    bondedToken: '0x1B1EdCF4f3C5bB705a7670154e2C65569d0676Be',     // ANJ
    period: '86400',                                               // 1 day
    exchangeRate: '100000000',                                     // 1/100
    openDate: '0',
    reserveRatio: '33333',                                         // 33%
    batchBlocks: '1',
    slippage: '100000000000000000'                                 // 10%
  }
}
