// SPDX-License-Identifier: SimPL-2.0
pragma solidity ^0.8.12;

contract Release{
    
    string public contractName;
    uint public imageCount = 0;            //图片计数
    mapping(uint => Image) public images;  //使用mapping存储图片信息
    mapping(bytes32 => uint8) public released; //记录图片SHA3
    
    struct Image {
        uint timestamp;         //图片发布时间戳
        uint txCount;           //图片交易次数
        bytes32 sha3;           //图片数字摘要(keccak256)
        bytes signature;        //图片数字签名
        string ipfsHash;        //IPFS哈希值(cid)
        address payable author; //图片发布者地址
        address payable owner;  //图片拥有者地址
        address[] prevOwners;   //图片前拥有者地址列表
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
        //检查参数是否合法
        require(bytes(_ipfsHash).length > 0);
        require(_imgSHA3.length > 0);
        require(_imgSign.length > 0);
        require(tx.origin != address(0x0));
        //利用release字典检查该图片是否已经存在
        require(released[_imgSHA3] == 0, "already exist!");

        uint time = block.timestamp;                     //生成上传时间戳
        imageCount++;                                    //更新图片计数
        //新增图片信息
        images[imageCount] = Image(time, 0, _imgSHA3, _imgSign, _ipfsHash,
            payable(tx.origin), payable(tx.origin), new address[](5) );
        released[_imgSHA3] = 1;                          //新增sha3信息

        emit ImageCreated( imageCount, time, _imgSHA3,_imgSign,_ipfsHash,
            payable(tx.origin), payable(tx.origin));   //触发图片上传事件
    }

    //修改图片拥有者
    function changeOwner(
        uint _id,
        address payable newOwner
        ) public {
        address oldOwner = images[_id].owner; 
        // //检查图片ID
        // require(_id > 0 && _id <= imageCount);  
        // //重要：确保事务发起者为图片现拥有者
        // require(tx.origin ==  oldOwner);   
        // //检查新拥有者：不能为当前拥有者，不能为空
        // require((newOwner != oldOwner) && (newOwner != address(0x0)));
      
        bool FlagID = _id > 0 && _id <= imageCount;
        bool FlagOldOwner = (tx.origin ==  oldOwner);
        bool FlagNewOwner = (newOwner != oldOwner) && (newOwner != address(0x0));
        require(FlagID && FlagOldOwner && FlagNewOwner);
        
        //执行修改
        images[_id].owner = newOwner;
        //更新前拥有者
        for (uint i=4; i>0 ; i--) {
          images[_id].prevOwners[i] = images[_id].prevOwners[i-1]; 
        }
        images[_id].prevOwners[0] = oldOwner;
    }


    //修改图片签名
    function changeSign(uint imageID, bytes memory newSign) public{
      //检查参数
      require(imageID > 0 && imageID <= imageCount );
      require(newSign.length > 0);
      //获取图片信息
      Image memory _image = images[imageID];
      //重要：只能由图片拥有者修改
      address _owner = _image.owner;
      require(msg.sender == _owner);
      //修改签名
      images[imageID].signature = newSign;
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