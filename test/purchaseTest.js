const { assert } = require('chai');

// const Purchase = artifacts.require('./Purchase.sol')
const Purchase = require( '../client/src/abis/Purchase.json');
const Release = artifacts.require('./Release.sol')

require('chai').use(require('chai-as-promised')).should()

contract('Purchase', ([deployer,purchaser, owner, author, nobody]) => {
  
  const gasLimit = 10000000
  const offer = 2000000000000000;
  const sha3 = "this is sha3";
  const hash = 'ipfs hash'
  let instance;
  let address;
  let originPurchaseBalance;
  let deployGasFee;
  let release;
  let releaseAddress;

  beforeEach(async() => {
    // release = await Release.deployed()
    // releaseAddress = await release.address;
    // await release.uploadImage(hash, 'sha3','signature from author', 'Image title',{from: owner})
    // await release.uploadImage("sa", '3ahs','erutangis from author', 'Egami eltit',{from: owner})

    //deploy a Purchase instance before every describe
    //purchaser balance before deployment
    originPurchaseBalance = BigInt(await web3.eth.getBalance(purchaser))
    //new an instance and deploy it
    instance = new web3.eth.Contract(Purchase.abi,{
      // gasPrice:20000,
      gasLimit:gasLimit
    })

    const result = await instance.deploy({
      data: Purchase.bytecode,
      arguments:[ 1, purchaser, owner, owner, sha3 ,360],
    }).send({from:purchaser, value: offer})

    address = result.options.address

    //calc deploy contract gas fee
    const afterB = BigInt(await web3.eth.getBalance(purchaser))
    deployGasFee = originPurchaseBalance - afterB - BigInt(offer)
    // console.log("[LOG] deployGasFee = " + deployGasFee)
  })

  describe('run time deployment',async()=>{
    
    it('deployment issues', async() => {
      instance = new web3.eth.Contract(Purchase.abi,{
        gasLimit:10000000
      })
      // instance.deploy({data: Purchase.bytecode,arguments:[0, owner, author, sha3 ,360]})
      //   .send({from:purchaser, value: offer}).should.be.rejected
      // instance.deploy({data: Purchase.bytecode,arguments:[purchaser, 0, author, sha3 ,360]})
      //   .send({from:purchaser, value: offer}).should.be.rejected
      // instance.deploy({data: Purchase.bytecode,arguments:[purchaser, owner, 0, sha3 ,360]})
      //   .send({from:purchaser, value: offer}).should.be.rejected
      instance.deploy({data: Purchase.bytecode,arguments:[ 0,purchaser, owner, owner, "" ,360]})
        .send({from:purchaser, value: offer}).should.be.rejected
      instance.deploy({data: Purchase.bytecode,arguments:[1,purchaser, owner, owner, "" ,360]})
        .send({from:purchaser, value: offer}).should.be.rejected
      instance.deploy({data: Purchase.bytecode,arguments:[1,purchaser, owner, owner, sha3 ,3]})
        .send({from:purchaser, value: offer}).should.be.rejected  
      instance.deploy({data: Purchase.bytecode,arguments:[1,purchaser, owner, author, sha3 ,3]})
      .send({from:purchaser, value: offer}).should.be.rejected 
    })

    it('parameters check', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      // assert.equal(await contract.methods.checkerRelease().call(), releaseAddress, "release contract right")
      assert.equal(await contract.methods.checkerImageID().call(), 1, "id right")
      assert.equal(await contract.methods.checkerPurchaser().call(), purchaser, "purchase right")
      assert.equal(await contract.methods.checkerOwner().call(), owner, "owner right")
      assert.equal(await contract.methods.checkerAuthor().call(), owner, "author right")
      assert.equal(await contract.methods.checkerSHA3().call(), sha3, "sha3 right")
      assert.equal(await contract.methods.checkerDuration().call(), 360, "duration right")
      assert.equal(await contract.methods.checkerAmount().call(), offer, "amount right")
      assert.equal(await contract.methods.checkerClosed().call(), false, "success flag right")
      // console.log("[LOG]End time = " + await contract.methods.checkerEndTime().call())  
      // console.log("[LOG]Launch time = " + await contract.methods.checkerLaunchTime().call())
      // console.log("[LOG]Owner Share = " + await contract.methods.checkerOwnerShare().call())
      // console.log("[LOG]Author Share = " + await contract.methods.checkerAuthorShare().call())
    })

    // it('call Release from Purchase', async() => {
    //   // const oldOwner = await release.getImageOwner(1)
    //   console.log("[LOG] purchaser = " + purchaser)
    //   console.log("[LOG] old owner = " + oldOwner)
      
    //   const contract = new web3.eth.Contract(Purchase.abi, address)
    //   // const ownerAddress = await contract.methods.callTest().send({from : owner})
    //   console.log(ownerAddress)
    //   // const newOwner = await release.getImageOwner(1)
    //   console.log("[LOG] new owner = " + newOwner)
    // })
  })

  describe('transactions check', async() => {
    
    it('make first deal', async() => {
      //before deal
      const contract = new web3.eth.Contract(Purchase.abi, address)

      const ownerOldBalance = await web3.eth.getBalance(owner)
      // const authorOldBalance = await web3.eth.getBalance(author)
      // console.log("[LOG]ownerOldBalance =  "+ownerOldBalance)
      
      // const oldOwner = await release.getImageOwner(1)
      // console.log("[LOG] purchaser = " + purchaser)
      // console.log("[LOG] old owner = " + oldOwner)
      
      //confirm deal
      const result = await contract.methods.confirmPurchase().send({ from: owner })
      // console.log("RESULT ----------------------------------")
      // console.log(result)
      //get some deal results 
      const gasUsed = parseInt(result.gasUsed)
      const effectiveGasPrice = parseInt(web3.utils.toBN(result.effectiveGasPrice))
      const GasFee = BigInt(gasUsed * effectiveGasPrice)
      // console.log("[LOG]effectiveGasPrice = " + egp)

      // const newOwner = await release.getImageOwner(1)
      // console.log("[LOG] new owner = " + newOwner)
      //after deal
      const ownerNewBalance = await web3.eth.getBalance(owner)
      // console.log("[LOG]ownerNewBalance =  "+ ownerNewBalance)
      //compare balance before and after deal
      const ownerShouldBe = BigInt(ownerOldBalance) + BigInt(offer) - GasFee;
      assert.closeTo(Number(ownerNewBalance),Number(ownerShouldBe), 10e10, "owner gets right")

      // const newOwner = await release.getImageOwner(1)
      // assert.equal(newOwner, purchaser, "Owner updated!")
    })

    it('decline purchase', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      //before balances
      const ownerOldBalance = BigInt(await web3.eth.getBalance(owner))
      const authorOldBalance =Number(await web3.eth.getBalance(author))
      //decline this purchase by owner
      const result = await contract.methods.declinePurchase().send({ from: owner, value: 200000 })
      //decline gas fee, pay by owner (who declines)
      const gasUsed = parseInt(result.gasUsed)
      const effectiveGasPrice = parseInt(web3.utils.toBN(result.effectiveGasPrice))
      const declineGasFee = BigInt(gasUsed * effectiveGasPrice)
      //after balances
      const purchaserNewBalance = Number(await web3.eth.getBalance(purchaser))
      const ownerNewBalance = Number(await web3.eth.getBalance(owner))
      const authorNewBalance = Number(await web3.eth.getBalance(author))

      //author should not be affected
      assert.equal(authorOldBalance,authorNewBalance,"author right")
      //owner should only lose decline operation gas fee
      const ownerBalanceShould = Number(BigInt(ownerOldBalance) - declineGasFee)
      assert.closeTo(ownerNewBalance, ownerBalanceShould, 10e5, "owner get right")
      //purchaser should only lose Purchase contract deployment gas fee
      const purchaseBalanceShould = Number(originPurchaseBalance - deployGasFee)
      assert.closeTo(purchaserNewBalance, purchaseBalanceShould, 10e5, "purchase right")      
    })

    it('cancel purchase', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      //before balances
      const ownerOldBalance = Number(await web3.eth.getBalance(owner))
      const authorOldBalance =Number(await web3.eth.getBalance(author))
  
      //cancel purchase by purchaser
      const result = await contract.methods.cancelPurchase().send({ from: purchaser, value: 200000 })
      //cancel gas fee, pay by purchaser (who cancels)
      const gasUsed = parseInt(result.gasUsed)
      const effectiveGasPrice = parseInt(web3.utils.toBN(result.effectiveGasPrice))
      const cancelGasFee = BigInt(gasUsed * effectiveGasPrice)

      //after balances
      const purchaserNewBalance = Number(await web3.eth.getBalance(purchaser))
      const ownerNewBalance = Number(await web3.eth.getBalance(owner))
      const authorNewBalance = Number(await web3.eth.getBalance(author))
      
      //owner and author should not be affected
      assert.equal(ownerOldBalance,ownerNewBalance,"author right")  
      assert.equal(authorOldBalance,authorNewBalance,"author right")
      //purchaser should only Purchase contract deployment and cancel gas fee
      const purchaseBalanceShould = Number(originPurchaseBalance - deployGasFee - cancelGasFee)
      assert.closeTo(purchaserNewBalance, purchaseBalanceShould, 10e5, "purchase right")
    })

    it('malicious purchaser or third-party calls confirmPurchase()', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      contract.methods.confirmPurchase().send({ from: purchaser, value: 200000 }).should.be.rejected
      contract.methods.confirmPurchase().send({ from: nobody, value: 200000 }).should.be.rejected
      contract.methods.confirmPurchase().send({ from: author, value: 200000 }).should.be.rejected
    })

    it('malicious third-party calls declinePurchase()', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      contract.methods.declinePurchase().send({ from: purchaser, value: 200000 }).should.be.rejected
      contract.methods.declinePurchase().send({ from: nobody, value: 200000 }).should.be.rejected
      contract.methods.declinePurchase().send({ from: author, value: 200000 }).should.be.rejected
    })

    it('malicious third-party calls cancelPurchase()', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      contract.methods.cancelPurchase().send({ from: owner, value: 200000 }).should.be.rejected
      contract.methods.cancelPurchase().send({ from: nobody, value: 200000 }).should.be.rejected
      contract.methods.cancelPurchase().send({ from: author, value: 200000 }).should.be.rejected
    })

    it('re-call confirmPurchase() after it has been confirmed', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      await contract.methods.confirmPurchase().send({ from: owner, value: 200000 })
     await contract.methods.confirmPurchase().send({ from: owner, value: 200000 }).should.be.rejected
    })

    it('re-call declinePurchase() after it has been confirmed', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      await contract.methods.confirmPurchase().send({ from: owner, value: 200000 })
      await contract.methods.declinePurchase().send({ from: owner, value: 200000 }).should.be.rejected
    })

    it('re-call cancelPurchase() after it has been confirmed', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      await contract.methods.confirmPurchase().send({ from: owner, value: 200000 })
      await contract.methods.cancelPurchase().send({ from: owner, value: 200000 }).should.be.rejected
    })

    // this test takes long time
    it('try to confirm an expired purchase', async() => {
      const result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[9,purchaser, owner, author, sha3 ,16],
      }).send({from:purchaser, value: offer})
      const contract = new web3.eth.Contract(Purchase.abi, result.options.address)
      // console.log("[LOG]launch time:" + await contract.methods.checkerLaunchTime().call())
      // console.log("[LOG]18s start, expire time:" + await contract.methods.checkerEndTime().call())
      await new Promise(resolve => setTimeout(resolve,25000 )).then(async()=>{
        // console.log("[LOG]18s end, now at:" + new Date().valueOf())
        // console.log("[LOG]block.timestamp:" + await contract.methods.checkerTmSp().call())
        await contract.methods.confirmPurchase().send({ from: owner, value: 200000 }).should.be.rejected
        await contract.methods.declinePurchase().send({ from: owner, value: 200000 }).should.be.rejected
      })
    })

