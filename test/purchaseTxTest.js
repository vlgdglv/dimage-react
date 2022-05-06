const { assert } = require('chai');

// const Purchase = artifacts.require('./Purchase.sol')
const Purchase = require( '../client/src/abis/Purchase2.json');
const Release = artifacts.require('./Release2.sol')

require('chai').use(require('chai-as-promised')).should()

// contract('Purchase transaction: make first deal test ', ([deployer, purchaser, owner, author, nobody])=>{
//   const gasLimit = 30000000
//   const offer = 2000000000000000;
//   let instance, address;
//   let originPurchaseBalance;
//   let release,releaseAddress;
//   beforeEach(async() => {
//     release = await Release.deployed()
//     releaseAddress = await release.address;
//     await release.uploadImage("as", '0x1234','0xdef',{from: owner})
//     await release.uploadImage("sa", '0x5678','0xabc',{from: owner})
//     //deploy a Purchase instance before every describe
//     //purchaser balance before deployment
//     originPurchaseBalance = BigInt(await web3.eth.getBalance(purchaser))
//     //new an instance and deploy it
//     instance = new web3.eth.Contract(Purchase.abi,{
//       // gasPrice:20000,
//       gasLimit:gasLimit
//     })
//     const result = await instance.deploy({
//       data: Purchase.bytecode,
//       arguments:[releaseAddress, 1, purchaser, owner, owner, 360, "0x1234"],
//     }).send({from:purchaser, value: offer})
//     address = result.options.address
//     //calc deploy contract gas fee
//     const afterB = BigInt(await web3.eth.getBalance(purchaser))
//     deployGasFee = originPurchaseBalance - afterB - BigInt(offer)
//     // console.log("[LOG] deployGasFee = " + deployGasFee)
//   })
//   describe('transactions check:', async() => {
//     it('make first deal', async() => {
//       //before deal
//       const contract = new web3.eth.Contract(Purchase.abi, address)

//       const ownerOldBalance = await web3.eth.getBalance(owner)
//       // const authorOldBalance = await web3.eth.getBalance(author)
//       // console.log("[LOG]ownerOldBalance =  "+ownerOldBalance)
//       // const oldOwner = await release.getImageOwner(1)
//       // console.log("[LOG] purchaser = " + purchaser)
//       // console.log("[LOG] old owner = " + oldOwner)
      
//       //confirm deal
//       const result = await contract.methods.confirmPurchase().send({ from: owner, gasLimit:200000 })
//       // console.log("RESULT ----------------------------------")
//       // console.log(result)
//       //get some deal results 
//       const gasUsed = parseInt(result.gasUsed)
//       const effectiveGasPrice = parseInt(web3.utils.toBN(result.effectiveGasPrice))
//       const GasFee = BigInt(gasUsed * effectiveGasPrice)
//       // console.log("[LOG]effectiveGasPrice = " + egp)

//       // const prevOwn = await release.getPrevOwner(1)
//       // console.log(prevOwn)
//       // const newOwner = await release.getImageOwner(1)
//       // console.log("[LOG] new owner = " + newOwner)
//       //after deal
//       const ownerNewBalance = await web3.eth.getBalance(owner)
//       // console.log("[LOG]ownerNewBalance =  "+ ownerNewBalance)
//       //compare balance before and after deal
//       const ownerShouldBe = BigInt(ownerOldBalance) + BigInt(offer) - GasFee;
//       assert.closeTo(Number(ownerNewBalance),Number(ownerShouldBe), 10e10, "owner gets right")

//       const newOwner = await release.getImageOwner(1)
//       assert.equal(newOwner, purchaser, "Owner updated!")
//     })
//   })

// })

// contract('Purchase transaction: decline purchase test ', ([deployer, purchaser, owner, author, nobody])=>{
//   const gasLimit = 30000000
//   const offer = 2000000000000000;
//   let instance, address;
//   let originPurchaseBalance;
//   let deployGasFee;
//   let release,releaseAddress;

//   beforeEach(async() => {
//     release = await Release.deployed()
//     releaseAddress = await release.address;
//     await release.uploadImage("as", '0x1234','0xdef',{from: owner})
//     await release.uploadImage("sa", '0x5678','0xabc',{from: owner})
//     //deploy a Purchase instance before every describe
//     //purchaser balance before deployment
//     originPurchaseBalance = BigInt(await web3.eth.getBalance(purchaser))
//     //new an instance and deploy it
//     instance = new web3.eth.Contract(Purchase.abi,{
//       // gasPrice:20000,
//       gasLimit:gasLimit
//     })
//     const result = await instance.deploy({
//       data: Purchase.bytecode,
//       arguments:[releaseAddress, 1, purchaser, owner, owner, 360, "0x1234"],
//     }).send({from:purchaser, value: offer})
//     address = result.options.address
//     //calc deploy contract gas fee
//     const afterB = BigInt(await web3.eth.getBalance(purchaser))
//     deployGasFee = originPurchaseBalance - afterB - BigInt(offer)
//     // console.log("[LOG] deployGasFee = " + deployGasFee)
//   })
  
