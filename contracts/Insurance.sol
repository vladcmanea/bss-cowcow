pragma solidity ^0.4.24;

import './Regulator.sol';
import './Farms.sol';
import './Veterinarian.sol';
import './Cows.sol';

contract Insurance {
    address private regulatorAddress;
    address private veterinarianAddress;
    address private farmsAddress;

    function setDependencies(address _regulatorAddress, address _veterinarianAddress, address _farmsAddress) public {
        regulatorAddress = _regulatorAddress;
        veterinarianAddress = _veterinarianAddress;
        farmsAddress = _farmsAddress;
    }

    function getFarmPremium(uint _farmId) public view returns (uint) {
        Farms farms = Farms(farmsAddress);
        Regulator regulator = Regulator(regulatorAddress);
        Veterinarian veterinarian = Veterinarian(veterinarianAddress);

        uint farmQuality = regulator.getFarmQuality(_farmId);
        uint cowsHealth = 0;

        uint[] memory cowIds = farms.getCowIdsInFarm(_farmId);

        for (uint i = 0; i < cowIds.length; ++i) {
            uint cowHealth = veterinarian.getCowHealth(cowIds[i]);
            cowsHealth += cowHealth;
        }

        return (farmQuality + (cowIds.length <= 0 ? 100 : (cowsHealth / cowIds.length))) / 2;
    }
}
