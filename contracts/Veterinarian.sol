pragma solidity ^0.4.24;

import './Farms.sol';
import './Stables.sol';
import './Cows.sol';

contract Veterinarian {
    address farmsAddress;
    address stablesAddress;
    address cowsAddress;

    function setDependencies(address _farmsAddress, address _stablesAddress, address _cowsAddress) public {
        farmsAddress = _farmsAddress;
        stablesAddress = _stablesAddress;
        cowsAddress = _cowsAddress;
    }

    function getCowHealth(uint _cowId) public view returns (uint) {
        uint cowHealth;
        Cows.LifeState lifeState;

        (cowHealth, lifeState) = getOnlyCowHealth(_cowId);

        if (lifeState != Cows.LifeState.Alive) {
            return 0;
        }

        uint stableHealth = getOnlyStableHealth(_cowId);

        uint absoluteHealth = (3 * cowHealth + stableHealth) / 4;

        if (absoluteHealth > 100) {
            return 100;
        }

        return absoluteHealth;
    }

    function getOnlyCowHealth(uint _cowId) private view returns (uint, Cows.LifeState) {
        Cows cows = Cows(cowsAddress);

        uint cowId;
        bool exists;
        Cows.LifeState lifeState;
        uint welfare;
        uint weight;
        uint heartRate;
        bool isActive;

        (cowId, exists, lifeState, welfare, weight, heartRate, isActive) = cows.getCowById(_cowId);

        if (!exists || lifeState != Cows.LifeState.Alive) {
            return (100, lifeState);
        }

        // Heart rate from: http://www.nadis.org.uk/bulletins/the-healthy-cow.aspx
        if (heartRate < 48) {
            return ((welfare + (48 - heartRate)) / 2, lifeState);
        }

        // Heart rate from: http://www.nadis.org.uk/bulletins/the-healthy-cow.aspx
        if (heartRate > 84) {
            return ((welfare + (heartRate - 84) / 2) / 2, lifeState);
        }

        return ((welfare + 100) / 2, lifeState);
    }

    function getOnlyStableHealth(uint _cowId) private view returns (uint) {
        Farms farms = Farms(farmsAddress);
        uint stableId = farms.getCowStableId(_cowId);

        bool exists;
        uint stableId1;
        uint airQuality;
        uint sizeOfBarn;
        uint sizeOfField;

        Stables stables = Stables(stablesAddress);
        (stableId1, exists, airQuality, sizeOfBarn, sizeOfField) = stables.getStableById(stableId);

        if (!exists) {
            return 0;
        }

        return airQuality;
    }
}