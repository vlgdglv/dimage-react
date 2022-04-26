const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/abis"),
  networks: {
    develop: {
      port: 8545,
      gas: 68719476735,   
      
    }
  },

  compilers:{
    solc:{
      version: "^0.8.12",
    }
  }
};
