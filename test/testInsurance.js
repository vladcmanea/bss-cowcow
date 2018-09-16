const Insurance = artifacts.require("Insurance");
const Veterinarian = artifacts.require("Veterinarian");
const Regulator = artifacts.require("Regulator");
const Farms = artifacts.require("Farms");
const Stables = artifacts.require("Stables");
const Cows = artifacts.require("Cows");
const MilkToken = artifacts.require("MilkToken");
const MeatToken = artifacts.require("MeatToken");

contract('Insurance', async (accounts) => {
    it("should get the farm premium", async () => {
        let insurance = await Insurance.deployed();
        let veterinarian = await Veterinarian.deployed();
        let farms = await Farms.deployed();
        let stables = await Stables.deployed();
        let cows = await Cows.deployed();
        let regulator = await Regulator.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();

        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await insurance.setDependencies(regulator.address, veterinarian.address, farms.address);
        await veterinarian.setDependencies(farms.address, stables.address, cows.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);

        await farms.buildFarm(1, "x");
        await farms.buildStable(1, 1, 100, 1000, 10000, "y");

        for (var i = 0; i < 10; ++i) {
            await farms.birthCow(i, 1, 100, 100, 120, "z");
        }

        premium = await insurance.getFarmPremium(1);
        assert.equal(84, premium);

        await stables.updateSizeOfBarn(1, 1, "a");
        await stables.updateSizeOfField(1, 1, "b");

        premium = await insurance.getFarmPremium(1);
        assert.equal(44, premium);

        // Try a farm with no animals.
        await farms.buildFarm(2, "y");

        premium = await insurance.getFarmPremium(2);
        assert.equal(100, premium);
    });
});