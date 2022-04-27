// SPDX-License-Identifier: SimPL-2.0
pragma solidity ^0.8.12;

import "./Release.sol";

contract Purchase {

    Release public contractRelease;
    uint    public imageID; 
    address public purchaser;
    address payable public imageOwner;
    address payable public imageAuthor;
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

    //evidence of stupid
    // function checkerRelease()     public view returns (address)       { return address(contractRelease); }
    // function checkerImageID()     public view returns (uint)          { return imageID; }
    // function checkerPurchaser()   public view returns (address)       { return purchaser; }
    // function checkerOwner()       public view returns (address)       { return imageOwner; }
    // function checkerAuthor()      public view returns (address)       { return imageAuthor; }
    // function checkerDuration()    public view returns (uint)          { return duration; }
    // function checkerEndTime()     public view returns (uint)          { return endTime; }
    // function checkerLaunchTime()  public view returns (uint)          { return launchTime; }
    // function checkerAmount()      public view returns (uint256)       { return amount; }
    // function checkerClosed()      public view returns (bool)          { return isClosed;}
    // function checkerOwnerShare()  public view returns (uint)          { return ownerShare;}
    // function checkerAuthorShare() public view returns (uint)          { return authorShare;}
    // function checkerSender()      public view returns (address)       { return msg.sender; }
    // function checkerBalance()     public view returns (uint256)       { return address(this).balance; }
    // function checkerOrigin()      public view returns (address)       { return tx.origin; }
    // function checkerTmSp()        public view returns (uint)          { return block.timestamp; }
    //default getter is cheaper, no need for these shit

    constructor(
        address releaseAddress,
        uint _imageID,
        address _purchaser,
        address payable _imageOwner,
        address payable _imageAuthor,
        uint _duration
    ) payable {
        //evm ensures address should be valid otherwise contract will not be created
        //BUT I still check addresses for precaution
        bool FlagPurchaser = _purchaser != address(0x0);
        bool FlagOwner = _imageOwner != address(0x0);
        bool FlagAuthor = _imageAuthor != address(0x0);
        bool FlagDuration = _duration >= 15;
        // require(_purchaser != address(0x0), "invalid purchaser address");
        // require(_imageOwner != address(0x0), "invalid image owner address");
        // require(_imageAuthor != address(0x0), "invalid image author address");
        // require(bytes(_SHA3).length != 0, "invalid sha3");
        // require(_duration >= 15, "time too short");
        contractRelease = Release(releaseAddress);

        bool FlagImageID = _imageID > 0 && _imageID <= contractRelease.imageCount();

        FlagOwner = FlagOwner && _imageOwner == contractRelease.getImageOwner(_imageID);
        FlagAuthor = FlagAuthor && _imageAuthor == contractRelease.getImageAuthor(_imageID);
        // require(_imageID > 0 && _imageID <= contractRelease.imageCount(), "invalid image ID");
        // require(_imageOwner == contractRelease.getImageOwner(_imageID), "wrong owner");
        // require(_imageAuthor == contractRelease.getImageAuthor(_imageID), "wrong author");
        
        //use one require to save gas
        require(FlagImageID && FlagOwner && FlagAuthor && FlagPurchaser && FlagDuration);

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
          emit transferComplete(imageID, purchaser, imageOwner);
        } else{
          isClosed = false;
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
      }
    }

    // function callTest() public payable {
    //   contractRelease.changeOwner(imageID, payable(purchaser));
    // }
}
