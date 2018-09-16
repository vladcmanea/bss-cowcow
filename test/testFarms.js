const Cows = artifacts.require("Cows");
const Stables = artifacts.require("Stables");
const Farms = artifacts.require("Farms");
const Regulator = artifacts.require("Regulator");
const MilkToken = artifacts.require("MilkToken");
const MeatToken = artifacts.require("MeatToken");

contract('Farms', async (accounts) => {
    it("should build a farm", async () => {
        let farms = await Farms.deployed();

        [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(1);
        assert.equal(1, actualFarmId.c[0]);
        assert.isFalse(actualExists);

        // Sunshine.
        await farms.buildFarm(1, "x");

        [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(1);
        assert.equal(1, actualFarmId.c[0]);
        assert.isTrue(actualExists);

        let cowIds = await farms.getCowIdsInFarm(1);
        assert.equal(0, cowIds.length);

        let stableIds = await farms.getStableIdsInFarm(1);
        assert.equal(0, stableIds.length);

        try {
            // Farm already exists.
            await farms.buildFarm(1, "x");
            assert.fail();
        } catch (err) {
            [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(1);
            assert.equal(1, actualFarmId.c[0]);
            assert.isTrue(actualExists);
        }
    });
});

contract('Farms', async (accounts) => {
    it("should demolish a farm", async () => {
        let cows = await Cows.deployed();
        let stables = await Stables.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();
        let farms = await Farms.deployed();
        let regulator = await Regulator.deployed();

        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await milkToken.setDependencies(regulator.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);

        let farmIds = await farms.getFarmIds();
        assert.equal(0, farmIds.length);

        try {
            // Farm does not exist.
            await farms.demolishFarm(1, "x");
            assert.fail();
        } catch (err) {
            [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(1);
            assert.equal(1, actualFarmId.c[0]);
            assert.isFalse(actualExists);
        }

        await farms.buildFarm(1, "y");
        await farms.buildFarm(2, "z");
        
        // Farm 1 has nothing.
        // Farm 2 has stables.
        await farms.buildStable(1, 2, 50, 50, 5000, "b");

        let stableIds = await farms.getStableIdsInFarm(2);
        assert.equal(1, stableIds.length);

        // Sunshine.
        await farms.demolishFarm(1, "e");

        [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(1);
        assert.equal(1, actualFarmId.c[0]);
        assert.isFalse(actualExists);

        try {
            // Farm exists, but has stables.
            await farms.demolishFarm(2, "f");
            assert.fail();
        } catch (err) {
            [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(2);
            assert.equal(2, actualFarmId.c[0]);
            assert.isTrue(actualExists);
        }

        farmIds = await farms.getFarmIds();
        assert.equal(1, farmIds.length);

        await farms.demolishStable(1, "g");

        stableIds = await farms.getStableIdsInFarm(2);
        assert.equal(0, stableIds.length);
        
        // Sunshine.
        await farms.demolishFarm(2, "h");

        [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(2);
        assert.equal(2, actualFarmId.c[0]);
        assert.isFalse(actualExists);

        farmIds = await farms.getFarmIds();
        assert.equal(0, farmIds.length);
    });
});

contract('Farms', async (accounts) => {
    it("should demolish a farm in a complex scenario", async () => {
        let cows = await Cows.deployed();
        let stables = await Stables.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();
        let farms = await Farms.deployed();
        let regulator = await Regulator.deployed();

        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await milkToken.setDependencies(regulator.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);
        
        let farmIds;

        // Build ten farms one by one.
        for (var i = 1; i <= 10; ++i) {
            await farms.buildFarm(10 - i + 1, "x");

            farmIds = await farms.getFarmIds();
            assert.equal(i, farmIds.length);
            
            var found = false;

            for (var j = 0; j < farmIds.length && !found; ++j) {
                if (farmIds[j] == 10 - i + 1) {
                    found = true;
                }
            }

            assert.isTrue(found);
        }

        // Demolish the ten stables one by one.
        for (var i = 1; i <= 10; ++i) {
            var k = (i + 3) % 10 + 1;

            farmIds = await farms.getFarmIds();
            assert.equal(10 - i + 1, farmIds.length);

            var found = false;

            for (var j = 0; j < farmIds.length && !found; ++j) {
                if (farmIds[j] == k) {
                    found = true;
                }
            }

            assert.isTrue(found);

            [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(k);
            assert.equal(k, actualFarmId.c[0]);
            assert.isTrue(actualExists);

            await farms.demolishFarm(k, "z");

            farmIds = await farms.getFarmIds();
            assert.equal(10 - i, farmIds.length);

            var found = false;

            for (var j = 0; j < farmIds.length && !found; ++j) {
                if (farmIds[j] == k) {
                    found = true;
                }
            }

            assert.isFalse(found);

            [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(k);
            assert.equal(k, actualFarmId.c[0]);
            assert.isFalse(actualExists);
        }

        farmIds = await farms.getFarmIds();
        assert.equal(0, farmIds.length);
    });
});

contract('Farms', async (accounts) => {
    it("should sell a farm", async () => {
        let cows = await Cows.deployed();
        let farms = await Farms.deployed();

        try {
            // Farm does not exist.
            await farms.sellFarm(1, aliens.address, "a");
            assert.fail();
        } catch (err) {
            [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(1);
            assert.equal(1, actualFarmId.c[0]);
            assert.isFalse(actualExists);
        }

        await farms.buildFarm(1, "ceci n'est pas une pipe.");

        [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(1);
        assert.equal(1, actualFarmId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(accounts[0], actualOwnerAddress);

        const emptyAccount = '0x0000000000000000000000000000000000000000';

        try {
            // Buyer is invalid address.
            await farms.sellFarm(1, emptyAccount, "b");
            assert.fail();
        } catch (err) {
            [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(1);
            assert.equal(1, actualFarmId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(accounts[0], actualOwnerAddress);
        }

        try {
            // Buyer is the same as the seller.
            await farms.sellFarm(1, accounts[0], "c");
            assert.fail();
        } catch (err) {
            [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(1);
            assert.equal(1, actualFarmId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(accounts[0], actualOwnerAddress);
        }

        // Sunshine.
        await farms.sellFarm(1, accounts[1], "d'");

        [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(1);
        assert.equal(1, actualFarmId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(accounts[1], actualOwnerAddress);
    });
});

contract('Farms', async (accounts) => {
    it("should build a stable", async () => {
        let cows = await Cows.deployed();
        let stables = await Stables.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();
        let farms = await Farms.deployed();
        let regulator = await Regulator.deployed();

        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await milkToken.setDependencies(regulator.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);

        try {
            // Farm does not exist.
            await farms.buildStable(1, 1, 100, 100, 10000, "a");
            assert.fail();
        } catch (err) {
            // Do nothing.    
        }

        await farms.buildFarm(1, "b");

        let stableIds = await farms.getStableIdsInFarm(1);
        assert.equal(0, stableIds.length);

        // Sunshine.
        await farms.buildStable(2, 1, 100, 100, 10000, "a");
        
        stableIds = await farms.getStableIdsInFarm(1);
        assert.equal(1, stableIds.length);
        assert.equal(2, stableIds[0].c[0]);

        try {
            // Stable exists already.
            await farms.buildStable(2, 1, 100, 100, 10000, "a");
            assert.fail();
        } catch (err) {
            stableIds = await farms.getStableIdsInFarm(1);
            assert.equal(1, stableIds.length);
            assert.equal(2, stableIds[0].c[0]);
        }
    });
});

contract('Farms', async (accounts) => {
    it("should demolish a stable", async () => {
        let cows = await Cows.deployed();
        let stables = await Stables.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();
        let farms = await Farms.deployed();
        let regulator = await Regulator.deployed();

        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await milkToken.setDependencies(regulator.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);

        try {
            // Farm does not exist.
            await farms.demolishStable(2, "a");
            assert.fail();
        } catch (err) {
            // Do nothing.    
        }

        await farms.buildFarm(1, "b");

        [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(1);
        assert.equal(1, actualFarmId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(accounts[0], actualOwnerAddress);

        let stableIds = await farms.getStableIdsInFarm(1);
        assert.equal(0, stableIds.length);

        try {
            // Stable does not exist.
            await farms.demolishStable(2, "c");
            assert.fail();
        } catch (err) {
            // Do nothing.    
        }

        await farms.buildStable(2, 1, 100, 100, 10000, "d");

        stableIds = await farms.getStableIdsInFarm(1);
        assert.equal(1, stableIds.length);
        assert.equal(2, stableIds[0].c[0]);

        await farms.birthCow(3, 2, 100, 100, 100, "moo");


        let cowIdsInStable = await farms.getCowIdsInStable(2);
        assert.equal(1, cowIdsInStable.length);
        assert.equal(3, cowIdsInStable[0].c[0]);

        let cowIdsInFarm = await farms.getCowIdsInFarm(1);
        assert.equal(1, cowIdsInFarm.length);
        assert.equal(3, cowIdsInFarm[0].c[0]);

        try {
            // Stable has useful cows.
            await farms.demolishStable(2, "e");
            assert.fail();
        } catch (err) {
            stableIds = await farms.getStableIdsInFarm(1);
            assert.equal(1, stableIds.length);
        }

        await farms.killCow(3, "f");

        try {
            // Stable has useful cows.
            await farms.demolishStable(2, "e");
            assert.fail();
        } catch (err) {
            stableIds = await farms.getStableIdsInFarm(1);
            assert.equal(1, stableIds.length);
        }

        await farms.slaughterCow(3, 4, "mmm");

        await farms.demolishStable(2, "whatevs");

        stableIds = await farms.getStableIdsInFarm(1);
        assert.equal(0, stableIds.length);

        cowIdsInStable = await farms.getCowIdsInStable(2);
        assert.equal(0, cowIdsInStable.length);
        
        cowIdsInFarm = await farms.getCowIdsInFarm(1);
        assert.equal(1, cowIdsInFarm.length);
        assert.equal(3, cowIdsInFarm[0].c[0]);

        try {
            // Stable does not exist.
            await farms.demolishStable(2, "c");
            assert.fail();
        } catch (err) {
            // Do nothing.    
        }
    });
});

contract('Farms', async (accounts) => {
    it("should feed a stable", async () => {
        let cows = await Cows.deployed();
        let stables = await Stables.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();
        let farms = await Farms.deployed();
        let regulator = await Regulator.deployed();

        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await milkToken.setDependencies(regulator.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);

        try {
            // Farm does not exist.
            await farms.feedStable(2, 3, "a");
            assert.fail();
        } catch (err) {
            // Do nothing.    
        }

        await farms.buildFarm(1, "b");

        [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(1);
        assert.equal(1, actualFarmId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(accounts[0], actualOwnerAddress);

        let stableIds = await farms.getStableIdsInFarm(1);
        assert.equal(0, stableIds.length);

        try {
            // Stable does not exist.
            await farms.feedStable(2, 3, "c");
            assert.fail();
        } catch (err) {
            // Do nothing.    
        }

        await farms.buildStable(2, 1, 100, 100, 10000, "d");

        await farms.birthCow(3, 2, 50, 500, 120, "e");
        await farms.birthCow(4, 2, 50, 1500, 120, "e");
        await farms.birthCow(5, 2, 50, 250, 120, "e");

        stableIds = await farms.getStableIdsInFarm(1);
        assert.equal(1, stableIds.length);
        assert.equal(2, stableIds[0].c[0]);

        // Sunshine.
        await farms.feedStable(2, 3, "e");

        // TODO: Check that the cows are slightly happier.
    });
});

contract('Farms', async (accounts) => {
    it("should milk a stable", async () => {
        let cows = await Cows.deployed();
        let stables = await Stables.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();
        let farms = await Farms.deployed();
        let regulator = await Regulator.deployed();

        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await milkToken.setDependencies(regulator.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);

        try {
            // Farm does not exist.
            await farms.milkStable(2, 3, "a");
            assert.fail();
        } catch (err) {
            // Do nothing.    
        }

        await farms.buildFarm(1, "b");

        [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(1);
        assert.equal(1, actualFarmId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(accounts[0], actualOwnerAddress);

        let stableIds = await farms.getStableIdsInFarm(1);
        assert.equal(0, stableIds.length);

        try {
            // Stable does not exist.
            await farms.milkStable(2, 3, "c");
            assert.fail();
        } catch (err) {
            // Do nothing.    
        }

        await farms.buildStable(2, 1, 100, 100, 10000, "d");

        await farms.birthCow(3, 2, 50, 500, 120, "e");
        await farms.birthCow(4, 2, 50, 1500, 120, "f");
        await farms.birthCow(5, 2, 50, 250, 120, "g");

        stableIds = await farms.getStableIdsInFarm(1);
        assert.equal(1, stableIds.length);
        assert.equal(2, stableIds[0].c[0]);

        // Sunshine.
        await farms.milkStable(2, 3, "h");

        // TODO: Check that the cows are slightly less happy.
    });
});

contract('Farms', async (accounts) => {
    it("should give birth to a cow", async () => {
        let cows = await Cows.deployed();
        let stables = await Stables.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();
        let farms = await Farms.deployed();
        let regulator = await Regulator.deployed();

        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await milkToken.setDependencies(regulator.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);

        try {
            // Farm does not exist.
            await farms.birthCow(3, 2, 50, 500, 120, "e");
            assert.fail();
        } catch (err) {
            // Do nothing.    
        }

        await farms.buildFarm(1, "b");

        [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById(1);
        assert.equal(1, actualFarmId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(accounts[0], actualOwnerAddress);

        let stableIds = await farms.getStableIdsInFarm(1);
        assert.equal(0, stableIds.length);

        try {
            // Stable does not exist.
            await farms.birthCow(3, 2, 50, 500, 120, "e");
            assert.fail();
        } catch (err) {
            // Do nothing.    
        }

        await farms.buildStable(2, 1, 100, 100, 10000, "d");

        // Sunshine.
        await farms.birthCow(3, 2, 50, 500, 120, "e");

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(3);
        assert.equal(3, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(1, actualLifeState);
        assert.equal(50, actualWelfare.c[0]);
        assert.equal(500, actualWeight.c[0]);
        assert.equal(120, actualHeartRate.c[0]);
        assert.isFalse(actualIsActive);

        cowIdsInStable = await farms.getCowIdsInStable(2);
        assert.equal(1, cowIdsInStable.length);
        assert.equal(3, cowIdsInStable[0].c[0]);

        cowIdsInFarm = await farms.getCowIdsInFarm(1);
        assert.equal(1, cowIdsInFarm.length);
        assert.equal(3, cowIdsInFarm[0].c[0]);

        try {
            // Cow already exists.
            await farms.birthCow(3, 2, 70, 100, 20, "f");
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(3);
            assert.equal(3, actualCowId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(1, actualLifeState);
            assert.equal(50, actualWelfare.c[0]);
            assert.equal(500, actualWeight.c[0]);
            assert.equal(120, actualHeartRate.c[0]);
            assert.isFalse(actualIsActive);
        }
    });
});

contract('Farms', async (accounts) => {
    it("should kill a cow", async () => {
        let cows = await Cows.deployed();
        let stables = await Stables.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();
        let farms = await Farms.deployed();
        let regulator = await Regulator.deployed();

        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await milkToken.setDependencies(regulator.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);

        try {
            // Farm does not exist.
            await farms.killCow(3, "a");
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        await farms.buildFarm(1, "b");

        try {
            // Stable does not exist.
            await farms.killCow(3, "a");
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        await farms.buildStable(2, 1, 100, 100, 10000, "d");

        try {
            // Cow does not exist.
            await farms.killCow(3, "a");
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        await farms.birthCow(3, 2, 50, 500, 120, "e");

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(3);
        assert.equal(3, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(1, actualLifeState);
        assert.equal(50, actualWelfare.c[0]);
        assert.equal(500, actualWeight.c[0]);
        assert.equal(120, actualHeartRate.c[0]);
        assert.isFalse(actualIsActive);

        // Sunshine.
        await farms.killCow(3, "kaput");

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(3);
        assert.equal(3, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(2, actualLifeState);
        assert.equal(50, actualWelfare.c[0]);
        assert.equal(500, actualWeight.c[0]);
        assert.equal(120, actualHeartRate.c[0]);
        assert.isFalse(actualIsActive);
    });
});

contract('Farms', async (accounts) => {
    it("should slaughter a cow", async () => {
        let cows = await Cows.deployed();
        let stables = await Stables.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();
        let farms = await Farms.deployed();
        let regulator = await Regulator.deployed();

        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await milkToken.setDependencies(regulator.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);

        try {
            // Farm does not exist.
            await farms.slaughterCow(3, 1, "a");
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        await farms.buildFarm(1, "b");

        try {
            // Stable does not exist.
            await farms.slaughterCow(3, 1, "a");
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        await farms.buildStable(2, 1, 100, 100, 10000, "d");
        
        try {
            // Cow does not exist.
            await farms.slaughterCow(3, 1, "a");
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        await farms.birthCow(3, 2, 50, 500, 120, "e");
        await farms.killCow(3, "f");

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(3);
        assert.equal(3, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(2, actualLifeState);
        assert.equal(50, actualWelfare.c[0]);
        assert.equal(500, actualWeight.c[0]);
        assert.equal(120, actualHeartRate.c[0]);
        assert.isFalse(actualIsActive);

        // Sunshine -- as reflected by the knife.
        await farms.slaughterCow(3, 4, "kaput");

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(3);
        assert.equal(3, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(3, actualLifeState);
        assert.equal(50, actualWelfare.c[0]);
        assert.equal(500, actualWeight.c[0]);
        assert.equal(120, actualHeartRate.c[0]);
        assert.isFalse(actualIsActive);
    });
});

contract('Farms', async (accounts) => {
    it("should sell a cow", async () => {
        let cows = await Cows.deployed();
        let stables = await Stables.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();
        let farms = await Farms.deployed();
        let regulator = await Regulator.deployed();

        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await milkToken.setDependencies(regulator.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);

        try {
            // Cow does not exist.
            await farms.sellCow(5, 4, "a");
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        await farms.buildFarm(1, "b");
        await farms.buildStable(2, 1, 100, 100, 100, "c");
        await farms.birthCow(5, 2, 100, 100, 100, "d");
        await farms.birthCow(6, 2, 100, 100, 100, "d");
        await farms.birthCow(7, 2, 100, 100, 100, "d");

        try {
            // Stable does not exist.
            await farms.sellCow(5, 4, "e");
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        await farms.buildFarm(5, "f");
        await farms.buildStable(6, 5, 100, 100, 100, "g");

        try {
            // The owner is the same as the buyer.
            await farms.sellCow(5, 6, "h");
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        try {
            // Stable is the same as where the cow is.
            await farms.sellCow(5, 2, "i");
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        await farms.buildFarm(3, "j", {from: accounts[1]});

        [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById.call(3);
        assert.equal(3, actualFarmId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(accounts[1], actualOwnerAddress);

        await farms.buildStable(4, 3, 100, 100, 100, "k", {from: accounts[1]});

        let cowIdsInStable = await farms.getCowIdsInStable(2);
        assert.equal(3, cowIdsInStable.length);
        assert.equal(5, cowIdsInStable[0].c[0]);
        assert.equal(6, cowIdsInStable[1].c[0]);
        assert.equal(7, cowIdsInStable[2].c[0]);

        let cowIdsInFarm = await farms.getCowIdsInFarm(1);
        assert.equal(3, cowIdsInFarm.length);
        assert.equal(5, cowIdsInFarm[0].c[0]);
        assert.equal(6, cowIdsInFarm[1].c[0]);
        assert.equal(7, cowIdsInFarm[2].c[0]);

        cowIdsInStable = await farms.getCowIdsInStable(4);
        assert.equal(0, cowIdsInStable.length);
        
        cowIdsInFarm = await farms.getCowIdsInFarm(3);
        assert.equal(0, cowIdsInFarm.length);

        // Sunshine.
        await farms.sellCow(5, 4, "l");

        cowIdsInStable = await farms.getCowIdsInStable(2);
        assert.equal(2, cowIdsInStable.length);
        assert.equal(7, cowIdsInStable[0].c[0]);
        assert.equal(6, cowIdsInStable[1].c[0]);

        cowIdsInFarm = await farms.getCowIdsInFarm(1);
        assert.equal(2, cowIdsInFarm.length);
        assert.equal(7, cowIdsInFarm[0].c[0]);
        assert.equal(6, cowIdsInFarm[1].c[0]);

        cowIdsInStable = await farms.getCowIdsInStable(4);
        assert.equal(1, cowIdsInStable.length);
        assert.equal(5, cowIdsInStable[0].c[0]);
        
        cowIdsInFarm = await farms.getCowIdsInFarm(3);
        assert.equal(1, cowIdsInFarm.length);
        assert.equal(5, cowIdsInFarm[0].c[0]);
        
        try {
            // Cow is not in the user's possession anymore.
            await farms.sellCow(5, 4, "a");
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        await farms.killCow(6, "t");

        try {
            // Cow is dead.
            await farms.sellCow(6, 4, "a");
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        await farms.killCow(7, "u");
        await farms.slaughterCow(7, 3, "v");

        try {
            // Cow is not slaughtered.
            await farms.sellCow(7, 4, "a");
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        cowIdsInStable = await farms.getCowIdsInStable(2);
        assert.equal(2, cowIdsInStable.length);
        assert.equal(7, cowIdsInStable[0].c[0]);
        assert.equal(6, cowIdsInStable[1].c[0]);

        cowIdsInFarm = await farms.getCowIdsInFarm(1);
        assert.equal(2, cowIdsInFarm.length);
        assert.equal(7, cowIdsInFarm[0].c[0]);
        assert.equal(6, cowIdsInFarm[1].c[0]);

        cowIdsInStable = await farms.getCowIdsInStable(4);
        assert.equal(1, cowIdsInStable.length);
        assert.equal(5, cowIdsInStable[0].c[0]);
        
        cowIdsInFarm = await farms.getCowIdsInFarm(3);
        assert.equal(1, cowIdsInFarm.length);
        assert.equal(5, cowIdsInFarm[0].c[0]);
    });
});

contract('Farms', async (accounts) => {
    it("should emit the generic event", async () => {
        let farms = await Farms.deployed();

        try {
            // The cow does not exist.
            await farms.emitGenericFarmEvent(1, "A type", "x");
            assert.fail();
        } catch (err) {
            [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById.call(1);
            assert.equal(1, actualFarmId.c[0]);
            assert.isFalse(actualExists);
        }

        await farms.buildFarm(1, "y");

        await farms.emitGenericFarmEvent(1, "Another type", "y");

        [actualFarmId, actualExists, actualOwnerAddress] = await farms.getFarmById.call(1);
        assert.equal(1, actualFarmId.c[0]);
        assert.isTrue(actualExists);
    });
});