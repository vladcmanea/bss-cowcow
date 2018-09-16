const Cows = artifacts.require("Cows");

contract('Cows', async (accounts) => {
    it("should get the cow IDs", async () => {
        let cows = await Cows.deployed();

        let cowIds = await cows.getCowIds();
        assert.equal(0, cowIds.length);

        // Sunshine up to 10 cows.
        for (var i = 1; i <= 10; ++i) {
            await cows.birth(i, 100, 2000, 100, "x");

            cowIds = await cows.getCowIds();
            assert.equal(i, cowIds.length);

            for (var j = 0; j < i; ++j) {
                assert.equal(j + 1, cowIds[j].c[0]);
            }
        }
    });
});

contract('Cows', async (accounts) => {
    it("should get the cow by ID", async () => {
        let cows = await Cows.deployed();

        // Cow does not exist.
        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId);
        assert.isFalse(actualExists);

        // Sunshine (1/2).
        await cows.birth(1, 95, 120, 100, "x");

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);

        // Sunshine (2/2).
        await cows.birth(2, 96, 121, 100, "x");

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(2);
        assert.equal(2, actualCowId.c[0]);
        assert.isTrue(actualExists);
        
        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
    });
});

contract('Cows', async (accounts) => {
    it("should get the cow life state by ID", async () => {
        let cows = await Cows.deployed();

        // Cow does not exist.
        actualLifeState = await cows.getCowLifeStateById.call(1);
        assert.equal(1, actualCowId);
        assert.equal(0, actualLifeState);

        // Sunshine (1/2).
        await cows.birth(1, 95, 120, 100, "x");

        actualLifeState = await cows.getCowLifeStateById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.equal(1, actualLifeState);

        // Kill the cow.
        await cows.kill(1, "y");

        actualLifeState = await cows.getCowLifeStateById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.equal(2, actualLifeState);

        // Slaughter the cow.
        await cows.slaughter(1, "z");

        actualLifeState = await cows.getCowLifeStateById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.equal(3, actualLifeState);
    });
});

