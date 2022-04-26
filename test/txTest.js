const { assert } = require('chai');

// const Purchase = artifacts.require('./Purchase.sol')
const Purchase = require( '../client/src/abis/Purchase.json');
const Release = artifacts.require('./Release.sol')

require('chai').use(require('chai-as-promised')).should()

contract('Release and Purchase', ([deployer, purchaser, owner, author, nobody])=>{

  const H = "[LOG]"
  const gasLimit = 10000000
  const offer = 2000000000000000;
  const sha3 = "this is sha3";
  const hash = 'ipfs hash'
  let instance;
  let purchaseAddress;
  let originPurchaseBalance;
  let deployGasFee;
  let release;
  let releaseAddress;
  
  beforeEach(async () => {
    release = await Release.deployed()
    await release.uploadImage(hash, 'sha3','signature from author', 'Image title',{from: author})
    await release.uploadImage("sa", '3ahs','erutangis from author', 'Egami eltit',{from: author})
    releaseAddress = await release.address;

    originPurchaseBalance = BigInt(await web3.eth.getBalance(purchaser))
    //new an instance and deploy it
    instance = new web3.eth.Contract(Purchase.abi,{
      // gasPrice:20000,
      gasLimit:3000000
    })
    const result = await instance.deploy({
      data: Purchase.bytecode,
      arguments:[releaseAddress, 1, purchaser, author, author, sha3 ,360],
    }).send({from:purchaser, value: offer})
    purchaseAddress = result.options.address
    //calc deploy contract gas fee
    const afterB = BigInt(await web3.eth.getBalance(purchaser))
    deployGasFee = originPurchaseBalance - afterB - BigInt(offer)

  })
  
  // describe('contract info', async()=>{
    

  //   it('check deployment', async() => {
  //     // console.log(H + "deployer = " + deployer)
  //     const imgCnt = await release.imageCount()
  //     assert.equal(imgCnt, 2)
  //     // console.log(H + "image count = " + imgCnt)
  //     console.log(H + "purchase deploy gas fee = " + deployGasFee)
  //   })

  //   it('reject contract deployment', async() => {
  //     instance = new web3.eth.Contract(Purchase.abi,{
  //       gasLimit:3000000
  //     })
  //     // instance.deploy({data: Purchase.bytecode,arguments:["0x0", 1, purchaser, author, author, sha3 ,360]})
  //     //   .send({from:purchaser, value: offer}).should.be.rejected
  //     instance.deploy({data: Purchase.bytecode,arguments:[releaseAddress, 0, purchaser, author, author, sha3 ,360]})
  //       .send({from:purchaser, value: offer}).should.be.rejected
  //     instance.deploy({data: Purchase.bytecode,arguments:[releaseAddress, 1, purchaser, nobody, author, sha3 ,360]})
  //       .send({from:purchaser, value: offer}).should.be.rejected
  //     instance.deploy({data: Purchase.bytecode,arguments:[releaseAddress, 1, purchaser, author, nobody, sha3, 360]})
  //       .send({from:purchaser, value: offer}).should.be.rejected  
  //     instance.deploy({data: Purchase.bytecode,arguments:[releaseAddress, 1, purchaser, owner, author, "", 360]})
  //       .send({from:purchaser, value: offer}).should.be.rejected 
  //     instance.deploy({data: Purchase.bytecode,arguments:[releaseAddress, 1, purchaser, owner, author, sha3, 3]})
  //       .send({from:purchaser, value: offer}).should.be.rejected 
  //   })

  //   it('check purchase parameters', async() => {
  //     const contractPurchase = new web3.eth.Contract(Purchase.abi, purchaseAddress)
  //     const tempRelease = await contractPurchase.methods.checkerRelease().call()
  //     // console.log(H + "address should  = " + releaseAddress)
  //     // console.log(H + "address claimed = " + tempRelease)
  //     assert.equal(releaseAddress, tempRelease)
  //   })

  // })

  describe('call confirmPurchase2', async() => {
    
    // it('call callTest() in Purchase', async() => {
    //   const oldOwner = await release.getImageOwner(1)
    //   console.log(H + "parchaser         = " + purchaser)
    //   console.log(H + "owner before call = " + oldOwner)
    //   const contractPurchase = new web3.eth.Contract(Purchase.abi, purchaseAddress)

    //   await contractPurchase.methods.callTest().send({ from: author })

    //   const newOwner = await release.getImageOwner(1)
    //   console.log(H + "owner after  call = " + newOwner)
    // })

    it('call confirmPurchase v2 first deal', async() => {
      const contractPurchase = new web3.eth.Contract(Purchase.abi, purchaseAddress)
      // const result = await contractPurchase.methods.confirmPurchase2().estimateGas({from : author})
      const ownerOldBalance = await web3.eth.getBalance(author)
      
      const oldOwner = await release.getImageOwner(1)

      const result = await contractPurchase.methods.confirmPurchase2().send({from : author})

      const gasUsed = parseInt(result.gasUsed)
      const effectiveGasPrice = parseInt(web3.utils.toBN(result.effectiveGasPrice))
      const GasFee = BigInt(gasUsed * effectiveGasPrice)

      const newOwner = await release.getImageOwner(1)
      
      const ownerNewBalance = await web3.eth.getBalance(author)
      const ownerShouldBe = BigInt(ownerOldBalance) + BigInt(offer) - GasFee;
      console.log(H + "old owner = " + oldOwner)
      console.log(H + "new owner = " + newOwner)
      console.log(H + "purchaser = " + purchaser)

      assert.closeTo(Number(ownerNewBalance),Number(ownerShouldBe), 10e10, "author balance gets right")
      assert.equal(purchaser, newOwner, "owner gets right ")
    })

    // it('call confirmPurchase v2', async() => {
    //   const result = await contract.methods.confirmPurchase2().send({ from: author })
    // })
  })

  // describe('show gas', async() => {

  //   it('call estimateGas', async() => {
  //     const contractPurchase = new web3.eth.Contract(Purchase.abi, purchaseAddress)
  //     const result = await contractPurchase.methods.confirmPurchase().estimateGas({ from: author })
  //     console.log(result)
  //   })
  // })
})