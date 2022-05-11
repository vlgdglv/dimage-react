var Release = artifacts.require("./Release.sol");
var Verification = artifacts.require("./Verification.sol");
var RevertTest = artifacts.require("./RevertTest.sol");

module.exports = function(deployer) {
  deployer.deploy(Release);
  deployer.deploy(Verification);
  deployer.deploy(RevertTest);
};