contract('Cows', async (accounts) => {
    it("should give birth", async () => {
        let cows = await Cows.deployed();

        // Sunshine.
        await cows.birth(1, 95, 120, 100, "x");
        await cows.birth(2, 100, 2000, 100, "y");

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(1, actualLifeState);
        assert.equal(95, actualWelfare.c[0]);
        assert.equal(120, actualWeight.c[0]);
        assert.equal(100, actualHeartRate.c[0]);
        assert.isFalse(actualIsActive);

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(2);
        assert.equal(2, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(1, actualLifeState);
        assert.equal(100, actualWelfare.c[0]);
        assert.equal(2000, actualWeight.c[0]);
        assert.equal(100, actualHeartRate.c[0]);
        assert.isFalse(actualIsActive);

        try {
            // Cow already exists.
            await cows.birth(1, 20, 400, 100, "z");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(1, actualLifeState);
            assert.equal(95, actualWelfare.c[0]);
            assert.equal(120, actualWeight.c[0]);
            assert.equal(100, actualHeartRate.c[0]);
            assert.isFalse(actualIsActive);
        }

        try {
            // Welfare is invalid.
            await cows.birth(3, 101, 400, 100, "z");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(3);
            assert.equal(3, actualCowId.c[0]);
            assert.isFalse(actualExists);
        }

        try {
            // Weight is invalid.
            await cows.birth(4, 100, 2001, 100, "z");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(4);
            assert.equal(4, actualCowId.c[0]);
            assert.isFalse(actualExists);
        }
    });
});

contract('Cows', async (accounts) => {
    it("should kill", async () => {
        let cows = await Cows.deployed();
    
        try {
            // Cow does not exist.
            await cows.kill(1, "x");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.isFalse(actualExists);
        }

        await cows.birth(1, 95, 120, 100, "y");

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(1, actualLifeState);

        try {
            // Cow has another owner.
            await cows.kill(1, "x", {from: accounts[1]});
            assert.fail();
        } catch (err) {
            assert.equal(1, actualCowId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(1, actualLifeState);
        }

        // Sunshine.
        await cows.kill(1, "z");

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(2, actualLifeState);

        try {
            // Cow is already killed.
            await cows.kill(1, "t");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(2, actualLifeState);
        }

        await cows.slaughter(1, "u");

        try {
            // Cow is slaughtered.
            await cows.kill(1, "v");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(3, actualLifeState);
        }
    });
});

contract('Cows', async (accounts) => {
    it("should slaughter", async () => {
        let cows = await Cows.deployed();

        try {
            // Cow does not exist.
            await cows.slaughter(1, "x");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.isFalse(actualExists);
        }

        await cows.birth(1, 95, 120, 100, "y");

        try {
            // Cow is not dead yet.
            await cows.slaughter(1, "z");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(1, actualLifeState);
        }

        await cows.kill(1, "t");

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(2, actualLifeState);

        try {
            // Cow has another owner.
            await cows.slaughter(1, "x", {from: accounts[1]});
            assert.fail();
        } catch (err) {
            assert.equal(1, actualCowId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(2, actualLifeState);
        }

        // Sunshine.
        await cows.slaughter(1, "t");

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(3, actualLifeState);

        try {
            // Cow is already slaughtered.
            await cows.slaughter(1, "u");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(3, actualLifeState);
        }
    });
});

contract('Cows', async (accounts) => {
    it("should update welfare", async () => {
        let cows = await Cows.deployed();

        try {
            // Cow does not exist.
            await cows.updateWelfare(1, 10, "x");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.isFalse(actualExists);
        }

        await cows.birth(1, 95, 120, 100, "y");

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(95, actualWelfare.c[0]);

        // Sunshine as the user.
        await cows.updateWelfare(1, 99, "z");
        
        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(99, actualWelfare.c[0]);
        
        // Sunshine as another user.
        await cows.updateWelfare(1, 100, "z", {from: accounts[1]});
        
        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(100, actualWelfare.c[0]);

        try {
            // Welfare is invalid.
            await cows.updateWelfare(1, 101, "t");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(100, actualWelfare.c[0]);
        }
        
        await cows.kill(1, "u");

        try {
            // Cow is already dead.
            await cows.updateWelfare(1, 81, "v");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.equal(2, actualLifeState);
            assert.isTrue(actualExists);
            assert.equal(100, actualWelfare.c[0]);
        }

        await cows.slaughter(1, "w");

        try {
            // Cow is already slaughtered.
            await cows.updateWelfare(1, 81, "n");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.equal(3, actualLifeState);
            assert.isTrue(actualExists);
            assert.equal(100, actualWelfare.c[0]);
        }
    });
});

contract('Cows', async (accounts) => {
    it("should update weight", async () => {
        let cows = await Cows.deployed();

        try {
            // Cow does not exist.
            await cows.updateWeight(1, 10, "x");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.isFalse(actualExists);
        }

        await cows.birth(1, 95, 120, 100, "y");

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(120, actualWeight.c[0]);

        // Sunshine as the user.
        await cows.updateWeight(1, 1999, "z");
        
        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(1999, actualWeight.c[0]);
        
        // Sunshine as another user.
        await cows.updateWeight(1, 2000, "z", {from: accounts[1]});
        
        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(2000, actualWeight.c[0]);

        try {
            // Weight is invalid.
            await cows.updateWeight(1, 2001, "t");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(2000, actualWeight.c[0]);
        }
        
        await cows.kill(1, "u");

        try {
            // Cow is already dead.
            await cows.updateWeight(1, 100, "v");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.equal(2, actualLifeState);
            assert.isTrue(actualExists);
            assert.equal(2000, actualWeight.c[0]);
        }

        await cows.slaughter(1, "w");

        try {
            // Cow is already slaughtered.
            await cows.updateWeight(1, 300, "n");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.equal(3, actualLifeState);
            assert.isTrue(actualExists);
            assert.equal(2000, actualWeight.c[0]);
        }
    });
});

contract('Cows', async (accounts) => {
    it("should update heart rate", async () => {
        let cows = await Cows.deployed();

        try {
            // Cow does not exist.
            await cows.updateHeartRate(1, 10, "x");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.isFalse(actualExists);
        }

        await cows.birth(1, 95, 120, 100, "y");

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(100, actualHeartRate.c[0]);
        
        // Sunshine as the owner.
        await cows.updateHeartRate(1, 5, "z");
        
        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(5, actualHeartRate.c[0]);
        
        // Sunshine as another user.
        await cows.updateHeartRate(1, 180, "z", {from: accounts[1]});
        
        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.equal(180, actualHeartRate.c[0]);

        try {
            // Heart rate is invalid.
            await cows.updateHeartRate(1, 4, "t");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(180, actualHeartRate.c[0]);
        }
        
        try {
            // Heart rate is invalid.
            await cows.updateHeartRate(1, 181, "t");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.isTrue(actualExists);
            assert.equal(180, actualHeartRate.c[0]);
        }

        await cows.kill(1, "u");

        try {
            // Cow is already dead.
            await cows.updateHeartRate(1, 81, "v");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.equal(2, actualLifeState);
            assert.isTrue(actualExists);
            assert.equal(180, actualHeartRate.c[0]);
        }

        await cows.slaughter(1, "w");

        try {
            // Cow is already slaughtered.
            await cows.updateHeartRate(1, 81, "n");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.equal(3, actualLifeState);
            assert.isTrue(actualExists);
            assert.equal(180, actualHeartRate.c[0]);
        }
    });
});

contract('Cows', async (accounts) => {
    it("should update is active", async () => {
        let cows = await Cows.deployed();

        try {
            // Cow does not exist.
            await cows.updateIsActive(1, true, "x");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.isFalse(actualExists);
        }

        await cows.birth(1, 95, 120, 100, "y");

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.isFalse(actualIsActive);

        // Sunshine as the owner.
        await cows.updateIsActive(1, true, "z");
        
        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.isTrue(actualIsActive);
        
        // Sunshine as another user.
        await cows.updateIsActive(1, false, "z", {from: accounts[1]});
        
        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.isTrue(actualExists);
        assert.isFalse(actualIsActive);

        await cows.kill(1, "u");

        try {
            // Cow is already dead.
            await cows.updateIsActive(1, true, "v");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.equal(2, actualLifeState);
            assert.isTrue(actualExists);
            assert.isFalse(actualIsActive);
        }

        await cows.slaughter(1, "w");

        try {
            // Cow is already slaughtered.
            await cows.updateIsActive(1, true, "v");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.equal(3, actualLifeState);
            assert.isTrue(actualExists);
            assert.isFalse(actualIsActive);
        }
    });
});

contract('Cows', async (accounts) => {
    it("should emit the generic event", async () => {
        let cows = await Cows.deployed();

        try {
            // The cow does not exist.
            await cows.emitGenericCowEvent(1, "A type", "x");
            assert.fail();
        } catch (err) {
            [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
            assert.equal(1, actualCowId.c[0]);
            assert.equal(0, actualLifeState);
            assert.isFalse(actualExists);
        }

        await cows.birth(1, 95, 120, 100, "y");

        await cows.emitGenericCowEvent(1, "Another type", "y");

        [actualCowId, actualExists, actualLifeState, actualWelfare, actualWeight, actualHeartRate, actualIsActive] = await cows.getCowById.call(1);
        assert.equal(1, actualCowId.c[0]);
        assert.equal(1, actualLifeState);
        assert.isTrue(actualExists);
        assert.equal(95, actualWelfare);
        assert.equal(120, actualWeight);
        assert.equal(100, actualHeartRate);
        assert.isFalse(actualIsActive);
    });
});