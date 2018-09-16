const Regulator = artifacts.require("Regulator");
const Farms = artifacts.require("Farms");
const Stables = artifacts.require("Stables");
const Cows = artifacts.require("Cows");
const MilkToken = artifacts.require("MilkToken");
const MeatToken = artifacts.require("MeatToken");

contract('Regulator', async (accounts) => {
    it("should compute the farm quality", async () => {
        let farms = await Farms.deployed();
        let stables = await Stables.deployed();
        let cows = await Cows.deployed();
        let regulator = await Regulator.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();

        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);
        await milkToken.setDependencies(regulator.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        
        await farms.buildFarm(1, "x");
        await farms.buildStable(1, 1, 25, 100, 1000, "y");

        for (var i = 0; i < 10; ++i) {
            await farms.birthCow(i, 1, 100, 100, 120, "z");
        }

        var quality = await regulator.getFarmQuality(1);
        assert.equal(85, quality);

        await stables.updateSizeOfBarn(1, 80, "a");
        await stables.updateSizeOfField(1, 800, "b");

        quality = await regulator.getFarmQuality(1);
        assert.equal(69, quality);

        await stables.updateSizeOfBarn(1, 60, "a");
        await stables.updateSizeOfField(1, 600, "b");

        quality = await regulator.getFarmQuality(1);
        assert.equal(53, quality);

        await stables.updateSizeOfBarn(1, 40, "a");
        await stables.updateSizeOfField(1, 400, "b");

        quality = await regulator.getFarmQuality(1);
        assert.equal(37, quality);

        await stables.updateSizeOfBarn(1, 20, "a");
        await stables.updateSizeOfField(1, 200, "b");

        quality = await regulator.getFarmQuality(1);
        assert.equal(21, quality);

        await stables.updateSizeOfBarn(1, 1, "a");
        await stables.updateSizeOfField(1, 1, "b");

        quality = await regulator.getFarmQuality(1);
        assert.equal(5, quality);

        // Try a stable with maximum score.
        await farms.buildStable(2, 1, 100, 100, 1000, "y");
        await farms.birthCow(10, 2, 100, 100, 120, "z");

        quality = await regulator.getFarmQuality(1);
        assert.equal(99, quality);

        // Try a stable with minimum score.
        await farms.buildStable(3, 1, 0, 1, 19, "y");
        await farms.birthCow(11, 3, 100, 100, 120, "z");

        quality = await regulator.getFarmQuality(1);
        assert.equal(98, quality);

        // Try a farm with no stables.
        await farms.buildFarm(2, "y");

        quality = await regulator.getFarmQuality(2);
        assert.equal(100, quality);
    });
});

contract('Regulator', async (accounts) => {
    it("should compute the stable quality", async () => {
        let farms = await Farms.deployed();
        let stables = await Stables.deployed();
        let cows = await Cows.deployed();
        let regulator = await Regulator.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();

        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);
        await milkToken.setDependencies(regulator.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        
        await farms.buildFarm(1, "x");
        await farms.buildStable(1, 1, 25, 100, 1000, "y");

        for (var i = 0; i < 10; ++i) {
            await farms.birthCow(i, 1, 100, 100, 120, "z");
        }

        var quality = await regulator.getStableQuality(1);
        assert.equal(85, quality);

        await stables.updateSizeOfBarn(1, 80, "a");
        await stables.updateSizeOfField(1, 800, "b");

        quality = await regulator.getStableQuality(1);
        assert.equal(69, quality);

        await stables.updateSizeOfBarn(1, 60, "a");
        await stables.updateSizeOfField(1, 600, "b");

        quality = await regulator.getStableQuality(1);
        assert.equal(53, quality);

        await stables.updateSizeOfBarn(1, 40, "a");
        await stables.updateSizeOfField(1, 400, "b");

        quality = await regulator.getStableQuality(1);
        assert.equal(37, quality);

        await stables.updateSizeOfBarn(1, 20, "a");
        await stables.updateSizeOfField(1, 200, "b");

        quality = await regulator.getStableQuality(1);
        assert.equal(21, quality);

        await stables.updateSizeOfBarn(1, 0, "a");
        await stables.updateSizeOfField(1, 0, "b");

        quality = await regulator.getStableQuality(1);
        assert.equal(5, quality);

        // Try a stable with maximum score.
        await farms.buildStable(2, 1, 100, 100, 1000, "y");
        await farms.birthCow(10, 2, 100, 100, 120, "z");

        quality = await regulator.getStableQuality(2);
        assert.equal(100, quality);

        // Try a stable with minimum score.
        await farms.buildStable(3, 1, 0, 1, 19, "y");
        await farms.birthCow(11, 3, 100, 100, 120, "z");

        quality = await regulator.getStableQuality(3);
        assert.equal(0, quality);

        // Try a stable with no cows.
        await farms.buildStable(4, 1, 25, 100, 1000, "y");

        quality = await regulator.getStableQuality(4);
        assert.equal(100, quality);
    });
});

