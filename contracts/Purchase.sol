// SPDX-License-Identifier: SimPL-2.0
pragma solidity ^0.8.12;

import "./Verification.sol";

contract Purchase {
    address purchaser;
    address payable imageOwner;
    address payable imageAuthor;
    string SHA3;
    uint duration;
    uint launchTime;
    uint endTime;
    uint256 amount;
    bool isSuccess = false;
    
    uint authorShare;
    uint ownerShare;

    event purchaseLaunched(address purchaser, address imageOwner, uint amount);
    event transefComplete(uint amount, address buyer, address seller);


    function checkerPurchaser() public view returns (address)       { return purchaser; }
    function checkerOwner()     public view returns (address)       { return imageOwner; }
    function checkerAuthor()      public view returns (address)       { return imageAuthor; }
    function checkerSHA3()        public view returns (string memory) { return SHA3; }
    function checkerDuration()    public view returns (uint)          { return duration; }
    function checkerEndTime()     public view returns (uint)          { return endTime; }
    function checkerLaunchTime()  public view returns (uint)          { return launchTime; }
    function checkerAmount()      public view returns (uint256)       { return amount; }
    function checkerSuccess()     public view returns (bool)          { return isSuccess;}
    function checkerOwnerShare()  public view returns (uint)          { return ownerShare;}
    function checkerAuthorShare() public view returns (uint)          { return authorShare;}
    

    function checkerSender()      public view returns (address) { return msg.sender; }
    function checkerBalance()     public view returns (uint256) { return address(this).balance; }
    function checkerOrigin()      public view returns (address) { return tx.origin; }
    function checkerTmSp()        public view returns (uint)    { return block.timestamp; }

    constructor(
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
        emit purchaseLaunched(_purchaser, _imageOwner, amount);
    }

    function confirmPurchase() public payable returns (string memory) {
        
        require(block.timestamp <= endTime, "Contract has closed!");        
        require(msg.sender == imageOwner, "Who are you?");  
        require(isSuccess == false, "already done");
        
        isSuccess = true;

        if ((payable(imageOwner)).send(ownerShare) && (payable(imageAuthor)).send(authorShare)) {
            emit transefComplete(amount, purchaser, imageOwner);
            return "Transfer completed!";
        } else {
            return "Something wrong!";
        }
    }

    // fallback() external payable {
    //   uint falseAmount = msg.value;
    //   address from = msg.sender;
    //   payable(from).transfer(falseAmount);
    // }

    // receive() external payable {
    //   uint falseAmount = msg.value;
    //   address from = msg.sender;
    //   payable(from).transfer(falseAmount);
    // }
}
