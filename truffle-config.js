require('babel-register');
require('babel-polyfill');
const path = require("path");
require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider');


module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },

    ropsten: {
      provider: function(){
        return new HDWalletProvider(
          process.env.MNEMONIC,
          `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`
          )
      },
      gasPrice: 250000000000,
      network_id: 3
    },

  },

  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
