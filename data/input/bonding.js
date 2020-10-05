const governor = require('./governor')

const environments = {
  rinkeby: {
    kernel: '0xb3d01f18a74bb288449c8d1e42f8757f0398be09',        // Fundraising DAO
    fundraising: '0x8ab84819c08355b029cda21457192d0d249bcc0d'    // Fundraising app
  },
  mainnet: {
    kernel: '0x3ecd508f87ef27417474b0fdf8dd90a3b2b337c9',        // Fundraising DAO
    fundraising: '0x0b4d742d52ee0c4391439f80822b26fdf1ad6ee7'    // Fundraising app
  },
}


Object.keys(environments).forEach(network => {
  environments[network] = {
    ...environments[network],
    governor:       governor[network],
  }
})

module.exports = environments
