const Stables = artifacts.require("Stables");

contract('Stables', async (accounts) => {
    it("should get the stable IDs", async () => {
        let stables = await Stables.deployed();

        let stableIds = await stables.getStableIds();
        assert.equal(0, stableIds.length);

        // Sunshine up to 10 stables.
        for (var i = 1; i <= 10; ++i) {
            await stables.build(i, 100, 100, 10000, "x");

            stableIds = await stables.getStableIds();
            assert.equal(i, stableIds.length);

            for (var j = 0; j < i; ++j) {
                assert.equal(j + 1, stableIds[j].c[0]);
            }
        }
    });
});

contract('Stables', async (accounts) => {
    it("should get the stable by ID", async () => {
        let stables = await Stables.deployed();

        // Stable does not exist.
        [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
        assert.equal(1, actualStableId);
        assert.isFalse(actualExists);

        // Sunshine (1/2) some owner.
        await stables.build(1, 50, 100, 10000, "x");

        [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
        assert.equal(1, actualStableId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(50, actualAirQuality.c[0]);
        assert.equal(100, actualSizeOfBarn.c[0]);
        assert.equal(10000, actualSizeOfField.c[0]);

        // Sunshine (2/2) some owner.
        await stables.build(2, 100, 100, 7500, "y");

        [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(2);
        assert.equal(2, actualStableId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(100, actualAirQuality.c[0]);
        assert.equal(100, actualSizeOfBarn.c[0]);
        assert.equal(7500, actualSizeOfField.c[0]);
        
        [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
        assert.equal(1, actualStableId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(50, actualAirQuality.c[0]);
        assert.equal(100, actualSizeOfBarn.c[0]);
        assert.equal(10000, actualSizeOfField.c[0]);
    });
});

contract('Stables', async (accounts) => {
    it("should build", async () => {
        let stables = await Stables.deployed();

        // Sunshine.
        await stables.build(1, 50, 50, 5000, "x");
        await stables.build(2, 100, 100, 10000, "y");

        [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
        assert.equal(1, actualStableId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(50, actualAirQuality.c[0]);
        assert.equal(50, actualSizeOfBarn.c[0]);
        assert.equal(5000, actualSizeOfField.c[0]);

        [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(2);
        assert.equal(2, actualStableId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(100, actualAirQuality.c[0]);
        assert.equal(100, actualSizeOfBarn.c[0]);
        assert.equal(10000, actualSizeOfField.c[0]);

        try {
            // Stable already exists.
            await stables.build(1, 20, 100, 10000, "z");
            assert.fail();
        } catch (err) {
            [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
            assert.equal(1, actualStableId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(50, actualAirQuality.c[0]);
            assert.equal(50, actualSizeOfBarn.c[0]);
            assert.equal(5000, actualSizeOfField.c[0]);
        }

        try {
            // Air quality is invalid.
            await stables.build(3, 101, 100, 10000, "t");
            assert.fail();
        } catch (err) {
            [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(3);
            assert.equal(3, actualStableId.c[0]);
            assert.isFalse(actualExists);
        }

        try {
            // Size of barn is invalid.
            await stables.build(4, 100, 1001, 10000, "u");
            assert.fail();
        } catch (err) {
            [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(4);
            assert.equal(4, actualStableId.c[0]);
            assert.isFalse(actualExists);
        }

        try {
            // Size of field is invalid.
            await stables.build(5, 100, 100, 10001, "v");
            assert.fail();
        } catch (err) {
            [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(5);
            assert.equal(5, actualStableId.c[0]);
            assert.isFalse(actualExists);
        }
    });
});

contract('Stables', async (accounts) => {
    it("should update air quality", async () => {
        let stables = await Stables.deployed();

        try {
            // Stable does not exist.
            await stables.updateAirQuality(1, 10, "x");
            assert.fail();
        } catch (err) {
            [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
            assert.equal(1, actualStableId.c[0]);
            assert.isFalse(actualExists);
        }

        await stables.build(1, 95, 95, 9999, "y");

        [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
        assert.equal(1, actualStableId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(95, actualAirQuality.c[0]);

        // Sunshine some account.
        await stables.updateAirQuality(1, 30, "z");
        
        [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
        assert.equal(1, actualStableId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(30, actualAirQuality.c[0]);
        
        // Sunshine some other account.
        await stables.updateAirQuality(1, 100, "z", {from: accounts[1]});
        
        [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
        assert.equal(1, actualStableId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(100, actualAirQuality.c[0]);

        try {
            // Air quality is invalid.
            await stables.updateAirQuality(1, 101, "t");
            assert.fail();
        } catch (err) {
            [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
            assert.equal(1, actualStableId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(100, actualAirQuality.c[0]);
        }
    });
});

contract('Stables', async (accounts) => {
    it("should update size of barn", async () => {
        let stables = await Stables.deployed();

        try {
            // Stable does not exist.
            await stables.updateSizeOfBarn(1, 10, "x");
            assert.fail();
        } catch (err) {
            [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
            assert.equal(1, actualStableId.c[0]);
            assert.isFalse(actualExists);
        }

        await stables.build(1, 95, 95, 9999, "y");

        [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
        assert.equal(1, actualStableId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(95, actualSizeOfBarn.c[0]);

        // Sunshine.
        await stables.updateSizeOfBarn(1, 90, "z");
        
        [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
        assert.equal(1, actualStableId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(90, actualSizeOfBarn.c[0]);
        
        // Sunshine.
        await stables.updateSizeOfBarn(1, 1000, "z", {from: accounts[1]});
        
        [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
        assert.equal(1, actualStableId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(1000, actualSizeOfBarn.c[0]);

        try {
            // Size of barn is invalid.
            await stables.updateSizeOfBarn(1, 1001, "t");
            assert.fail();
        } catch (err) {
            [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
            assert.equal(1, actualStableId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(1000, actualSizeOfBarn.c[0]);
        }
    });
});

contract('Stables', async (accounts) => {
    it("should update size of field", async () => {
        let stables = await Stables.deployed();

        try {
            // Stable does not exist.
            await stables.updateSizeOfField(1, 10, "x");
            assert.fail();
        } catch (err) {
            [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
            assert.equal(1, actualStableId.c[0]);
            assert.isFalse(actualExists);
        }

        await stables.build(1, 95, 95, 9999, "y");

        [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
        assert.equal(1, actualStableId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(9999, actualSizeOfField.c[0]);

        // Sunshine.
        await stables.updateSizeOfField(1, 9999, "z");
        
        [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
        assert.equal(1, actualStableId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(9999, actualSizeOfField.c[0]);
        
        // Sunshine.
        await stables.updateSizeOfField(1, 10000, "z", {from: accounts[1]});
        
        [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
        assert.equal(1, actualStableId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(10000, actualSizeOfField.c[0]);

        try {
            // Size of barn is invalid.
            await stables.updateSizeOfField(1, 10001, "t");
            assert.fail();
        } catch (err) {
            [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
            assert.equal(1, actualStableId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(10000, actualSizeOfField.c[0]);
        }
    });
});

contract('Stables', async (accounts) => {
    it("should demolish", async () => {
        let stables = await Stables.deployed();

        try {
            // Stable does not exist.
            await stables.demolish(1, "x");
            assert.fail();
        } catch (err) {
            [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
            assert.equal(1, actualStableId.c[0]);
            assert.isFalse(actualExists);
        }

        await stables.build(1, 50, 50, 5000, "x");

        let stableIds = await stables.getStableIds();
        assert.equal(1, stableIds.length);
    
        try {
            // The account is not the owner of the stable.
            await stables.demolish(1, "u", {from: accounts[1]});
            assert.fail();
        } catch (err) {
            [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
            assert.equal(1, actualStableId.c[0]);
            assert.isTrue(actualExists);
        }

        // Sunshine.
        await stables.demolish(1, "y");

        [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
        assert.equal(1, actualStableId.c[0]);
        assert.isFalse(actualExists);

        stableIds = await stables.getStableIds();
        assert.equal(0, stableIds.length);
    });
});

contract('Stables', async (accounts) => {
    it("should demolish in a complex setting", async () => {
        let stables = await Stables.deployed();

        let stableIds;

        // Build ten stables one by one.
        for (var i = 1; i <= 10; ++i) {
            await stables.build(10 - i + 1, 50, 50, 5000, "x");

            stableIds = await stables.getStableIds();
            assert.equal(i, stableIds.length);

            var found = false;

            for (var j = 0; j < stableIds.length && !found; ++j) {
                if (stableIds[j] == 10 - i + 1) {
                    found = true;
                }
            }

            assert.isTrue(found);
        }

        // Demolish the ten stables one by one.
        for (var i = 1; i <= 10; ++i) {
            var k = (i + 3) % 10 + 1;

            stableIds = await stables.getStableIds();
            assert.equal(10 - i + 1, stableIds.length);

            var found = false;

            for (var j = 0; j < stableIds.length && !found; ++j) {
                if (stableIds[j] == k) {
                    found = true;
                }
            }

            assert.isTrue(found);

            [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(k);
            assert.equal(k, actualStableId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(50, actualAirQuality.c[0]);
            assert.equal(50, actualSizeOfBarn.c[0]);
            assert.equal(5000, actualSizeOfField.c[0]);

            await stables.demolish(k, "z");

            stableIds = await stables.getStableIds();
            assert.equal(10 - i, stableIds.length);

            found = false;

            for (var j = 0; j < stableIds.length && !found; ++j) {
                if (stableIds[j] == k) {
                    found = true;
                }
            }

            assert.isFalse(found);

            [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(k);
            assert.equal(k, actualStableId.c[0]);
            assert.isFalse(actualExists);
        }

        stableIds = await stables.getStableIds();
        assert.equal(0, stableIds.length);
    });
});

contract('Stables', async (accounts) => {
    it("should emit the generic event", async () => {
        let stables = await Stables.deployed();

        try {
            // The stable does not exist.
            await stables.emitGenericStableEvent(1, "A type", "x");
            assert.fail();
        } catch (err) {
            [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
            assert.equal(1, actualStableId.c[0]);
            assert.isFalse(actualExists);
        }

        await stables.build(1, 95, 90, 542, "y");

        await stables.emitGenericStableEvent(1, "Another type", "y");

        [actualStableId, actualExists, actualAirQuality, actualSizeOfBarn, actualSizeOfField] = await stables.getStableById.call(1);
        assert.equal(1, actualStableId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(95, actualAirQuality.c[0]);
        assert.equal(90, actualSizeOfBarn.c[0]);
        assert.equal(542, actualSizeOfField.c[0]);
    });
});