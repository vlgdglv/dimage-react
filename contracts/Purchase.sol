// SPDX-License-Identifier: SimPL-2.0
pragma solidity ^0.8.12;

import "./Release.sol";

contract Purchase {

    Release public contractRelease;     //
    uint    public imageID;             //
    address public purchaser;           //
    address payable public imageOwner;  //
    address payable public imageAuthor; //
    bytes32 public SHA3;                //
    uint    public duration;            //
    uint    public launchTime;          //
    uint    public endTime;             //
    uint    public amount;              //
    bool    public isClosed = false;    //
    uint    public authorShare;         //
    uint    public ownerShare;          //
    address[] public prevOwners;        //
    uint[]  public prevOwnerShare;      //
    uint    public imageTxCount;        //

    event purchaseLaunched(uint imageID,address purchaser, address imageOwner, address imageAuthor, uint amount);
    event transferFailed(uint imageID,address transferor, address transferee);
    event purchaseDisengage(uint imageID, address canceller);

      // bool FlagDuration = _duration >= 3600;
      // bool FlagImageID = (_imageID > 0) && (_imageID <= contractRelease.imageCount());
      // bool FlagAuthor = (_imageAuthor != address(0x0)) && (_imageAuthor == contractRelease.getImageAuthor(_imageID))
      // bool FlagOwner = (_imageOwner != address(0x0)) && (_imageOwner == owner);
      // bool FlagPurchaser = (_purchaser != address(0x0)) && (_purchaser != owner);      
      // bool FlagSHA3 = contractRelease.isSHA3Match(_imageID, _SHA3)
      //use one require to save gas
      // require(FlagImageID && FlagOwner && FlagAuthor && FlagPurchaser && FlagDuration && FlagSHA3, "invalid parameters");
        
    constructor(
        address releaseAddress, uint _imageID,
        address _purchaser, uint _duration, bytes32 _SHA3
    ) payable {
        //创建图片发布合约对象
        contractRelease=Release(releaseAddress);
        address owner = contractRelease.getImageOwner(_imageID);
        require(_imageID > 0 && _imageID <= contractRelease.imageCount(), "invalid image ID");
        //重要：收购者不允许为先拥有者
        require(_purchaser != address(0x0) && _purchaser != owner);
        //检查提供的SHA3是否正确
        require(contractRelease.isSHA3Match(_imageID, _SHA3));
        require(_duration >= 5, "time too short");
        //设置合约参数
        imageID = _imageID;
        purchaser = _purchaser;
        imageOwner = payable(owner);
        imageAuthor = payable(contractRelease.getImageAuthor(_imageID));
        duration = _duration;
        launchTime = block.timestamp;                        //设置合约发布时间
        endTime = launchTime + _duration;
        amount = msg.value;                                  //收购者报价
        SHA3 = _SHA3;
        prevOwners = contractRelease.getPrevOwner(_imageID); //获取前拥有者
        imageTxCount = contractRelease.getTxCount(imageID);  //获取图片交易次数，用以计算发布者收益
        calShares();                                         //计算此交易各方收益
        emit purchaseLaunched(_imageID, _purchaser, imageOwner, imageAuthor, amount);
    }

    // bool FlagTimestamp = block.timestamp <= endTime;
    // bool FlagTxOrigin = tx.origin == imageOwner;
    // require(FlagTimestamp && FlagTxOrigin && !isClosed);

    function confirmPurchase() public payable {
        //检查是否超过截止时间
        require(block.timestamp <= endTime, "This transaction is expired!");
        //检查调用者是否为图片拥有者
        require(msg.sender == imageOwner, "You have no authority!");
        //检查合约是否有效
        require( isClosed == false,"This transaction is closed!" );
        // bool FlagTimestamp = block.timestamp <= endTime;
        // bool FlagTxOrigin = tx.origin == imageOwner;
        // require(FlagTimestamp && FlagTxOrigin && !isClosed);
        //为前拥有者转账
        isClosed = true;
        bool flag = true;   //转账结果标志
        for(uint i=0; i<prevOwners.length; i++) {
          if (prevOwners[i] != address(0x0)) {     //确保地址有效
            flag = flag && payable(prevOwners[i]).send(prevOwnerShare[i]);
          }
        }
        //分别向图片发布者和拥有者转账
        if ( imageAuthor.send(authorShare) && imageOwner.send(ownerShare) && flag) { 
        //所有转账均成功
          //图片交易次数增加1
          contractRelease.incTxCount(imageID);
          //重要：修改图片拥有者，移交图片所有权
          contractRelease.changeOwner(imageID, payable(purchaser));
          //重要：检查修改是否成功
          require(purchaser == contractRelease.getImageOwner(imageID));
          //交易确认成功
        }else{
          emit transferFailed(imageID,address(this), imageOwner);
          //任意转账失败，回滚转账和修改
          revert();
        }
    }

    function calShares()  private {
      //计算发布者收益
      if (imageTxCount <= 10) {
        authorShare = amount / 10 * 3;  //交易次数小于等于10，30%收益
      }else if(imageTxCount <= 50) {
        authorShare = amount / 5;       //次数大于10小于等于50，20%收益
      }else {
        authorShare = amount / 20 * 3;  //次数大于50，15%收益
      }
      //计算前拥有者收益
      uint prevShareSum = 0;
      prevOwnerShare = new uint[](5);
      for(uint i=0; i<prevOwners.length; i++) {
        if (prevOwners[i] != address(0x0)) {       //确保地址有效
          prevOwnerShare[i] = amount / 100 * (5-i);
          prevShareSum += prevOwnerShare[i];
        }
      }
      //拥有者收益：报价-发布者收益-前拥有者收益
      ownerShare = amount - authorShare - prevShareSum;
    }


   
    function declinePurchase() public payable {
      //检查是否超过截止时间
      require(block.timestamp <= endTime,"This transaction is expired!" );
      //检查调用者是否为拥有者
      require(msg.sender == imageOwner, "You have no authority!");
      //检查合约是否失效  
      require(isClosed == false, "This transaction is closed!");
      //重要：保证图片拥有者仍为原拥有者
      require(contractRelease.getImageOwner(imageID) == imageOwner);
      // bool FlagTimestamp = block.timestamp <= endTime;
      // bool FlagTxOrigin = msg.sender == imageOwner;
      // bool FlagOwner = contractRelease.getImageOwner(imageID) == imageOwner;
      // require(FlagTimestamp && FlagTxOrigin && FlagOwner && !isClosed);
      isClosed = true;
      //将资金退给收购者
      if ((payable(purchaser)).send(amount)) {
        emit purchaseDisengage(imageID, imageOwner);
      }else {
        emit transferFailed(imageID,address(this), purchaser);
        //转账失败
        revert();
      }
    }

      
    function cancelPurchase() public payable {
      //检查调用者是否为收购者
      require(msg.sender == purchaser, "You have no authority!");
      //检查合约是否有效
      require(isClosed == false,"This transaction is closed!");
      // bool FlagTxOrigin = msg.sender == purchaser;
      // require( FlagTxOrigin && !isClosed);
      isClosed = true;
      //取回资金
      if ((payable(purchaser)).send(amount)) {
        emit purchaseDisengage(imageID, purchaser);
      }else {
        emit transferFailed(imageID,address(this), purchaser);
        //转账失败
        revert();
      }
    }
}
