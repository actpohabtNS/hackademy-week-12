/**
 * @type import('hardhat/config').HardhatUserConfig
*/

require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');

const { alchemyApiKey, metamaskRopsten, metamaskBSC } = require('./secrets.json');

module.exports = {
  solidity: "0.8.0",
  networks: {
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${alchemyApiKey}`,
      accounts: [ `0x${metamaskRopsten}` ],
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: { mnemonic: metamaskBSC },
    },
  },
  mocha: {
    timeout: 60000
  }
};
