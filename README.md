# GDPR Cash

An `ERC20` token used for the GDPR.CASH Network

## About

* See [gdpr.cash](https://gdpr.cash) for more details.

## Development

The smart contracts are being implemented in Solidity `0.4.19`.

### Prerequisites

* [NodeJS](htps://nodejs.org), version 9+ (I use [`nvm`](https://github.com/creationix/nvm) to manage Node versions — `brew install nvm`.)
* [truffle](http://truffleframework.com/), which is a comprehensive framework for Ethereum development. `npm install -g truffle` — this should install Truffle v4.0.6 or better.  Check that with `truffle version`.

### Initialisation

        npm install

#### From within Truffle

Run the `truffle` development environment

    truffle develop

then from the prompt you can run

    compile
    migrate
    test

as well as other truffle commands. See [truffleframework.com](http://truffleframework.com) for more.

#### Standalone

Run

    npm test

To generate code coverage reports run

    npm run test:cov

*Note* Generating code coverage reports takes a bit longer to run than just running the tests.

### Linting

We provide the following linting options

* `npm run lint:sol` — to lint the solidity files, and
* `npm run lint:js` — to lint the javascript.

### Deploying to `ropsten`

You'll need an address on the Ropsten blockchain with some ETH in it.

Use [MetaMask](https://metamask.io) to create a wallet and use [faucet.metamask.io](https://faucet.metamask.io/) to get some ETH for it.

You will need to supply a file called `wallet.json` in the root of the project.

    {
      "infuraToken": "Token for the infura.io",
      "mnemonic": "the sequence of twelve words you used to keep your wallet secure"
    }

Then run

    npm run deploy:ropsten

