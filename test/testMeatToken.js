const Regulator = artifacts.require("Regulator");
const Farms = artifacts.require("Farms");
const Stables = artifacts.require("Stables");
const Cows = artifacts.require("Cows");
const MilkToken = artifacts.require("MilkToken");
const MeatToken = artifacts.require("MeatToken");
const Restaurant = artifacts.require("Restaurant");

contract('Meat token', async (accounts) => {
    it("should mint", async () => {
        let farms = await Farms.deployed();
        let stables = await Stables.deployed();
        let cows = await Cows.deployed();
        let regulator = await Regulator.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();
        let restaurant = await Restaurant.deployed();
        
        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);

        await farms.buildFarm(1, "x");
        await farms.buildStable(1, 1, 100, 100, 100, "y");
        await farms.birthCow(1, 1, 100, 1000, 100, "z");
        await farms.killCow(1, "x");
        await farms.slaughterCow(1, 5, "y");

        let meats = await meatToken.getMeatIds();
        assert.equal(5, meats.length);

        try {
            // The quantity is zero.
            await meatToken.mint(cowIds, 0, accounts[0]);
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        try {
            // The array of cows is empty.
            await meatToken.mint([], 5, accounts[0]);
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        const emptyAccount = '0x0000000000000000000000000000000000000000';

        try {
            // The owner is zero.
            await meatToken.mint(cowIds, 5, emptyAccount);
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        meats = await meatToken.getMeatIds();
        assert.equal(5, meats.length);
    });
});

contract('Meat token', async (accounts) => {
    it("should be sold", async () => {
        let farms = await Farms.deployed();
        let stables = await Stables.deployed();
        let cows = await Cows.deployed();
        let regulator = await Regulator.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();
        let restaurant = await Restaurant.deployed();
        
        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);

        await farms.buildFarm(1, "x");
        await farms.buildStable(1, 1, 100, 100, 100, "y");
        await farms.birthCow(1, 1, 100, 1000, 100, "z");
        await farms.killCow(1, "x");
        await farms.slaughterCow(1, 1, "y");

        let meats = await meatToken.getMeatIds();
        assert.equal(1, meats.length);

        let oldContract = await meatToken.ownerOf(0);
        assert.equal(oldContract, farms.address);

        let oldMeat = await meatToken.getMeatById(0);
        assert.equal(oldMeat[1], accounts[0]);

        await farms.sellMeat(0, restaurant.address, accounts[1]);

        let newContract = await meatToken.ownerOf(0);
        assert.equal(newContract, restaurant.address);

        let newMeat = await meatToken.getMeatById(0);
        assert.equal(newMeat[1], accounts[1]);
    });
});

contract('Meat token', async (accounts) => {
    it("should get meat by ID", async () => {
        let farms = await Farms.deployed();
        let stables = await Stables.deployed();
        let cows = await Cows.deployed();
        let regulator = await Regulator.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();
        
        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await meatToken.setDependencies(regulator.address, cows.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);

        await farms.buildFarm(1, "x");
        await farms.buildStable(1, 1, 100, 100, 100, "y");
        await farms.birthCow(1, 1, 100, 1000, 100, "z");
        await farms.killCow(1, "x");
        await farms.slaughterCow(1, 5, "x");

        var cowIds = [];
        cowIds.push(1);

        await meatToken.mint(cowIds, 5, accounts[0]);

        let meats = await meatToken.getMeatIds();
        assert.equal(10, meats.length);

        // Sunshine.
        for (var i = 0; i < 10; ++i) {
            let meat = await meatToken.getMeatById(i);
            assert.equal(i, meat[0].c[0]); // The index.
            assert.equal(accounts[0], meat[1]); // The owner (account).
            assert.equal(160, meat[2].c[0]); // The quantity (1000kg * 80% divided by 5 pieces).
            assert.equal(100, meat[3].c[0]); // The quality of the cow.
        }

        try {
            // The index is out of bounds.
            await meatToken.getMeatById(10);
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        for (var i = 0; i < 10; ++i) {
            let meat = await meatToken.getMeatById(i);
            assert.equal(i, meat[0].c[0]); // The index.
            assert.equal(accounts[0], meat[1]); // The owner (account).
            assert.equal(160, meat[2].c[0]); // The quantity (1000kg * 80% divided by 5 pieces).
            assert.equal(100, meat[3].c[0]); // The quality of the cow.
        }
    });
});