//   })

// })

// contract('Release & Purchase', ([deployer,purchaser, owner, author, nobody ])=>{
  
//   let release;
//   let purchaseAddress1;
//   let purchaseAddress2;  
//   const hash = 'abc123'
//   const offer = 2000000000000000;
//   const sha3 = "this is sha3";

//   before(async () => {
//     let result 
//     //releas some images
//     release = await Release.deployed()
//     await release.uploadImage(hash, 'sha3','signature from author', 'Image title',{from: author})
//     await release.uploadImage("sa", '3ahs','erutangis from author', 'Egami eltit',{from: author})
//     //lunach some purchase tx
//     const instance = new web3.eth.Contract(Purchase.abi,{
//       gasLimit:2000000
//     })
//     //parchase 1 
//     result = await instance.deploy({
//       data: Purchase.bytecode,
//       arguments:[1,purchaser, author, author, sha3 ,360],
//     }).send({from:purchaser, value: offer})
//     purchaseAddress1 = result.options.address
//     //parchase 2
//     result = await instance.deploy({
//       data: Purchase.bytecode,
//       arguments:[2,purchaser, author, author, sha3 ,360],
//     }).send({from:purchaser, value: offer})
//     purchaseAddress2 = result.options.address

//   })

//   describe('whole scenario test', async() => {

//     it('release contract deploys and image upload successfully', async() => {
//       const name = await release.contractName()
//       assert.equal(name, 'release', "name correct")
//       const imageCount = await release.imageCount()
//       assert.equal(imageCount, 2, "image count correct")
//     })

//     it('purchase 1 formal process', async() => {
//       let result
//       //owner confirms it
//       const contract = new web3.eth.Contract(Purchase.abi, purchaseAddress1)
//       result = await release.changeOwner(1, purchaser, author, { from: author })
//       result = await contract.methods.confirmPurchase().send({ from: author, value: 200000 })
//       assert.isOk(result.status,"owner has confirmed")

//       //owner calls change owner

//     })

  })
})