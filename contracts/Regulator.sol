pragma solidity ^0.4.24;

import './Farms.sol';
import './Stables.sol';
import './Cows.sol';

contract Regulator {
    address private farmsAddress;
    address private stablesAddress;
    address private cowsAddress;

    function setDependencies(address _farmsAddress, address _stablesAddress, address _cowsAddress) public {
        farmsAddress = _farmsAddress;
        stablesAddress = _stablesAddress;
        cowsAddress = _cowsAddress;
    }

    function getFarmQuality(uint _farmId) public view returns (uint) {
        Farms farms = Farms(farmsAddress);
        Stables stables = Stables(stablesAddress);
 
        uint totalSize = 0;
        uint totalQuality = 0;

        uint stableId;
        bool exists;
        uint airQuality;
        uint sizeOfBarn;
        uint sizeOfField;
        uint absoluteQuality;

        uint[] memory stableIds = farms.getStableIdsInFarm(_farmId);

        for (uint i = 0; i < stableIds.length; ++i) {
            absoluteQuality = getStableQuality(stableIds[i]);

            (stableId, exists, airQuality, sizeOfBarn, sizeOfField) = stables.getStableById(stableIds[i]);

            if (!exists) {
                continue;
            }

            totalSize += sizeOfBarn;
            totalQuality += absoluteQuality * sizeOfBarn;
        }

        if (totalSize <= 0) {
            return 100;
        }

        return totalQuality / totalSize;
    }

    function getStableQuality(uint _stableId) public view returns (uint) {
        Stables stables = Stables(stablesAddress);
        Farms farms = Farms(farmsAddress);

        uint stableId;
        bool exists;
        uint airQuality;
        uint sizeOfBarn;
        uint sizeOfField;
        (stableId, exists, airQuality, sizeOfBarn, sizeOfField) = stables.getStableById(_stableId);
        
        if (!exists) {
            return 100;
        }

        uint[] memory cowIds = farms.getCowIdsInStable(_stableId);

        if (cowIds.length <= 0) {
            return 100;
        }

        uint buildingQuality = 0;

        if (sizeOfBarn / cowIds.length >= 2 && sizeOfField / cowIds.length >= 20) {
            buildingQuality += 20;
        }

        if (sizeOfBarn / cowIds.length >= 4 && sizeOfField / cowIds.length >= 40) {
            buildingQuality += 20;
        }

        if (sizeOfBarn / cowIds.length >= 6 && sizeOfField / cowIds.length >= 60) {
            buildingQuality += 20;
        }

        if (sizeOfBarn / cowIds.length >= 8 && sizeOfField / cowIds.length >= 80) {
            buildingQuality += 20;
        }

        if (sizeOfBarn / cowIds.length >= 10 && sizeOfField / cowIds.length >= 100) {
            buildingQuality += 20;
        }

        return (buildingQuality * 4 + airQuality) / 5;
    }

    function getMeatQualityAtSlaughter(uint[] _cowIds) public view returns (uint) {
        Farms farms = Farms(farmsAddress);

        uint totalWeight = 0;
        uint totalQuality = 0;

        for (uint i = 0; i < _cowIds.length; ++i) {
            bool exists;
            Cows.LifeState lifeState;
            uint welfare;
            uint weightKg;
            uint airQuality;

            (exists, lifeState, welfare, weightKg) = getMeatQualityCowProperties(_cowIds[i]);

            if (!exists) {
                continue;
            }

            if (lifeState != Cows.LifeState.Slaughtered) {
                continue;
            }

            (exists, airQuality) = getMeatAndMilkQualityStableProperties(farms.getCowStableId(_cowIds[i]));

            if (!exists) {
                continue;
            }

            totalQuality += weightKg * (airQuality + 9 * welfare) / 10;
            totalWeight += weightKg;
        }

        if (totalWeight <= 0) {
            return 100;
        }

        return totalQuality / totalWeight;
    }

    function getMilkQualityAtCollection(uint[] _cowIds) public view returns (uint) {
        Farms farms = Farms(farmsAddress);

        uint totalWeight = 0;
        uint totalQuality = 0;

        for (uint i = 0; i < _cowIds.length; ++i) {
            bool exists;
            Cows.LifeState lifeState;
            uint welfare;
            uint weightKg;
            bool isActive;
            uint airQuality;

            (exists, lifeState, welfare, weightKg, isActive) = getMilkQualityCowProperties(_cowIds[i]);

            if (!exists) {
                continue;
            }

            if (lifeState != Cows.LifeState.Alive) {
                continue;
            }

            if (!isActive) {
                continue;
            }

            (exists, airQuality) = getMeatAndMilkQualityStableProperties(farms.getCowStableId(_cowIds[i]));

            if (!exists) {
                continue;
            }

            totalQuality += weightKg * (airQuality + 3 * welfare) / 4;
            totalWeight += weightKg;
        }

        if (totalWeight <= 0) {
            return 100;
        }
        
        return totalQuality / totalWeight;
    }

    function getMeatQualityCowProperties(uint _cowId) private view returns (bool, Cows.LifeState, uint, uint) {
        uint cowId;
        bool exists;
        Cows.LifeState lifeState;
        uint welfare;
        uint weightKg;
        uint heartRate;
        bool isActive;

        Cows cows = Cows(cowsAddress);
        (cowId, exists, lifeState, welfare, weightKg, heartRate, isActive) = cows.getCowById(_cowId);
        return (exists, lifeState, welfare, weightKg);
    }

    function getMilkQualityCowProperties(uint _cowId) private view returns (bool, Cows.LifeState, uint, uint, bool) {
        uint cowId;
        bool exists;
        Cows.LifeState lifeState;
        uint welfare;
        uint weightKg;
        uint heartRate;
        bool isActive;

        Cows cows = Cows(cowsAddress);
        (cowId, exists, lifeState, welfare, weightKg, heartRate, isActive) = cows.getCowById(_cowId);
        return (exists, lifeState, welfare, weightKg, isActive);
    }

    function getMeatAndMilkQualityStableProperties(uint _stableId) private view returns (bool, uint) {
        uint stableId;
        bool exists;
        uint airQuality;
        uint sizeOfBarn;
        uint sizeOfField;

        Stables stables = Stables(stablesAddress);
        (stableId, exists, airQuality, sizeOfBarn, sizeOfField) = stables.getStableById(_stableId);
        return (exists, airQuality);
    }
}