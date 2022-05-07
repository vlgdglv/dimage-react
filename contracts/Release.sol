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
        uint32 txCount;

        bytes32 sha3;
        bytes signature;
        string ipfsHash;
        
        address payable author;
        address payable owner;

        address[] prevOwners;
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
            0,
            _imgSHA3,
            _imgSign,
            _ipfsHash,
            payable(msg.sender),
            payable(msg.sender),
            new address[](5)
            );

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
        
        address oldOwner = images[_id].owner;
        bool FlagID = _id > 0 && _id <= imageCount;
        bool FlagOldOwner = (tx.origin ==  oldOwner);
        bool FlagNewOwner = (newOwner != oldOwner) && (newOwner != address(0x0));
        // if (_id <= 0 || _id > imageCount) return;    
        // if (tx.origin != images[_id].owner) return;
        // if (newOwner == images[_id].owner) return;
        // if (newOwner == address(0x0)) return;

        require(FlagID && FlagOldOwner && FlagNewOwner);

        images[_id].owner = newOwner;
        
        for (uint i=4; i>0 ; i--) {
          images[_id].prevOwners[i] = images[_id].prevOwners[i-1]; 
        }
        images[_id].prevOwners[0] = oldOwner;
    }

    function incTxCount(uint imageID) public {
      require(imageID > 0 && imageID <= imageCount);
      require(tx.origin == images[imageID].owner);
      images[imageID].txCount = images[imageID].txCount+1;
    }

    function getTxCount(uint imageID) public view returns(uint){
      require(imageID > 0 && imageID <= imageCount);
      return images[imageID].txCount;
    }

    function changeSign(uint imageID, bytes memory newSign) public{
      require(imageID > 0 && imageID <= imageCount );
      require(newSign.length > 0);
      //get image data
      Image memory _image = images[imageID];
      //get Owner's address
      address _owner = _image.owner;
      require(msg.sender == _owner);

      _image.signature = newSign;
      images[imageID] = _image;
    } 

    function getImageOwner(uint imageID) public view returns(address) {
      require(imageID > 0 && imageID <= imageCount );
      return images[imageID].owner;
    }

    function getImageAuthor(uint imageID) public view returns(address) {
      require(imageID > 0 && imageID <= imageCount );
      return images[imageID].author;
    }

    function getPrevOwner(uint imageID) public view returns(address[] memory) {
      require(imageID > 0 && imageID <= imageCount );
      return images[imageID].prevOwners;
    }

    function isSHA3Match(uint imageID, bytes32 testSHA3) public view returns(bool) {
      require(imageID > 0 && imageID <= imageCount );
      bytes memory SHA3 = abi.encodePacked(images[imageID].sha3);
      bytes memory tester = abi.encodePacked(testSHA3);
      return keccak256(tester) == keccak256(SHA3); 
    }
}