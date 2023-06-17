require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks:{
    goerli:{
      url:process.env.AU_URl,
      accounts:[process.env.PRIVATE_KEY]
    },
    ganache:{
      url:process.env.localChainUrl,
      accounts:[process.env.Alice,process.env.Bob,process.env.Rat]
    },

  },
  paths: {
    sources: "./contracts",
    tests: "./test",
  },
};
