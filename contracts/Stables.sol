pragma solidity ^0.4.24;

contract Stables {
    struct Stable {
        bool exists;
        address ownerAddress;
        uint airQuality;
        uint sizeOfBarn;
        uint sizeOfField;
    }

    uint[] private stablesList;
    mapping(uint => Stable) stablesMap;

    modifier isOwner(uint _stableId) {
        require(msg.sender == stablesMap[_stableId].ownerAddress, "The caller does not own this stable.");
        _;
    }

    modifier stableExists(uint _stableId) {
        require(stablesMap[_stableId].exists, "The stable does not exist.");
        _;
    }

    modifier stableDoesNotExist(uint _stableId) {
        require(!stablesMap[_stableId].exists, "The stable already exists.");
        _;
    }

    modifier isValidAirQuality(uint _airQuality) {
        require(_airQuality <= 100, "The air quality is a number between 0 and 100.");
        _;
    }

    modifier isValidSizeOfBarn(uint _sizeOfBarn) {
        require(_sizeOfBarn <= 1000, "The size of barn is a number between 0 and 100.");
        _;
    }

    modifier isValidSizeOfField(uint _sizeOfField) {
        require(_sizeOfField <= 10000, "The size of field is a number between 0 and 100.");
        _;
    }

    modifier stableIndexInBounds(uint _i) {
        require(_i < stablesList.length, "The stable index is out of bounds.");
        _;
    }

    event BuiltStable(
        address indexed owner,
        uint indexed stableId,
        uint airQuality,
        uint sizeOfBarn,
        uint sizeOfField,
        string dataHash
    );

    function build(uint _stableId, uint _airQuality, uint _sizeOfBarn, uint _sizeOfField, string _dataHash) public
        stableDoesNotExist(_stableId) isValidAirQuality(_airQuality) isValidSizeOfBarn(_sizeOfBarn) isValidSizeOfField(_sizeOfField) {

        Stable memory stable = Stable({
            exists: true,
            ownerAddress: msg.sender,
            airQuality: _airQuality,
            sizeOfBarn: _sizeOfBarn,
            sizeOfField: _sizeOfField
        });

        stablesList.push(_stableId);
        stablesMap[_stableId] = stable;

        emit BuiltStable({
            owner: msg.sender,
            stableId: _stableId,
            airQuality: _airQuality,
            sizeOfBarn: _sizeOfBarn,
            sizeOfField: _sizeOfField,
            dataHash: _dataHash
        });
    }

    event DemolishedStable(
        address indexed owner,
        uint indexed stableId,
        string dataHash
    );

    function demolish(uint _stableId, string _dataHash) public
        isOwner(_stableId) stableExists(_stableId) {

        delete stablesMap[_stableId];

        for (uint i = 0; i < stablesList.length; ++i) {
            if (stablesList[i] == _stableId) {
                stablesList[i] = stablesList[stablesList.length - 1];
                delete stablesList[stablesList.length - 1];
                stablesList.length--;
                break;
            }
        }

        emit DemolishedStable({
            owner: msg.sender,
            stableId: _stableId,
            dataHash: _dataHash
        });
    }

    event UpdatedAirQuality(
        uint indexed stableId,
        address indexed updater,
        uint airQuality,
        string dataHash
    );

    function updateAirQuality(uint _stableId, uint _airQuality, string _dataHash) public
        stableExists(_stableId) isValidAirQuality(_airQuality) {

        stablesMap[_stableId].airQuality = _airQuality;

        emit UpdatedAirQuality({
            stableId: _stableId,
            updater: msg.sender,
            airQuality: _airQuality,
            dataHash: _dataHash
        });
    }

    event UpdatedSizeOfBarn(
        uint indexed stableId,
        address indexed updater,
        uint sizeOfBarn,
        string dataHash
    );

    function updateSizeOfBarn(uint _stableId, uint _sizeOfBarn, string _dataHash) public
        stableExists(_stableId) isValidSizeOfBarn(_sizeOfBarn) {
        
        stablesMap[_stableId].sizeOfBarn = _sizeOfBarn;

        emit UpdatedSizeOfBarn({
            stableId: _stableId,
            updater: msg.sender,
            sizeOfBarn: _sizeOfBarn,
            dataHash: _dataHash
        });
    }

    event UpdatedSizeOfField(
        uint indexed stableId,
        address indexed updater,
        uint sizeOfField,
        string dataHash
    );

    function updateSizeOfField(uint _stableId, uint _sizeOfField, string _dataHash) public
        stableExists(_stableId) isValidSizeOfField(_sizeOfField) {

        stablesMap[_stableId].sizeOfField = _sizeOfField;

        emit UpdatedSizeOfField({
            stableId: _stableId,
            updater: msg.sender,
            sizeOfField: _sizeOfField,
            dataHash: _dataHash
        });
    }

    event GenericStableEvent(
        uint indexed stableId,
        address indexed sender,
        bytes32 indexed typeHash,
        string dataHash
    );

    function emitGenericStableEvent(uint _stableId, string _type, string _dataHash) public
        stableExists(_stableId) {

        emit GenericStableEvent({
            stableId: _stableId,
            sender: msg.sender,
            typeHash: keccak256(_type),
            dataHash: _dataHash
        });
    }

    function getStableIds() public view returns (uint[]) {
        uint length = stablesList.length;
        uint[] memory stablesCopy = new uint[](length);

        for (uint i = 0; i < length; ++i) {
            stablesCopy[i] = stablesList[i];
        }

        return stablesCopy;
    }

    function getStableById(uint _stableId) public view
        returns (uint stableId, bool exists, uint airQuality, uint sizeOfBarn, uint sizeOfField) {
        
        Stable memory stable = stablesMap[_stableId];
        return (_stableId, stable.exists, stable.airQuality, stable.sizeOfBarn, stable.sizeOfField);
    }
}