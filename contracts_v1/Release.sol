// SPDX-License-Identifier: SimPL-2.0
pragma solidity ^0.8.12;

contract Release{
    
    string public contractName;
    uint public imageCount = 0;
    mapping(uint => Image) public images;
    mapping(bytes32 => uint8) public released;
    
    struct Image {
        uint id;
        uint timestamp;
        bytes32 sha3;
        bytes signature;
        string ipfsHash;
        address payable author;
        address payable owner;
    }

    event ImageCreated(
        uint id,
        uint timestamp,
        bytes32 sha3,
        bytes signature,
        string ipfsHash,
        address payable author,
        address payable owner
    );

    constructor()  {
      contractName = "release";
    }
    
    function uploadImage(
        string memory _ipfsHash,
        bytes32       _imgSHA3, 
        bytes  memory _imgSign
        ) public {
        //check requires
        require(bytes(_ipfsHash).length > 0);
        require(_imgSHA3.length > 0);
        require(_imgSign.length > 0);
        require(msg.sender != address(0x0));
        require(released[_imgSHA3] == 0, "already exist!");

        uint time = block.timestamp;
        imageCount++;
        images[imageCount] = Image(
            imageCount,
            time,
            _imgSHA3,
            _imgSign,
            _ipfsHash,
            payable(msg.sender),payable(msg.sender));
        released[_imgSHA3] = 1;

        emit ImageCreated(
            imageCount,
            time,
            _imgSHA3,
            _imgSign,
            _ipfsHash,
            payable(msg.sender), payable(msg.sender));
    }

    function changeOwner(
        uint _id,
        address payable newOwner
        ) public {
        
        bool FlagID = _id > 0 && _id <= imageCount;
        bool FlagOldOwner = tx.origin == images[_id].owner;
        bool FlagNewOwner = newOwner != images[_id].owner && newOwner != address(0x0);
        // if (_id <= 0 || _id > imageCount) return;    
        // if (tx.origin != images[_id].owner) return;
        // if (newOwner == images[_id].owner) return;
        // if (newOwner == address(0x0)) return;
        require(FlagID && FlagOldOwner && FlagNewOwner);

        images[_id].owner = newOwner;
    }

    function changeSign(uint _id, bytes memory newSign) public{
      require(_id > 0 && _id <= imageCount );
      require(newSign.length > 0);
      //get image data
      Image memory _image = images[_id];
      //get Owner's address
      address _owner = _image.owner;
      require(msg.sender == _owner);

      _image.signature = newSign;
      images[_id] = _image;
    } 

    function getImageOwner(uint imageID) public view returns(address) {
      require(imageID > 0 && imageID <= imageCount );
      return images[imageID].owner;
    }

    function getImageAuthor(uint imageID) public view returns(address) {
      require(imageID > 0 && imageID <= imageCount );
      return images[imageID].author;
    }

    function isSHA3Match(uint imageID, bytes32 testSHA3) public view returns(bool) {
      require(imageID > 0 && imageID <= imageCount );
      bytes memory SHA3 = abi.encodePacked(images[imageID].sha3);
      bytes memory tester = abi.encodePacked(testSHA3);
      return keccak256(tester) == keccak256(SHA3);
      
    }

    
}