const hdWallet = require('./hdWallet')
const web3Engine = require('./web3Engine')

const {
  name: packageName,
  version,
  description,
  keywords,
  license
} = require('./package.json')

const DEFAULT = {
  host: '127.0.0.1',
  port: 8545,
  network_id: '*', // Match any network id
  gas: 4600000
}

const walletPath = './wallet.json'

const providerUrlRopsten = 'https://ropsten.infura.io/xRc0gm6NfEiUU2bRb2r4'
const providerUrlRinkeby = 'https://rinkeby.infura.io/xRc0gm6NfEiUU2bRb2r4'
const providerUrlMainnet = 'https://mainnet.infura.io/xRc0gm6NfEiUU2bRb2r4'

const wallets = hdWallet(walletPath)

const getAddress = wallet => `0x${wallet.getAddress().toString('hex')}`
const addresses = wallets.map(getAddress)

const engineRopsten = web3Engine(wallets, providerUrlRopsten)
const engineRinkeby = web3Engine(wallets, providerUrlRinkeby)
const engineMainnet = web3Engine(wallets, providerUrlMainnet)

module.exports = {
  packageName,
  version,
  description,
  keywords,
  license,
  authors: [
    'Carlos Bruguera <cbruguera@gmail.com>',
    'Dave Sag <david.sag@industrie.co>'
  ],
  networks: {
    geth: { ...DEFAULT, gas: 999999 },
    ganache: { ...DEFAULT, port: 7545, gas: 4700000 },
    ropsten: {
      network_id: 3,
      provider: engineRopsten,
      from: addresses[0],
      gas: 4700000,
      gasPrice: 22200000000
    },
    rinkeby: {
        network_id: 3,
        provider: engineRinkeby,
        from: addresses[0],
        gas: 4700000,
        gasPrice: 22200000000
    },
    mainnet: {
      network_id: 1,
      provider: engineMainnet,
      from: addresses[0],
      gas: 5000000,
      gasPrice: 7500000000
    }
  },
  /*solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }*/
}
