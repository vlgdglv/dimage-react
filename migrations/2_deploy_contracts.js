var Release = artifacts.require("./Release2.sol");
var Verification = artifacts.require("./Verification.sol");

module.exports = function(deployer) {
  deployer.deploy(Release);
  deployer.deploy(Verification)
};