contract('Regulator', async (accounts) => {
    it("should compute the meat quality at slaughter", async () => {
        let farms = await Farms.deployed();
        let stables = await Stables.deployed();
        let cows = await Cows.deployed();
        let regulator = await Regulator.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();

        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);
        await milkToken.setDependencies(regulator.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        
        await farms.buildFarm(1, "x");
        await farms.buildStable(1, 1, 100, 100, 1000, "y");

        await farms.birthCow(2, 1, 100, 100, 120, "z");
        
        await farms.birthCow(3, 1, 100, 100, 120, "z");
        await farms.killCow(3, "z");

        await farms.birthCow(4, 1, 50, 100, 120, "z");
        await farms.killCow(4, "z");
        await farms.slaughterCow(4, 1, "z");

        await farms.birthCow(5, 1, 75, 500, 120, "z");
        await farms.killCow(5, "z");
        await farms.slaughterCow(5, 1, "z");

        await farms.birthCow(6, 1, 100, 200, 120, "z");
        await farms.killCow(6, "z");
        await farms.slaughterCow(6, 1, "z");

        let cowIds = [];
        cowIds.push(1); // This cow does not exist, so it does not count.
        cowIds.push(2); // This cow is alive, so it does not count.
        cowIds.push(3); // This cow is only dead, so it does not count.
        cowIds.push(4); // This cow is slaughtered, so it counts.
        cowIds.push(5); // This cow is slaughtered, so it counts.
        cowIds.push(6); // This cow is slaughtered, so it counts.

        let quality = await regulator.getMeatQualityAtSlaughter(cowIds);
        assert.equal(80, quality);

        // Try an empty list of cows.
        cowIds = [];

        quality = await regulator.getMeatQualityAtSlaughter(cowIds);
        assert.equal(100, quality);
   });
});

contract('Regulator', async (accounts) => {
    it("should compute the milk quality at collection", async () => {
        let farms = await Farms.deployed();
        let stables = await Stables.deployed();
        let cows = await Cows.deployed();
        let regulator = await Regulator.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();

        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);
        await milkToken.setDependencies(regulator.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        
        await farms.buildFarm(1, "x");
        await farms.buildStable(1, 1, 100, 100, 1000, "y");

        await farms.birthCow(2, 1, 100, 100, 120, "z");
        
        await farms.birthCow(3, 1, 100, 100, 120, "z");
        await farms.killCow(3, "z");

        await farms.birthCow(4, 1, 50, 100, 120, "z");
        await farms.killCow(4, "z");
        await farms.slaughterCow(4, 1, "z");

        await farms.birthCow(5, 1, 50, 100, 120, "z");
        await cows.updateIsActive(5, true, "t");

        await farms.birthCow(6, 1, 75, 500, 120, "z");
        await cows.updateIsActive(6, true, "t");
        
        await farms.birthCow(7, 1, 100, 200, 120, "z");
        await cows.updateIsActive(7, true, "t");
        
        let cowIds = [];
        cowIds.push(1); // This cow does not exist, so it does not count.
        cowIds.push(2); // This cow is alive but inactive, so it does not count.
        cowIds.push(3); // This cow is dead, so it does not count.
        cowIds.push(4); // This cow is slaughtered, so it does not count.
        cowIds.push(5); // This cow is alive and active, so it counts.
        cowIds.push(6); // This cow is alive and active, so it counts.
        cowIds.push(7); // This cow is alive and active, so it counts.

        let quality = await regulator.getMilkQualityAtCollection(cowIds);
        assert.equal(83, quality);

        // Try an empty list of cows.
        cowIds = [];

        quality = await regulator.getMilkQualityAtCollection(cowIds);
        assert.equal(100, quality);
    });
});