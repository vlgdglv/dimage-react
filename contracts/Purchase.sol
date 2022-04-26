// SPDX-License-Identifier: SimPL-2.0
pragma solidity ^0.8.12;

import "./Release.sol";

contract Purchase {
    uint imageID; 
    address purchaser;
    address payable imageOwner;
    address payable imageAuthor;
    string SHA3;
    uint duration;
    uint launchTime;
    uint endTime;
    uint256 amount;
    bool isClosed = false;
    
    uint authorShare;
    uint ownerShare;

    event purchaseLaunched(uint imageID,address purchaser, address imageOwner, address imageAuthor, uint amount);
    event transferComplete(uint imageID,address purchaser, address imageOwner, address imageAuthor, uint amount);
    event transferFailed(uint imageID,address transferor, address transferee, uint amount);
    event purchaseDisengage(uint imageID, address canceller);

    // function checkerRelease()     public view returns (address)       { return address(contractRelease); }
    function checkerImageID()     public view returns (uint)          { return imageID; }
    function checkerPurchaser()   public view returns (address)       { return purchaser; }
    function checkerOwner()       public view returns (address)       { return imageOwner; }
    function checkerAuthor()      public view returns (address)       { return imageAuthor; }
    function checkerSHA3()        public view returns (string memory) { return SHA3; }
    function checkerDuration()    public view returns (uint)          { return duration; }
    function checkerEndTime()     public view returns (uint)          { return endTime; }
    function checkerLaunchTime()  public view returns (uint)          { return launchTime; }
    function checkerAmount()      public view returns (uint256)       { return amount; }
    function checkerClosed()      public view returns (bool)          { return isClosed;}
    function checkerOwnerShare()  public view returns (uint)          { return ownerShare;}
    function checkerAuthorShare() public view returns (uint)          { return authorShare;}
    

    function checkerSender()      public view returns (address) { return msg.sender; }
    function checkerBalance()     public view returns (uint256) { return address(this).balance; }
    function checkerOrigin()      public view returns (address) { return tx.origin; }
    function checkerTmSp()        public view returns (uint)    { return block.timestamp; }

    constructor(
        // address releaseAddress,
        uint _imageID,
        address _purchaser,
        address payable _imageOwner,
        address payable _imageAuthor,
        string memory _SHA3,
        uint _duration
    ) payable {
        //evm ensures address should be valid otherwise contract will not be created
        //BUT I still check addresses for precaution
        require(_purchaser != address(0x0), "invalid purchaser address");
        require(_imageOwner != address(0x0), "invalid image owner address");
        require(_imageAuthor != address(0x0), "invalid image author address");
        require(bytes(_SHA3).length != 0, "invalid sha3");
        require(_duration >= 15, "time too short");

        // contractRelease = Release(releaseAddress);

        // require(_imageID > 0 && _imageID <= contractRelease.imageCount(), "invalid image ID");
        // require(_imageOwner == contractRelease.getImageOwner(_imageID), "wrong owner");
        // require(_imageAuthor == contractRelease.getImageAuthor(_imageID), "wrong author");

        imageID = _imageID;
        purchaser = _purchaser;
        imageOwner = _imageOwner;
        imageAuthor = _imageAuthor;
        duration = _duration;
        launchTime = block.timestamp;
        endTime = launchTime + _duration;
        SHA3 = _SHA3;
        amount = msg.value;

        authorShare = amount / 10 ;
        ownerShare = amount - authorShare;
        emit purchaseLaunched(_imageID, _purchaser, _imageOwner, _imageAuthor, amount);
    }

    function confirmPurchase() public payable {
        require(block.timestamp <= endTime, "Contract has closed!");        
        require(tx.origin == imageOwner, "Who are you?");  
        require(isClosed == false, "already done");
        isClosed = true;

        bool tsfOwnerFlag =  (payable(imageOwner)).send(ownerShare);
        bool tsfAuthorFlag = (payable(imageAuthor)).send(authorShare);

        if (tsfOwnerFlag && tsfAuthorFlag) {
          emit transferComplete(imageID, purchaser, imageOwner, imageAuthor, amount);
        } 
        if (tsfOwnerFlag){
          emit transferFailed(imageID, purchaser, imageOwner, ownerShare); 
        }
        if (tsfAuthorFlag){
          emit transferFailed(imageID, purchaser, imageAuthor, authorShare);
        }

    }

    function declinePurchase() public payable {
      require(block.timestamp <= endTime, "Contract has closed!");
      require(msg.sender == imageOwner, "Who are you?");  
      require(isClosed == false, "already done");
      // require(contractRelease.getImageOwner(imageID) == imageOwner, "");
      
      isClosed = true;

      if ((payable(purchaser)).send(amount)) {
        emit purchaseDisengage(imageID, imageOwner);
      }else {
        emit transferFailed(imageID, address(this), purchaser, amount);
      }
    }

    function cancelPurchase() public payable {
      require(msg.sender == purchaser, "you cannot cancel this");
      require(isClosed == false, "already done");
      // require(contractRelease.getImageOwner(imageID) == imageOwner, "");

      isClosed = true;

      if ((payable(purchaser)).send(amount)) {
        emit purchaseDisengage(imageID, purchaser);
      }else {
        emit transferFailed(imageID, address(this), purchaser, amount);
      }
    }
}
