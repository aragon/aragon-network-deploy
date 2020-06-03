# Aragon Network deployment scripts <img align="right" src="https://raw.githubusercontent.com/aragon/design/master/readme-logo.png" height="80px" /> [![Travis branch](https://img.shields.io/travis/aragon/aragon-court/development.svg?style=for-the-badge)](https://travis-ci.com/aragon/aragon-court/)

> See the [output folder](./data/output) for information on deployed contracts on live networks

## ANJ

Make sure the related configuration is correctly set up in `./data/input/anj`

### Local

To deploy a new ANJ instance locally simply run a ganache instance and run the following deployment script:

```
npx ganache-cli -i 15 --gasLimit 8000000 --port 8545
npm run deploy:anj -- -n rpc
```

### Testnets and Mainnet

To deploy a new ANJ instance make sure everything is set in order to use `truffle-hdwallet-provider` and run:

```
npm run deploy:anj -- -n [mainnet|ropsten|rinkeby|staging]
```

## Aragon Court

Make sure the related configuration is correctly set up in `./data/input/court`

### Local

To deploy a new Aragon Court instance locally simply run a ganache instance and run the following deployment script:

```
npx ganache-cli -i 15 --gasLimit 8000000 --port 8545
npm run deploy:court:rpc
```

### Testnets and Mainnet

To deploy a new Aragon Court instance make sure everything is set in order to use `truffle-hdwallet-provider` and run:

```
npm run deploy:court -- -n [mainnet|ropsten|rinkeby|staging]
```

## Options

- `input`: specify a custom config file
- `output`: specify an output directory for the deployed contracts information
- `verbose`: enable the logging verbose mode
- `verify`: pass an Etherscan api-key to verify your contracts

## Deployments

All `config` and `output` files under `data` directory have a suffix for the environment they belong to.
