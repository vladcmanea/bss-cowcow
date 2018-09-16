const Veterinarian = artifacts.require("Veterinarian");
const Farms = artifacts.require("Farms");
const Stables = artifacts.require("Stables");
const Cows = artifacts.require("Cows");
const MilkToken = artifacts.require("MilkToken");
const MeatToken = artifacts.require("MeatToken");
const Regulator = artifacts.require("Regulator");

contract('Veterinarian', async (accounts) => {
    it("should compute the cow health", async () => {
        let farms = await Farms.deployed();
        let stables = await Stables.deployed();
        let cows = await Cows.deployed();
        let veterinarian = await Veterinarian.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();
        let regulator = await Regulator.deployed();

        await veterinarian.setDependencies(farms.address, stables.address, cows.address);
        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await milkToken.setDependencies(regulator.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);

        var health = await veterinarian.getCowHealth(1);
        assert.equal(0, health);

        await farms.buildFarm(1, "x");
        await farms.buildStable(2, 1, 75, 10, 10, "y");
        await farms.buildStable(3, 1, 25, 10, 10, "z");
        await farms.buildStable(4, 1, 100, 10, 10, "z");
        await farms.buildStable(5, 1, 4, 10, 10, "z");

        await farms.birthCow(4, 2, 50, 2000, 180, "a");
        await farms.birthCow(5, 4, 100, 2000, 84, "b");
        await farms.birthCow(6, 4, 100, 2000, 48, "c");
        await farms.birthCow(7, 5, 0, 2000, 5, "d");

        health = await veterinarian.getCowHealth(4);
        assert.equal(55, health);

        health = await veterinarian.getCowHealth(5);
        assert.equal(100, health);

        health = await veterinarian.getCowHealth(6);
        assert.equal(100, health);

        health = await veterinarian.getCowHealth(7);
        assert.equal(16, health);

        await farms.killCow(4, "z");
        await farms.killCow(5, "t");
        await farms.slaughterCow(5, 3, "t");

        health = await veterinarian.getCowHealth(4);
        assert.equal(0, health);

        health = await veterinarian.getCowHealth(5);
        assert.equal(0, health);
    });
});