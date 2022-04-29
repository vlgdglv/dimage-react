// SPDX-License-Identifier: SimPL-2.0
pragma solidity ^0.8.12;

contract Release{
    
    string public contractName;
    uint public imageCount = 0;
    mapping(uint => Image) public images;
  
    
    struct Image {
        uint id;
        string hash;
        string sha3;
        string signature;
        string title;
        address payable author;
        address payable owner;
    }

    event ImageCreated(
        uint id,
        string hash,
        string sha3,
        string signature,
        string title,
        address payable author,
        address payable owner
    );

    constructor()  {
      contractName = "release";
    }
    
    function uploadImage(
        string memory _imgHash,
        string memory _imgSHA3, 
        string memory _imgSign,
        string memory _title) public {

        //check requires
        require(bytes(_imgHash).length > 0);
        require(bytes(_imgSHA3).length > 0);
        require(bytes(_imgSign).length > 0);
        require(bytes(_title).length > 0);
        require(msg.sender != address(0x0));

        imageCount++;
        images[imageCount] = Image(
            imageCount,
            _imgHash,
            _imgSHA3,
            _imgSign,
            _title, 
            payable(msg.sender),payable(msg.sender));
        emit ImageCreated(
            imageCount,
            _imgHash,
            _imgSHA3,
            _imgSign,
            _title, 
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

    function changeSign(uint _id, string memory newSign) public{
      require(_id > 0 && _id <= imageCount );
      require(bytes(newSign).length > 0);
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

    function isSHA3Match(uint imageID, string memory testSHA3) public view returns(bool) {
      require(imageID > 0 && imageID <= imageCount );
      string memory SHA3 = images[imageID].sha3;
      if (bytes(SHA3).length != bytes(testSHA3).length) {
          return false;
      } else {
          return keccak256(bytes(testSHA3)) == keccak256(bytes(SHA3));
      }
    }

    
}