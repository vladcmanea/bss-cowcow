const Regulator = artifacts.require("Regulator");
const Farms = artifacts.require("Farms");
const Stables = artifacts.require("Stables");
const Cows = artifacts.require("Cows");
const MilkToken = artifacts.require("MilkToken");
const MeatToken = artifacts.require("MeatToken");
const Supermarket = artifacts.require("Supermarket");

contract('Milk token', async (accounts) => {
    it("should mint", async () => {
        let farms = await Farms.deployed();
        let stables = await Stables.deployed();
        let cows = await Cows.deployed();
        let regulator = await Regulator.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();
        
        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await milkToken.setDependencies(regulator.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);

        await farms.buildFarm(1, "x");
        await farms.buildStable(1, 1, 100, 100, 100, "y");
        await farms.birthCow(1, 1, 100, 1000, 100, "z");
        await farms.birthCow(2, 1, 5, 1000, 100, "z");

        var cowIds = [];
        cowIds.push(1);
        cowIds.push(2);

        await milkToken.mint(5, cowIds, accounts[0]);

        let milks = await milkToken.getMilkIds();
        assert.equal(1, milks.length);

        try {
            // The quantity is zero.
            await milkToken.mint(0, cowIds, accounts[0]);
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        try {
            // The array of cows is empty.
            await milkToken.mint(5, [], accounts[0]);
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        const emptyAccount = '0x0000000000000000000000000000000000000000';

        try {
            // The owner is zero.
            await milkToken.mint(5, cowIds, emptyAccount);
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        milks = await milkToken.getMilkIds();
        assert.equal(1, milks.length);
    });
});

contract('Milk token', async (accounts) => {
    it("should be sold", async () => {
        let farms = await Farms.deployed();
        let stables = await Stables.deployed();
        let cows = await Cows.deployed();
        let regulator = await Regulator.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();
        let supermarket = await Supermarket.deployed();
        
        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await milkToken.setDependencies(regulator.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);

        await farms.buildFarm(1, "x");
        await farms.buildStable(1, 1, 100, 100, 100, "y");
        await farms.birthCow(1, 1, 100, 1000, 100, "z");
        await farms.birthCow(2, 1, 5, 1000, 100, "z");

        await farms.milkStable(1, 10, "milky way");

        let milks = await milkToken.getMilkIds();
        assert.equal(1, milks.length);

        let oldContract = await milkToken.ownerOf(0);
        assert.equal(oldContract, farms.address);

        let oldMilk = await milkToken.getMilkById(0);
        assert.equal(oldMilk[1], accounts[0]);

        await farms.sellMilk(0, supermarket.address, accounts[1]);

        let newContract = await milkToken.ownerOf(0);
        assert.equal(newContract, supermarket.address);

        let newMilk = await milkToken.getMilkById(0);
        assert.equal(newMilk[1], accounts[1]);
    });
});

contract('Milk token', async (accounts) => {
    it("should get milk by ID", async () => {
        let farms = await Farms.deployed();
        let stables = await Stables.deployed();
        let cows = await Cows.deployed();
        let regulator = await Regulator.deployed();
        let milkToken = await MilkToken.deployed();
        let meatToken = await MeatToken.deployed();
        
        await farms.setDependencies(stables.address, cows.address, milkToken.address, meatToken.address);
        await milkToken.setDependencies(regulator.address);
        await regulator.setDependencies(farms.address, stables.address, cows.address);

        await farms.buildFarm(1, "x");
        await farms.buildStable(1, 1, 100, 100, 100, "y");
        await farms.birthCow(1, 1, 100, 1000, 100, "z");

        var cowIds = [];
        cowIds.push(1);

        await milkToken.mint(5, cowIds, accounts[0]);

        // Sunshine.
        let milk = await milkToken.getMilkById(0);
        assert.equal(0, milk[0].c[0]); // The index.
        assert.equal(accounts[0], milk[1]); // The owner (account).
        assert.equal(5, milk[2].c[0]); // The quantity.
        assert.equal(100, milk[3].c[0]); // The quality of the milk.

        try {
            // The index is out of bounds.
            await milkToken.getMilkById(1);
            assert.fail();
        } catch (err) {
            // Do nothing.
        }

        await milkToken.mint(5, cowIds, accounts[0]);

        let milks = await milkToken.getMilkIds();
        assert.equal(2, milks.length);
    });
});