//   describe('transactions check:', async() => {
//     it('decline purchase', async() => {
//       const contract = new web3.eth.Contract(Purchase.abi, address)
//       //before balances
//       const ownerOldBalance = BigInt(await web3.eth.getBalance(owner))
//       const authorOldBalance =Number(await web3.eth.getBalance(author))
//       //decline this purchase by owner
//       const result = await contract.methods.declinePurchase().send({ from: owner, value: 200000 })
//       //decline gas fee, pay by owner (who declines)
//       const gasUsed = parseInt(result.gasUsed)
//       const effectiveGasPrice = parseInt(web3.utils.toBN(result.effectiveGasPrice))
//       const declineGasFee = BigInt(gasUsed * effectiveGasPrice)
//       //after balances
//       const purchaserNewBalance = Number(await web3.eth.getBalance(purchaser))
//       const ownerNewBalance = Number(await web3.eth.getBalance(owner))
//       const authorNewBalance = Number(await web3.eth.getBalance(author))

//       //author should not be affected
//       assert.equal(authorOldBalance,authorNewBalance,"author right")
//       //owner should only lose decline operation gas fee
//       const ownerBalanceShould = Number(BigInt(ownerOldBalance) - declineGasFee)
//       assert.closeTo(ownerNewBalance, ownerBalanceShould, 10e5, "owner get right")
//       //purchaser should only lose Purchase contract deployment gas fee
//       const purchaseBalanceShould = Number(originPurchaseBalance - deployGasFee)
//       assert.closeTo(purchaserNewBalance, purchaseBalanceShould, 10e5, "purchase right")      
//     })
//   })
// })

// contract('Purchase transaction: cancel purchase test', ([deployer, purchaser, owner, author, nobody])=>{
//   const gasLimit = 30000000
//   const offer = 2000000000000000;
//   let instance, address;
//   let originPurchaseBalance;
//   let deployGasFee;
//   let release,releaseAddress;
//   beforeEach(async() => {
//     release = await Release.deployed()
//     releaseAddress = await release.address;
//     await release.uploadImage("as", '0x1234','0xdef',{from: owner})
//     await release.uploadImage("sa", '0x5678','0xabc',{from: owner})
//     //deploy a Purchase instance before every describe
//     //purchaser balance before deployment
//     originPurchaseBalance = BigInt(await web3.eth.getBalance(purchaser))
//     //new an instance and deploy it
//     instance = new web3.eth.Contract(Purchase.abi,{
//       // gasPrice:20000,
//       gasLimit:gasLimit
//     })
//     const result = await instance.deploy({
//       data: Purchase.bytecode,
//       arguments:[releaseAddress, 1, purchaser, owner, owner, 360, "0x1234"],
//     }).send({from:purchaser, value: offer})
//     address = result.options.address
//     //calc deploy contract gas fee
//     const afterB = BigInt(await web3.eth.getBalance(purchaser))
//     deployGasFee = originPurchaseBalance - afterB - BigInt(offer)
//     // console.log("[LOG] deployGasFee = " + deployGasFee)
//   })
//   describe('transactions check:', async() => {
//     it('cancel purchase', async() => {
//       const contract = new web3.eth.Contract(Purchase.abi, address)
//       //before balances
//       const ownerOldBalance = Number(await web3.eth.getBalance(owner))
//       const authorOldBalance =Number(await web3.eth.getBalance(author))
  
//       //cancel purchase by purchaser
//       const result = await contract.methods.cancelPurchase().send({ from: purchaser, value: 200000 })
//       //cancel gas fee, pay by purchaser (who cancels)
//       const gasUsed = parseInt(result.gasUsed)
//       const effectiveGasPrice = parseInt(web3.utils.toBN(result.effectiveGasPrice))
//       const cancelGasFee = BigInt(gasUsed * effectiveGasPrice)

//       //after balances
//       const purchaserNewBalance = Number(await web3.eth.getBalance(purchaser))
//       const ownerNewBalance = Number(await web3.eth.getBalance(owner))
//       const authorNewBalance = Number(await web3.eth.getBalance(author))
      
//       //owner and author should not be affected
//       assert.equal(ownerOldBalance,ownerNewBalance,"author right")  
//       assert.equal(authorOldBalance,authorNewBalance,"author right")
//       //purchaser should only lost deploy and cancel gas fee
//       const purchaseBalanceShould = Number(originPurchaseBalance - deployGasFee - cancelGasFee)
//       assert.closeTo(purchaserNewBalance, purchaseBalanceShould, 10e5, "purchase right")
//     })
//   })
// })

