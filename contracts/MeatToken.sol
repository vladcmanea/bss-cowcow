pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import './Regulator.sol';

contract MeatToken is ERC721Token {
    string public constant name = "Meat Token";
    string public constant symbol = "MT";
    
    struct Meat {
        address owner;
        uint quantityKg;
        uint quality;
        uint[] cowIds;
    }
    
    Meat[] private meatsList;
    address private regulatorAddress;
    address private cowsAddress;

    modifier isOwner(uint _meatId) {
        require(ownerOf(_meatId) == msg.sender, "The token has another owner contract.");
        _;
    }

    modifier isOwnerAccount(uint _meatId, address _ownerAccount) {
        require(meatsList[_meatId].owner == _ownerAccount, "The owner is another one.");
        _;
    }

    modifier meatIdIsInBounds(uint _i) {
        require(_i < meatsList.length, "Index is out of bounds.");
        _;
    }

    modifier isValidAddress(address _address) {
        require(_address != address(0), "The address does not exist.");
        _;
    }

    constructor () public
        ERC721Token(name, symbol) {

        // Do nothing.
    }

    function setDependencies(address _regulatorAddress, address _cowsAddress) public {
        regulatorAddress = _regulatorAddress;
        cowsAddress = _cowsAddress;
    }

    function getMeatIds() public view returns (uint[]) {
        uint length = meatsList.length;

        uint[] memory meatIdsCopy = new uint[](length);
        
        for (uint i = 0; i < length; ++i) {
            meatIdsCopy[i] = i;
        }

        return meatIdsCopy;
    }

    function getMeatById(uint _meatId) public view
        meatIdIsInBounds(_meatId) returns (uint, address, uint, uint, uint[]) {
        
        Meat memory meat = meatsList[_meatId];
        uint length = meat.cowIds.length;
        uint[] memory cowIdsCopy = new uint[](length);
        
        for (uint i = 0; i < length; ++i) {
            cowIdsCopy[i] = meat.cowIds[i];
        }

        return (_meatId, meat.owner, meat.quantityKg, meat.quality, cowIdsCopy);
    }

    function mint(uint[] _cowIds, uint _pieces, address _owner) public {
        require(_cowIds.length > 0, "There are no cows.");
        require(_pieces > 0, "There are no pieces.");
        require(_owner != address(0), "The owner does not exist.");

        uint quality = Regulator(regulatorAddress).getMeatQualityAtSlaughter(_cowIds);
        uint quantityKg = getTotalSlaughterWeight(_cowIds);

        for (uint i = 0; i < _pieces; ++i) {
            Meat memory meat = Meat({
                owner: _owner,
                quantityKg: quantityKg / _pieces,
                quality: quality,
                cowIds: _cowIds
            });

            uint tokenId = meatsList.push(meat) - 1;
            super._mint(msg.sender, tokenId);
        }
    }

    function updateOwner(uint _meatId, address _oldOwnerAccount, address _newOwnerAccount) public
        meatIdIsInBounds(_meatId) isOwner(_meatId) isValidAddress(_newOwnerAccount) isValidAddress(_oldOwnerAccount) isOwnerAccount(_meatId, _oldOwnerAccount) {

        meatsList[_meatId].owner = _newOwnerAccount;
    }

    function getTotalSlaughterWeight(uint[] _cowIds) private view returns (uint) {
        uint quantityKg = 0;

        uint cowId;
        bool exists;
        Cows.LifeState lifeState;
        uint welfare;
        uint weightKg;
        uint heartRate;
        bool isActive;

        for (uint i = 0; i < _cowIds.length; ++i) {
            (cowId, exists, lifeState, welfare, weightKg, heartRate, isActive) = Cows(cowsAddress).getCowById(_cowIds[i]);

            if (!exists) {
                continue;
            }

            if (lifeState != Cows.LifeState.Slaughtered) {
                continue;
            }

            // Not all content of the cow is slaughtered!
            quantityKg += 4 * weightKg / 5;
        }

        return quantityKg;
    }
}