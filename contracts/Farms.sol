pragma solidity ^0.4.24;

import './Cows.sol';
import './Stables.sol';
import './MilkToken.sol';
import './MeatToken.sol';

contract Farms {
    address private cowsAddress;
    address private stablesAddress;
    address private meatTokenAddress;
    address private milkTokenAddress;

    struct Farm {
        bool exists;
        address ownerAddress;
        uint[] stables;
        uint[] cows;
    }

    uint[] private farmsList;
    mapping(uint => Farm) private farmsMap;

    mapping(uint => uint) private cowsToFarms;
    mapping(uint => uint) private cowsToStables;
    mapping(uint => uint) private stablesToFarms;

    modifier isOwner(uint _farmId) {
        require(msg.sender == farmsMap[_farmId].ownerAddress, "The caller does not own this farm.");
        _;
    }

    modifier farmExists(uint _farmId) {
        require(farmsMap[_farmId].exists, "The farm does not exist.");
        _;
    }

    modifier farmDoesNotExist(uint _farmId) {
        require(!farmsMap[_farmId].exists, "The farm already exists.");
        _;
    }

    modifier stableExists(uint _stableId) {
        require(stablesToFarms[_stableId] != 0, "The stable does not exist.");
        _;
    }

    modifier stableDoesNotExist(uint _stableId) {
        require(stablesToFarms[_stableId] == 0, "The stable exists.");
        _;
    }

    modifier cowExists(uint _cowId) {
        require(cowsToFarms[_cowId] != 0, "The cow does not exist.");
        _;
    }

    modifier cowDoesNotExist(uint _cowId) {
        require(cowsToFarms[_cowId] == 0, "The cow exists.");
        _;
    }

    modifier isValidAddress(address _address) {
        require(_address != address(0), "The address does not exist.");
        _;
    }

    modifier areValidPieces(uint _pieces) {
        require(_pieces > 0, "The pieces are zero.");
        _;
    }

    modifier isNotOwner(uint _farmId, address _notOwner) {
        require(_notOwner != farmsMap[_farmId].ownerAddress, "The not owner owns the farm.");
        _;
    }

    modifier stableDoesNotHaveUsefulCows(uint _stableId) {
        uint[] memory usefulCowsInStable = getUsefulCowIdsInStable(_stableId);
        require(usefulCowsInStable.length == 0, "There are useful cows in the stable.");
        _;
    }

    modifier farmDoesNotHaveStables(uint _farmId) {
        uint[] memory stablesInFarm = getStableIdsInFarm(_farmId);
        require(stablesInFarm.length == 0, "There are stables in the farm.");
        _;
    }

    modifier cowIsNotInStable(uint _cowId, uint _stableId) {
        require(cowsToStables[_cowId] != _stableId, "The cow is in the stable.");
        _;
    }

    modifier farmIndexIsInBounds(uint _i) {
        require(_i < farmsList.length, "Index is out of bounds.");
        _;
    }

    modifier stableIndexIsInBounds(uint _farmId, uint _i) {
        require(_i < farmsMap[_farmId].stables.length, "Index is out of bounds.");
        _;
    }

    modifier cowIndexIsInBounds(uint _farmId, uint _i) {
        require(_i < farmsMap[_farmId].cows.length, "Index is out of bounds.");
        _;
    }

    function setDependencies(address _stablesAddress, address _cowsAddress, address _milkTokenAddress, address _meatTokenAddress) public {
        cowsAddress = _cowsAddress;
        stablesAddress = _stablesAddress;
        meatTokenAddress = _meatTokenAddress;
        milkTokenAddress = _milkTokenAddress;
    }

    // Farm logic.

    event BuiltFarm(
        address indexed owner,
        uint indexed farmId,
        string dataHash
    );

    function buildFarm(uint _farmId, string _dataHash) public
        farmDoesNotExist(_farmId) {

        // TODO: Pay a fixed fee to this contract (like owning the land).
        // TODO: So msg.sender pays to the contract a few ETH.

        // TODO: Pay a fixed fee to the regulator (like getting an approval).
        // TODO: So msg.sender pays to the contract a few ETH.

        // TODO: Pay a fee to the insurer contract (for insuring the farm).
        // TODO: So msg.sender pays to the contract a few ETH.

        Farm memory farm = Farm({
            exists: true,
            ownerAddress: msg.sender,
            cows: new uint[](0),
            stables: new uint[](0)
        });

        farmsList.push(_farmId);
        farmsMap[_farmId] = farm;

        emit BuiltFarm({
            owner: msg.sender,
            farmId: _farmId,
            dataHash: _dataHash
        });
    }

    event DemolishedFarm(
        address indexed owner,
        uint indexed farmId,
        string dataHash
    );

    function demolishFarm(uint _farmId, string _dataHash) public
        farmExists(_farmId) isOwner(_farmId) farmDoesNotHaveStables(_farmId) {

        delete farmsMap[_farmId];

        for (uint i = 0; i < farmsList.length; ++i) {
            if (farmsList[i] == _farmId) {
                farmsList[i] = farmsList[farmsList.length - 1];
                delete farmsList[farmsList.length - 1];
                farmsList.length--;
                break;
            }
        }

        emit DemolishedFarm({
            owner: msg.sender,
            farmId: _farmId,
            dataHash: _dataHash
        });
    }

    event SoldFarm(
        uint indexed farmId,
        address indexed oldOwner,
        address indexed newOwner,
        string dataHash
    );

    function sellFarm(uint _farmId, address _buyerAddress, string _dataHash) public
        farmExists(_farmId) isValidAddress(_buyerAddress) isOwner(_farmId) isNotOwner(_farmId, _buyerAddress) {

        // The buyer needs to pay:

        // TODO: Get a pricing for the farm:
        // TODO: - pricing of cows.
        // TODO: - pricing of stables.
        // TODO: - pricing of milks.
        // TODO: - pricing of meats.
        // TODO: Make an ETH transaction based on this price.

        // TODO: Pay a fixed fee to this contract (like owning the land).
        // TODO: So msg.sender pays to the contract a few ETH.

        // TODO: Pay a fixed fee to the regulator (like getting an approval).
        // TODO: So msg.sender pays to the contract a few ETH.

        // TODO: Pay a fee to the insurer contract (for insuring the farm).
        // TODO: So msg.sender pays to the contract a few ETH.

        farmsMap[_farmId].ownerAddress = _buyerAddress;

        emit SoldFarm({
            farmId: _farmId,
            oldOwner: msg.sender,
            newOwner: _buyerAddress,
            dataHash: _dataHash
        });
    }

    // Stables logic.

    event BuiltStable(
        address indexed owner,
        uint indexed farmId,
        uint indexed stableId,
        string dataHash
    );

    function buildStable(uint _stableId, uint _farmId, uint _airQuality, uint _sizeOfBarn, uint _sizeOfField, string _dataHash) public
        farmExists(_farmId) isOwner(_farmId) stableDoesNotExist(_stableId) {
        
        // TODO: Pay a fixed fee to the regulator (like getting an approval).
        // TODO: So msg.sender pays to the contract a few ETH.

        // TODO: Pay a fee to the insurer contract (for insuring the stable) that depends on properties of the stable.
        // TODO: So msg.sender pays to the contract a few ETH.

        stablesToFarms[_stableId] = _farmId;
        farmsMap[_farmId].stables.push(_stableId);

        Stables(stablesAddress).build(_stableId, _airQuality, _sizeOfBarn, _sizeOfField, _dataHash);

        emit BuiltStable({
            owner: msg.sender,
            farmId: _farmId,
            stableId: _stableId,
            dataHash: _dataHash
        });
    }

    event DemolishedStable(
        address indexed owner,
        uint indexed farmId,
        uint indexed stableId,
        string dataHash
    );

    function demolishStable(uint _stableId, string _dataHash) public
        farmExists(getStableFarmId(_stableId)) isOwner(getStableFarmId(_stableId)) stableExists(_stableId) stableDoesNotHaveUsefulCows(_stableId) {

        uint farmId = getStableFarmId(_stableId);

        delete stablesToFarms[_stableId];

        Farm memory farm = farmsMap[farmId];

        for (uint i = 0; i < farm.stables.length; ++i) {
            if (farm.stables[i] == _stableId) {
                farm.stables[i] = farm.stables[farm.stables.length - 1];
                delete farm.stables[farm.stables.length - 1];
                farmsMap[farmId].stables.length--;
                break;
            }
        }

        Stables(stablesAddress).demolish(_stableId, _dataHash);

        emit DemolishedStable({
            owner: msg.sender,
            farmId: farmId,
            stableId: _stableId,
            dataHash: _dataHash
        });
    }

    event FedStable(
        uint indexed farmId,
        uint indexed stableId,
        uint amount,
        string dataHash
    );

    function feedStable(uint _stableId, uint _quantityKg, string _dataHash) public
        stableExists(_stableId) isOwner(getStableFarmId(_stableId)) {        

        uint[] memory cowIds = getCowIdsInStable(_stableId);
            
        for (uint i = 0; i < cowIds.length; ++i) {
            updateCowWelfare(cowIds[i], _quantityKg, _dataHash);
        }

        emit FedStable({
            farmId: getStableFarmId(_stableId),
            stableId: _stableId,
            amount: _quantityKg,
            dataHash: _dataHash
        });
    }

    function updateCowWelfare(uint _cowId, uint _quantityKg, string _dataHash) private {
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
            return;
        }

        // For example, the welfare of the cow improves with food.
        welfare = welfare + _quantityKg / 10;

        if (welfare > 100) {
            welfare = 100;
        }

        cows.updateWelfare(_cowId, welfare, _dataHash);
    }

    event MilkedStable(
        uint indexed farmId,
        uint indexed stableId,
        uint amount,
        string dataHash
    );

    function milkStable(uint _stableId, uint _quantityKg, string _dataHash) public
        stableExists(_stableId) isOwner(getStableFarmId(_stableId)) {
        Cows cows = Cows(cowsAddress);

        uint[] memory cowIds = getCowIdsInStable(_stableId);
        uint length = 0;
        uint welfare;
        uint i;

        for (i = 0; i < cowIds.length; ++i) {
            welfare = getCowWelfare(cowIds[i]);

            if (welfare >= _quantityKg / 10) {
                length++;
            }
        }

        uint index = 0;
        uint[] memory eligibleCowIds = new uint[](length);
        uint delta = _quantityKg / 10;

        for (i = 0; i < cowIds.length; ++i) {
            welfare = getCowWelfare(cowIds[i]);

            if (welfare >= delta) {
                eligibleCowIds[index] = cowIds[i];
                cows.updateWelfare(cowIds[i], welfare - delta, _dataHash);
                index++;
            }
        }

        if (eligibleCowIds.length <= 0) {
            return;
        }

        MilkToken(milkTokenAddress).mint(_quantityKg, eligibleCowIds, msg.sender);

        emit MilkedStable({
            farmId: getStableFarmId(_stableId),
            stableId: _stableId,
            amount: _quantityKg,
            dataHash: _dataHash
        });
    }

    function getCowWelfare(uint _cowId) private
        cowExists(_cowId) view returns (uint)  {
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
            return 0;
        }

        return welfare;
    }

    // Cows logic.

    event BornCow(
        address indexed owner,
        uint indexed cowId,
        uint indexed farmId,
        uint stableId,
        string dataHash
    );

    function birthCow(uint _cowId, uint _stableId, uint _wellbeing, uint _weight, uint _heartRate, string _dataHash) public
        cowDoesNotExist(_cowId) stableExists(_stableId) farmExists(getStableFarmId(_stableId)) isOwner(getStableFarmId(_stableId)) {

        // TODO: Pay a fee to this contract (for eating the grass on the land) that depends on the size of the stable.
        // TODO: So msg.sender pays to the contract a few ETH.

        // TODO: Pay a fixed fee to the regulator (like for getting a microchip for the cow :P).
        // TODO: So msg.sender pays to the contract a few ETH.

        // TODO: Pay a fixed fee to the vet contract (for taking care of the cow).
        // TODO: So msg.sender pays to the contract a few ETH.

        // TODO: Pay a fee to the insurer contract (for insuring the cow) that depends on the policy at the birth time.
        // TODO: So msg.sender pays to the contract a few ETH.

        uint farmId = getStableFarmId(_stableId);
        cowsToFarms[_cowId] = farmId;
        cowsToStables[_cowId] = _stableId;
        farmsMap[farmId].cows.push(_cowId);

        birthCowInFarm(_cowId, farmId, _stableId, _wellbeing, _weight, _heartRate, _dataHash);
    }

    // This method was added to reduce the complexity of the cow birth.
    // As it is private (!), assume all preconditions are verified in its callers!
    function birthCowInFarm(uint _cowId, uint _farmId, uint _stableId, uint _wellbeing, uint _weight, uint _heartRate, string _dataHash) private {
        Cows(cowsAddress).birth(_cowId, _wellbeing, _weight, _heartRate, _dataHash);
        
        emit BornCow({
            owner: msg.sender,
            cowId: _cowId,
            farmId: _farmId,
            stableId: _stableId,
            dataHash: _dataHash
        });
    }

    event KilledCow(
        address indexed killer,
        uint indexed cowId,
        uint indexed farmId,
        uint stableId,
        string dataHash
    );

    function killCow(uint _cowId, string _dataHash) public
        cowExists(_cowId) isOwner(getCowFarmId(_cowId)) {

        Cows(cowsAddress).kill(_cowId, _dataHash);

        emit KilledCow({
            killer: msg.sender,
            cowId: _cowId,
            farmId: getCowFarmId(_cowId),
            stableId: getCowStableId(_cowId),
            dataHash: _dataHash
        });
    }

    event SlaughteredCow(
        address indexed slaughterer,
        uint indexed cowId,
        uint indexed farmId,
        uint stableId,
        uint pieces,
        string dataHash
    );

    function slaughterCow(uint _cowId, uint _pieces, string _dataHash) public
        cowExists(_cowId) isOwner(getCowFarmId(_cowId)) areValidPieces(_pieces) {

        Cows cows = Cows(cowsAddress);

        cows.slaughter(_cowId, _dataHash);

        uint[] memory cowIds = new uint[](1);
        cowIds[0] = _cowId;

        MeatToken(meatTokenAddress).mint(cowIds, _pieces, msg.sender);

        emit SlaughteredCow({
            slaughterer: msg.sender,
            cowId: _cowId,
            farmId: getCowFarmId(_cowId),
            stableId: getCowStableId(_cowId),
            pieces: _pieces,
            dataHash: _dataHash
        });
    }

    event SoldCow(
        address indexed oldOwner,
        address indexed newOwner,
        uint indexed cowId,
        uint oldFarmId,
        uint newFarmId,
        uint newStableId,
        string dataHash
    );

    function sellCow(uint _cowId, uint _stableId, string _dataHash) public
        cowExists(_cowId) stableExists(_stableId) cowIsNotInStable(_cowId, _stableId) {

        uint oldFarmId = getCowFarmId(_cowId);
        uint newFarmId = getStableFarmId(_stableId);

        require(farmsMap[oldFarmId].ownerAddress == msg.sender, "The sender is not the owner of the from farm.");
        require(farmsMap[newFarmId].ownerAddress != msg.sender, "The sender is the owner of the to farm.");

        require(Cows(cowsAddress).getCowLifeStateById(_cowId) == Cows.LifeState.Alive, "The cow is not alive");

        // TODO: A price for the cow is decided.
        // The the owner of the stable pays for this price.

        // TODO: Pay a fixed fee to the regulator (like for getting a new microchip for the cow :P).
        // TODO: So the owner of the stable pays to the contract a few ETH.

        // TODO: Pay a fixed fee to the vet contract (for taking care of the cow).
        // TODO: So the owner of the stable pays to the contract a few ETH.

        // TODO: Pay a fee to the insurer contract (for insuring the cow) that depends on the policy at the sell time.
        // TODO: So the owner of the stable pays to the contract a few ETH.

        // Move the cow between stables.
        cowsToStables[_cowId] = _stableId;
        
        // Remove the cow from farmsMap[oldFarmId].cows.
        for (uint i = 0; i < farmsMap[oldFarmId].cows.length; ++i) {
            if (farmsMap[oldFarmId].cows[i] == _cowId) {
                farmsMap[oldFarmId].cows[i] = farmsMap[oldFarmId].cows[farmsMap[oldFarmId].cows.length - 1];
                delete farmsMap[oldFarmId].cows[farmsMap[oldFarmId].cows.length - 1];
                farmsMap[oldFarmId].cows.length--;
                break;
            }
        }

        // Add the cow farmsMap[newFarmId].cows.
        farmsMap[newFarmId].cows.push(_cowId);

        // Add the cow to the new farm.
        cowsToFarms[_cowId] = newFarmId;
        
        emit SoldCow({
            oldOwner: farmsMap[oldFarmId].ownerAddress,
            newOwner: farmsMap[newFarmId].ownerAddress,
            cowId: _cowId,
            oldFarmId: oldFarmId,
            newFarmId: newFarmId,
            newStableId: _stableId,
            dataHash: _dataHash
        });
    }

    event GenericFarmEvent(
        uint indexed farmId,
        address indexed sender,
        bytes32 indexed typeHash,
        string dataHash
    );

    function emitGenericFarmEvent(uint _farmId, string _type, string _dataHash) public
        farmExists(_farmId) {

        emit GenericFarmEvent({
            farmId: _farmId,
            sender: msg.sender,
            typeHash: keccak256(_type),
            dataHash: _dataHash
        });
    }

    function getFarmIds() public view returns (uint[]) {
        uint length = farmsList.length;
        uint[] memory farmsCopy = new uint[](length);

        for (uint i = 0; i < length; ++i) {
            farmsCopy[i] = farmsList[i];
        }

        return farmsCopy;
    }

    function getFarmById(uint _farmId) public view
        returns (uint farmId, bool exists, address ownerAddress) {

        Farm memory farm = farmsMap[_farmId]; 
        return (_farmId, farm.exists, farm.ownerAddress);
    }

    function getStableIdsInFarm(uint _farmId) public view
        returns (uint[]) {
        
        uint length = farmsMap[_farmId].stables.length;
        uint[] memory stablesCopy = new uint[](length);

        for (uint i = 0; i < length; ++i) {
            stablesCopy[i] = farmsMap[_farmId].stables[i];
        }

        return stablesCopy;
    }

    function getCowIdsInFarm(uint _farmId) public view
        returns (uint[]) {

        uint length = farmsMap[_farmId].cows.length;
        uint[] memory cowsCopy = new uint[](length);

        for (uint i = 0; i < length; ++i) {
            cowsCopy[i] = farmsMap[_farmId].cows[i];
        }

        return cowsCopy;
    }

    function getCowIdsInStable(uint _stableId) public view
        returns (uint[]) {
            
        uint farmId = stablesToFarms[_stableId];

        if (farmId == 0) {
            return new uint[](0);
        }

        uint[] memory cowIdsInFarm = getCowIdsInFarm(farmId);
        uint length = 0;
        uint i;
        uint cowId;

        for (i = 0; i < cowIdsInFarm.length; ++i) {
            cowId = cowIdsInFarm[i];

            if (cowsToStables[cowId] == _stableId) {
                ++length;
            }
        }

        uint[] memory cowIdsInStable = new uint[](length);
        uint j = 0;

        for (i = 0; i < cowIdsInFarm.length; ++i) {
            cowId = cowIdsInFarm[i];

            if (cowsToStables[cowId] == _stableId) {
                cowIdsInStable[j] = cowId;
                ++j;
            }
        }

        return cowIdsInStable;
    }

    function getUsefulCowIdsInStable(uint _stableId) public view
        returns (uint[]) {

        uint[] memory cowIdsInStable = getCowIdsInStable(_stableId);

        uint length = 0;
        uint i;

        for (i = 0; i < cowIdsInStable.length; ++i) {
            if (Cows(cowsAddress).getCowLifeStateById(cowIdsInStable[i]) == Cows.LifeState.Alive || Cows(cowsAddress).getCowLifeStateById(cowIdsInStable[i]) == Cows.LifeState.Dead) {
                ++length;
            }
        }

        uint[] memory usefulCowIdsInStable = new uint[](length);
        uint j = 0;

        for (i = 0; i < cowIdsInStable.length; ++i) {
            if (Cows(cowsAddress).getCowLifeStateById(cowIdsInStable[i]) == Cows.LifeState.Alive || Cows(cowsAddress).getCowLifeStateById(cowIdsInStable[i]) == Cows.LifeState.Dead) {
                usefulCowIdsInStable[j] = cowIdsInStable[i];
                ++j;
            }
        }

        return usefulCowIdsInStable;
    }

    function getCowFarmId(uint _cowId) public view
        returns (uint) {

        return cowsToFarms[_cowId];
    }

    function getCowStableId(uint _cowId) public view
        returns (uint) {

        return cowsToStables[_cowId];
    }

    function getStableFarmId(uint _stableId) public view
        returns (uint) {
        
        return stablesToFarms[_stableId];
    }

    function sellMilk(uint _tokenId, address _contractAddress, address _accountAddress) public {
        MilkToken milkToken = MilkToken(milkTokenAddress);
        milkToken.updateOwner(_tokenId, msg.sender, _accountAddress);
        milkToken.transferFrom(this, _contractAddress, _tokenId);
    }

    function sellMeat(uint _tokenId, address _contractAddress, address _accountAddress) public {
        MeatToken meatToken = MeatToken(meatTokenAddress);
        meatToken.updateOwner(_tokenId, msg.sender, _accountAddress);
        meatToken.transferFrom(this, _contractAddress, _tokenId);
    }
}