// seems truffle test wouldn't provide enough gas
contract('Purchase transaction: double purchase test', ([purchaser, owner, author, nobody])=>{
  const gasLimit = 30000000
  const offer = 2000000000000000;
  let instance, address;
  let originPurchaseBalance;
  let deployGasFee;
  let release,releaseAddress;
  
  before(async() => {
    release = await Release.deployed()
    releaseAddress = await release.address;
    await release.uploadImage("as", '0x1234','0xdef',{from: owner})
    await release.uploadImage("sa", '0x5678','0xabc',{from: owner})
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
      arguments:[releaseAddress, 1, purchaser, owner, owner, 360, "0x1234"],
    }).send({from:purchaser, value: offer})
    address = result.options.address
    //calc deploy contract gas fee
    const afterB = BigInt(await web3.eth.getBalance(purchaser))
    deployGasFee = originPurchaseBalance - afterB - BigInt(offer)
    // console.log("[LOG] deployGasFee = " + deployGasFee)
  })


  describe('transactions check:', async() => {

    
    it('first deal', async() => {
      //before deal
      let contract,result,gasUsed,effectiveGasPrice,GasFee

      contract = new web3.eth.Contract(Purchase.abi, address)

      const ownerOldBalance = await web3.eth.getBalance(owner)
      // const authorOldBalance = await web3.eth.getBalance(author)
      // console.log("[LOG]ownerOldBalance =  "+ownerOldBalance)
      
      // const oldOwner = await release.getImageOwner(1)
      // console.log("[LOG] purchaser = " + purchaser)
      // console.log("[LOG] old owner = " + oldOwner)
      
      //confirm deal
      result = await contract.methods.confirmPurchase().send({ from: owner ,gasLimit:200000})
      // console.log("RESULT ----------------------------------")
      // console.log(result)
      //get some deal results 
      gasUsed = parseInt(result.gasUsed)
      effectiveGasPrice = parseInt(web3.utils.toBN(result.effectiveGasPrice))
      GasFee = BigInt(gasUsed * effectiveGasPrice)
      // console.log("[LOG]effectiveGasPrice = " + egp)

      // const newOwner = await release.getImageOwner(1)
      // console.log("[LOG] new owner = " + newOwner)
      //after deal
      const ownerNewBalance = await web3.eth.getBalance(owner)
      // console.log("[LOG]ownerNewBalance =  "+ ownerNewBalance)
      //compare balance before and after deal
      const ownerShouldBe = BigInt(ownerOldBalance) + BigInt(offer) - GasFee;
      assert.closeTo(Number(ownerNewBalance),Number(ownerShouldBe), 10e10, "owner gets right")
      const newOwner = await release.getImageOwner(1)
      console.log("[LOG] first deal new owner = " + newOwner)
      assert.equal(newOwner, purchaser, "Owner updated!")
    })

    it('second deal', async() => {
      let newContract,newResult,gasUsed,effectiveGasPrice,GasFee
      // -------------------------------------------------------------------------------------------------------------
      const newOffer = BigInt(100000000000000000n)
      const originNobodyBalance = BigInt(await web3.eth.getBalance(nobody))

      instance = new web3.eth.Contract(Purchase.abi,{
        // gasPrice:20000,
        gasLimit:gasLimit
      })
      newResult = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[releaseAddress, 1, nobody, purchaser, owner ,36000, "0x1234"],
      }).send( {from: nobody, value: Number(newOffer)})
      
      const afterDeployNobodyBalance = BigInt(await web3.eth.getBalance(nobody))
      deployGasFee = originNobodyBalance - afterDeployNobodyBalance - BigInt(newOffer)
      
      const address2 = newResult.options.address
      newContract = new web3.eth.Contract(Purchase.abi, address2)

      const ownerBalanceBeforeTx = BigInt(await web3.eth.getBalance(owner))
      const purchaserBalanceBeforeTx = BigInt(await web3.eth.getBalance(purchaser))

      const ownerBeforeTx = await release.getImageOwner(1)
      assert(ownerBeforeTx, purchaser, "before owner is right")
      console.log("[LOG] ownerBeforeTx = " + ownerBeforeTx)
      console.log("[LOG] purchaser = " + purchaser)
      console.log(await newContract.methods.prevOwners(0).call())

      result = await newContract.methods.confirmPurchase().send({ from: purchaser,gasLimit:210000 })

      gasUsed = BigInt(result.gasUsed)
      effectiveGasPrice = BigInt(web3.utils.toBN(result.effectiveGasPrice))
      GasFee = BigInt(gasUsed * effectiveGasPrice)

      const nobodyBalanceAfterTx = BigInt(await web3.eth.getBalance(nobody))
      const ownerBalanceAfterTx = BigInt(await web3.eth.getBalance(owner))
      const purchaserBalanceAfterTx = BigInt(await web3.eth.getBalance(purchaser))
      // const purchaseBalanceShould = purchaserBalanceBeforeTx - GasFee + newOffer / 10n * 9n;
      // const ownerBalanceShould = ownerBalanceBeforeTx + newOffer / 10n; 
      // assert.closeTo(Number(purchaseBalanceShould.valueOf()), Number(purchaserBalanceAfterTx.valueOf()), "purchaser right again")
      // assert.closeTo(Number(ownerBalanceShould.valueOf()), Number(ownerBalanceAfterTx.valueOf()),"owner right again")
      const ownerAfterTx = await release.getImageOwner(1)
      assert(ownerAfterTx, nobody, "owner updated again")

    })

  })

})