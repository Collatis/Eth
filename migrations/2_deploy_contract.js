var Campaign = artifacts.require("./Campaign.sol");

module.exports = function(deployer) {
    let duration = 210000
    let receipient_adress = '0x28893F4999728729c98A69374c0d267fF7616c2b'
  deployer.deploy(Campaign, duration, receipient_adress);
};
