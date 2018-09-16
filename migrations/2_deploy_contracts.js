var Cows = artifacts.require("Cows");
var Stables = artifacts.require("Stables");
var Farms = artifacts.require("Farms");
var MilkToken = artifacts.require("MilkToken");
var MeatToken = artifacts.require("MeatToken");
var Insurance = artifacts.require("Insurance");
var Veterinarian = artifacts.require("Veterinarian");
var Regulator = artifacts.require("Regulator");
var Restaurant = artifacts.require("Restaurant");
var Supermarket = artifacts.require("Supermarket");

var cows
var stables
var farms
var milkToken
var meatToken
var regulator
var insurance
var veterinarian

module.exports = function(deployer) {
    deployer.deploy(Cows).then(cowsInstance => {
        cows = cowsInstance
        return deployer.deploy(Veterinarian)
    }).then(vetInstance => {
        veterinarian = vetInstance
        return deployer.deploy(Stables)
    }).then(stablesInstance => {
        stables = stablesInstance
        return deployer.deploy(Farms)
    }).then(farmsInstance => {
        farms = farmsInstance
        return deployer.deploy(MilkToken)
    }).then(milkTokenInstance => {
        milkToken = milkTokenInstance
        return deployer.deploy(MeatToken)
    }).then(meatTokenInstance => {
        meatToken = meatTokenInstance
        return deployer.deploy(Regulator)
    }).then(regulatorInstance => {
        regulator = regulatorInstance
        return deployer.deploy(Insurance)
    }).then(insuranceInstance => {
        insurance = insuranceInstance
        return farms.setDependencies(Stables.address, Cows.address, MilkToken.address, MeatToken.address)
    }).then(res => {
        deployer.deploy(Restaurant)
        return deployer.deploy(Supermarket)
    })
};
