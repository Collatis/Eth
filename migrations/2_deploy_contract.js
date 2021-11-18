var Campaign = artifacts.require("./Campaign.sol");

module.exports = function(deployer) {
    let duration = 180
    let receipient_adress = '0x605CEF716cC3cc9B3705FB971c68C621747635cA'
  deployer.deploy(Campaign, duration, receipient_adress, goal);
};
