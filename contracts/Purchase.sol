// SPDX-License-Identifier: SimPL-2.0
pragma solidity ^0.8.12;

import "./Release.sol";

contract Purchase {

    Release public contractRelease;
    uint    public imageID; 
    address public purchaser;
    address payable public imageOwner;
    address payable public imageAuthor;
    bytes32 public SHA3;
    uint    public duration;
    uint    public launchTime;
    uint    public endTime;
    uint256 public amount;
    bool    public isClosed = false;
    uint    public authorShare;
    uint    public ownerShare;

    event purchaseLaunched(uint imageID,address purchaser, address imageOwner, address imageAuthor, uint amount);
    event transferComplete(uint imageID,address purchaser, address imageOwner);
    event transferFailed(uint imageID,address transferor, address transferee);
    event purchaseDisengage(uint imageID, address canceller);

    constructor(
        address releaseAddress,
        uint _imageID,
        address _purchaser,
        address payable _imageOwner,
        address payable _imageAuthor,
        uint _duration,
        bytes32 _SHA3
    ) payable {
        //evm ensures address should be valid otherwise contract will not be created
        //BUT I still check addresses for precaution
        bool FlagPurchaser = _purchaser != address(0x0);
        bool FlagOwner = _imageOwner != address(0x0);
        bool FlagAuthor = _imageAuthor != address(0x0);
        bool FlagDuration = _duration >= 15;
        bool FlagImageID = _imageID > 0;
        bool FlagSHA3 = _SHA3.length > 0;
        contractRelease=Release(releaseAddress);
        // require(_purchaser != address(0x0), "invalid purchaser address");
        // require(_imageOwner != address(0x0), "invalid image owner address");
        // require(_imageAuthor != address(0x0), "invalid image author address");
        // require(_purchaser != address(0x0), "invalid purchaser address");
        // require(_imageID > 0 && _imageID <= contractRelease.imageCount(), "invalid image ID");
        // require(_imageOwner != address(0x0) && _imageOwner == contractRelease.getImageOwner(_imageID), "invalid owner");
        // require(_imageAuthor != address(0x0) && _imageAuthor == contractRelease.getImageAuthor(_imageID), "invalid author");
        // require(_duration >= 15, "time too short");
        FlagImageID = FlagImageID && ( _imageID <= contractRelease.imageCount());
        FlagOwner = FlagOwner && (_imageOwner == contractRelease.getImageOwner(_imageID));
        FlagAuthor = FlagAuthor && (_imageAuthor == contractRelease.getImageAuthor(_imageID));
        FlagSHA3 = FlagSHA3 && contractRelease.isSHA3Match(_imageID, _SHA3);
        //use one require to save gas
        require(FlagImageID && FlagOwner && FlagAuthor && FlagPurchaser && FlagDuration && FlagSHA3, "invalid parameters");
        
        imageID = _imageID;
        purchaser = _purchaser;
        imageOwner = _imageOwner;
        imageAuthor = _imageAuthor;
        duration = _duration;
        launchTime = block.timestamp;
        endTime = launchTime + _duration;
        amount = msg.value;
        authorShare = amount / 10 ;
        ownerShare = amount - authorShare;
        emit purchaseLaunched(_imageID, _purchaser, _imageOwner, _imageAuthor, amount);
    }

    function confirmPurchase() public payable {
        bool FlagTimestamp = block.timestamp <= endTime;
        bool FlagTxOrigin = tx.origin == imageOwner;
        // if (block.timestamp > endTime) return;
        // if (tx.origin != imageOwner;) return;
        // if (isClosed) return;

        require(FlagTimestamp && FlagTxOrigin && !isClosed);
        
        isClosed = true;
    
        bool tsfOwnerFlag =  (payable(imageOwner)).send(ownerShare);
        bool tsfAuthorFlag = (payable(imageAuthor)).send(authorShare);
        
        if (tsfOwnerFlag && tsfAuthorFlag) {
          contractRelease.changeOwner(imageID, payable(purchaser));
          //double check
          if (contractRelease.getImageOwner(imageID) != purchaser) {
            isClosed = false;
            revert();
          }
          emit transferComplete(imageID, purchaser, imageOwner);
        } else{
          isClosed = false;
          revert();
        }
    }

    function declinePurchase() public payable {
        
      bool FlagTimestamp = block.timestamp <= endTime;
      bool FlagTxOrigin = msg.sender == imageOwner;
      bool FlagOwner = contractRelease.getImageOwner(imageID) == imageOwner;
      // require(block.timestamp <= endTime, "Contract has closed!");
      // require(msg.sender == imageOwner, "Who are you?");  
      // require(isClosed == false, "already done");
      // require(contractRelease.getImageOwner(imageID) == imageOwner, "");
      
      require(FlagTimestamp && FlagTxOrigin && FlagOwner && !isClosed);

      isClosed = true;

      if ((payable(purchaser)).send(amount)) {
        emit purchaseDisengage(imageID, imageOwner);
      }else {
        emit transferFailed(imageID,address(this), purchaser);
        isClosed = false;
        revert();
      }
    }

    function cancelPurchase() public payable {
      
      bool FlagTxOrigin = msg.sender == purchaser;
      bool FlagOwner = contractRelease.getImageOwner(imageID) == imageOwner;

      // require(msg.sender == purchaser, "you cannot cancel this");
      // require(isClosed == false, "already done");
      // require(contractRelease.getImageOwner(imageID) == imageOwner, "");
      require( FlagTxOrigin && FlagOwner && !isClosed);

      isClosed = true;

      if ((payable(purchaser)).send(amount)) {
        emit purchaseDisengage(imageID, purchaser);
      }else {
        emit transferFailed(imageID, address(this), purchaser);
        isClosed = false;
        revert();
      }
    }

    // function callTest() public payable {
    //   contractRelease.changeOwner(imageID, payable(purchaser));
    // }
}
