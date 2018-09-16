pragma solidity ^0.4.24;

contract Cows {
    enum LifeState {
        None,
        Alive,
        Dead,
        Slaughtered
    }

    struct Cow {
        bool exists;
        address ownerAddress;
        LifeState lifeState;
        uint welfare;
        uint weightKg;
        uint heartRate;
        bool isActive;
    }

    uint[] private cowsList;
    mapping(uint => Cow) cowsMap;

    modifier isOwner(uint _cowId) {
        require(msg.sender == cowsMap[_cowId].ownerAddress, "The caller does not own this cow.");
        _;
    }

    modifier isNotOwner(uint _cowId, address _notOwner) {
        require(_notOwner != cowsMap[_cowId].ownerAddress, "The not owner owns the cow.");
        _;
    }

    modifier cowExists(uint _cowId) {
        require(cowsMap[_cowId].exists, "The cow does not exist.");
        _;
    }

    modifier cowDoesNotExist(uint _cowId) {
        require(!cowsMap[_cowId].exists, "The cow already exists.");
        _;
    }

    modifier cowIsAlive(uint _cowId) {
        require(cowsMap[_cowId].lifeState == LifeState.Alive, "The cow is not alive.");
        _;
    }

    modifier cowIsDead(uint _cowId) {
        require(cowsMap[_cowId].lifeState == LifeState.Dead, "The cow is not just dead.");
        _;
    }

    modifier cowIsSlaughtered(uint _cowId) {
        require(cowsMap[_cowId].lifeState == LifeState.Slaughtered, "The cow is not slaughtered.");
        _;
    }

    modifier isValidWelfare(uint _welfare) {
        require(_welfare <= 100, "The welfare (0-100 scale) is a number between 0 and 100.");
        _;
    }

    modifier isValidWeight(uint _weightKg) {
        require(_weightKg <= 2000, "The weight (kg) is a number between 0 and 2000.");
        _;
    }

    modifier isValidHeartRate(uint _heartRate) {
        require(5 <= _heartRate && _heartRate <= 180, "The heart rate (bpm) is a number between 5 and 180.");
        _;
    }

    modifier isValidAddress(address _address) {
        require(_address != address(0), "The address does not exist.");
        _;
    }

    modifier cowIndexIsInBounds(uint _i) {
        require(_i < cowsList.length, "Index is out of bounds.");
        _;
    }

    event BornCow(
        uint indexed cowId,
        address indexed owner,
        uint welfare,
        uint weightKg,
        uint heartRate,
        string dataHash
    );

    function birth(uint _cowId, uint _welfare, uint _weightKg, uint _heartRate, string _dataHash) public
        cowDoesNotExist(_cowId) isValidWelfare(_welfare) isValidWeight(_weightKg) isValidHeartRate(_heartRate) {
        
        Cow memory cow = Cow({
            exists: true,
            ownerAddress: msg.sender,
            lifeState: LifeState.Alive,
            welfare: _welfare,
            weightKg: _weightKg,
            heartRate: _heartRate,
            isActive: false
        });

        cowsList.push(_cowId);
        cowsMap[_cowId] = cow;

        emit BornCow({
            cowId: _cowId,
            owner: msg.sender,
            weightKg: _weightKg,
            welfare: _welfare,
            heartRate: _heartRate,
            dataHash: _dataHash
        });
    }

    event KilledCow(
        uint indexed cowId,
        address indexed owner,
        uint finalWelfare,
        uint finalWeight,
        uint finalHeartRate,
        bool finalWasActive,
        string dataHash
    );

    function kill(uint _cowId, string _dataHash) public
        cowExists(_cowId) cowIsAlive(_cowId) isOwner(_cowId) {
        
        cowsMap[_cowId].lifeState = LifeState.Dead;

        emit KilledCow({
            cowId: _cowId,
            owner: msg.sender,
            finalWelfare: cowsMap[_cowId].welfare,
            finalWeight: cowsMap[_cowId].weightKg,
            finalHeartRate: cowsMap[_cowId].heartRate,
            finalWasActive: cowsMap[_cowId].isActive,
            dataHash: _dataHash
        });
    }

    event SlaughteredCow(
        uint indexed cowId,
        address indexed owner,
        uint finalWelfare,
        uint finalWeight,
        uint finalHeartRate,
        bool finalWasActive,
        string dataHash
    );

    function slaughter(uint _cowId, string _dataHash) public
        cowExists(_cowId) cowIsDead(_cowId) isOwner(_cowId) {
        
        cowsMap[_cowId].lifeState = LifeState.Slaughtered;

        emit SlaughteredCow({
            cowId: _cowId,
            owner: msg.sender,
            finalWelfare: cowsMap[_cowId].welfare,
            finalWeight: cowsMap[_cowId].weightKg,
            finalHeartRate: cowsMap[_cowId].heartRate,
            finalWasActive: cowsMap[_cowId].isActive,
            dataHash: _dataHash
        });
    }

    event UpdatedWelfare(
        uint indexed cowId,
        address indexed updater,
        uint welfare,
        string dataHash
    );

    function updateWelfare(uint _cowId, uint _welfare, string _dataHash) public
        cowExists(_cowId) cowIsAlive(_cowId) isValidWelfare(_welfare) {

        cowsMap[_cowId].welfare = _welfare;

        emit UpdatedWelfare({
            cowId: _cowId,
            updater: msg.sender,
            welfare: _welfare,
            dataHash: _dataHash
        });
    }

    event UpdatedWeight(
        uint indexed cowId,
        address indexed updater,
        uint weightKg,
        string dataHash
    );

    function updateWeight(uint _cowId, uint _weightKg, string _dataHash) public
        cowExists(_cowId) cowIsAlive(_cowId) isValidWeight(_weightKg) {

        cowsMap[_cowId].weightKg = _weightKg;

        emit UpdatedWeight({
            cowId: _cowId,
            updater: msg.sender,
            weightKg: _weightKg,
            dataHash: _dataHash
        });
    }

    event UpdatedHeartRate(
        uint indexed cowId,
        address indexed updater,
        uint heartRate,
        string dataHash
    );

    function updateHeartRate(uint _cowId, uint _heartRate, string _dataHash) public
        cowExists(_cowId) cowIsAlive(_cowId) isValidHeartRate(_heartRate) {

        cowsMap[_cowId].heartRate = _heartRate;

        emit UpdatedHeartRate({
            cowId: _cowId,
            updater: msg.sender,
            heartRate: _heartRate,
            dataHash: _dataHash
        });
    }

    event UpdatedIsActive(
        uint indexed cowId,
        address indexed updater,
        bool isActive,
        string dataHash
    );

    function updateIsActive(uint _cowId, bool _isActive, string _dataHash) public
        cowExists(_cowId) cowIsAlive(_cowId) {
        
        cowsMap[_cowId].isActive = _isActive;

        emit UpdatedIsActive({
            cowId: _cowId,
            updater: msg.sender,
            isActive: _isActive,
            dataHash: _dataHash
        });
    }

    event GenericCowEvent(
        uint indexed cowId,
        address indexed sender,
        bytes32 indexed typeHash,
        string dataHash
    );

    function emitGenericCowEvent(uint _cowId, string _type, string _dataHash) public
        cowExists(_cowId) {

        emit GenericCowEvent({
            cowId: _cowId,
            sender: msg.sender,
            typeHash: keccak256(_type),
            dataHash: _dataHash
        });
    }

    function getCowIds() public view returns (uint[]) {
        uint length = cowsList.length;
        uint[] memory cowsCopy = new uint[](length);

        for (uint i = 0; i < length; ++i) {
            cowsCopy[i] = cowsList[i];
        }

        return cowsCopy;
    }

    function getCowById(uint _cowId) public view
        returns (uint cowId, bool exists, LifeState lifeState, uint welfare, uint weightKg, uint heartRate, bool isActive) {
        
        Cow memory cow = cowsMap[_cowId];
        return (_cowId, cow.exists, cow.lifeState, cow.welfare, cow.weightKg, cow.heartRate, cow.isActive);
    }

    function getCowLifeStateById(uint _cowId) public view
        returns (LifeState) {
    
        Cow memory cow = cowsMap[_cowId];
        return cow.lifeState;
    }
}
