pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import './Regulator.sol';

contract MilkToken is ERC721Token {
    string public constant name = "Milk Token";
    string public constant symbol = "MK";
    
    struct Milk {
        address owner;
        uint quantityKg;
        uint quality;
        uint[] cowIds;
    }
    
    Milk[] private milksList;
    address private regulatorAddress;

    modifier isOwner(uint _milkId) {
        require(ownerOf(_milkId) == msg.sender, "The token has another owner contract.");
        _;
    }

    modifier isOwnerAccount(uint _milkId, address _ownerAccount) {
        require(milksList[_milkId].owner == _ownerAccount, "The owner is another one.");
        _;
    }

    modifier milkIdIsInBounds(uint _i) {
        require(_i < milksList.length, "Index is out of bounds.");
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

    function setDependencies(address _regulatorAddress) public {
        regulatorAddress = _regulatorAddress;
    }

    function getMilkIds() public view returns (uint[]) {
        uint length = milksList.length;
        uint[] memory milkIdsCopy = new uint[](length);
        
        for (uint i = 0; i < length; ++i) {
            milkIdsCopy[i] = i;
        }

        return milkIdsCopy;
    }

    function getMilkById(uint _milkId) public view
        milkIdIsInBounds(_milkId) returns (uint, address, uint, uint, uint[]) {
            
        Milk memory milk = milksList[_milkId];
        uint length = milk.cowIds.length;
        uint[] memory cowIdsCopy = new uint[](length);
        
        for (uint i = 0; i < length; ++i) {
            cowIdsCopy[i] = milk.cowIds[_milkId];
        }

        return (_milkId, milk.owner, milk.quantityKg, milk.quality, cowIdsCopy);
    }

    function mint(uint _quantityKg, uint[] _cowIds, address _owner) public {
        require(_quantityKg > 0, "The quantity is zero.");
        require(_cowIds.length > 0, "There are no cows.");
        require(_owner != address(0), "The owner does not exist.");        
        
        uint quality = Regulator(regulatorAddress).getMilkQualityAtCollection(_cowIds);

        Milk memory milk = Milk({
            owner: _owner,
            quantityKg: _quantityKg,
            quality: quality,
            cowIds: _cowIds
        });

        uint tokenId = milksList.push(milk) - 1;
        super._mint(msg.sender, tokenId);
    }

    function updateOwner(uint _milkId, address _oldOwnerAccount, address _newOwnerAccount) public
        milkIdIsInBounds(_milkId) isOwner(_milkId) isValidAddress(_newOwnerAccount) isValidAddress(_oldOwnerAccount) isOwnerAccount(_milkId, _oldOwnerAccount) {
            
        milksList[_milkId].owner = _newOwnerAccount;
    }
}
