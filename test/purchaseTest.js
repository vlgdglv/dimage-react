const { assert } = require('chai');

// const Purchase = artifacts.require('./Purchase.sol')
const Purchase = require( '../client/src/abis/Purchase.json');

require('chai').use(require('chai-as-promised')).should()

contract('Purchase', ([purchaser, owner, author, nobody]) => {
  let instance;
  let address;
  const offer = 2000000000000000;
  const sha3 = "this is sha3";
  
  beforeEach(async() => {
    //deploy a Purchase instance before every describe
    instance = new web3.eth.Contract(Purchase.abi,{
      gasLimit:2000000
    })
    const result = await instance.deploy({
      data: Purchase.bytecode,
      arguments:[purchaser, owner, author, sha3 ,360],
    }).send({from:purchaser, value: offer})
    address = result.options.address
    // console.log("[LOG]Address = "+ result.options.address)
  })

  describe('run time deployment',async()=>{
    it('deployment issues', async() => {
      instance = new web3.eth.Contract(Purchase.abi,{
        gasLimit:2000000
      })
      // instance.deploy({data: Purchase.bytecode,arguments:[0, owner, author, sha3 ,360]})
      //   .send({from:purchaser, value: offer}).should.be.rejected
      // instance.deploy({data: Purchase.bytecode,arguments:[purchaser, 0, author, sha3 ,360]})
      //   .send({from:purchaser, value: offer}).should.be.rejected
      // instance.deploy({data: Purchase.bytecode,arguments:[purchaser, owner, 0, sha3 ,360]})
      //   .send({from:purchaser, value: offer}).should.be.rejected
      instance.deploy({data: Purchase.bytecode,arguments:[purchaser, owner, author, "" ,360]})
        .send({from:purchaser, value: offer}).should.be.rejected
      instance.deploy({data: Purchase.bytecode,arguments:[purchaser, owner, author, sha3 ,3]})
        .send({from:purchaser, value: offer}).should.be.rejected  
    })

    it('parameters check', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      assert.equal(await contract.methods.checkerPurchaser().call(), purchaser, "purchase right")
      assert.equal(await contract.methods.checkerOwner().call(), owner, "owner right")
      assert.equal(await contract.methods.checkerAuthor().call(), author, "author right")
      assert.equal(await contract.methods.checkerSHA3().call(), sha3, "sha3 right")
      assert.equal(await contract.methods.checkerDuration().call(), 360, "duration right")
      assert.equal(await contract.methods.checkerAmount().call(), offer, "amount right")
      assert.equal(await contract.methods.checkerSuccess().call(), false, "success flag right")
      console.log("[LOG]End time = " + await contract.methods.checkerEndTime().call())  
      console.log("[LOG]Launch time = " + await contract.methods.checkerLaunchTime().call())
      console.log("[LOG]Owner Share = " + await contract.methods.checkerOwnerShare().call())
      console.log("[LOG]Author Share = " + await contract.methods.checkerAuthorShare().call())
    })
  })

  describe('transactions check', async() => {
    it('make a normal deal', async() => {
      //before deal
      const contract = new web3.eth.Contract(Purchase.abi, address)
      const ownerOldBalance = await web3.eth.getBalance(owner)
      const authorOldBalance = await web3.eth.getBalance(author)
      // console.log("[LOG]ownerOldBalance =  "+ownerOldBalance)
      // console.log("[LOG]authorOldBalance = "+authorOldBalance)
      //confirm deal
      const result = await contract.methods.confirmPurchase().send({ from: owner, value: 200000 })
      //get some deal results 
      const egp = web3.utils.toBN(result.effectiveGasPrice)
      const gasUsed = web3.utils.toBN(result.gasUsed)
      // console.log("[LOG]effectiveGasPrice = " + egp)
      //after deal
      const ownerNewBalance = await web3.eth.getBalance(owner)
      const authorNewBalance = await web3.eth.getBalance(author)
      // console.log("[LOG]ownerNewBalance =  "+ ownerNewBalance)
      // console.log("[LOG]authorNewBalance = "+ authorNewBalance)
      //compare balance before and after deal
      const ownerShouldBe = parseInt(ownerOldBalance) + offer / 10 * 9 - egp * gasUsed;
      const authorShouldBe = parseInt(authorOldBalance) + offer / 10;
      assert.closeTo(Number(ownerNewBalance),Number(ownerShouldBe), 10e10, "owner gets right")
      assert.equal(authorNewBalance, authorShouldBe, "author gets right")
    })

    it('malicious purchaser or third-party calls confirmPurchase()', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      contract.methods.confirmPurchase().send({ from: purchaser, value: 200000 }).should.be.rejected
      contract.methods.confirmPurchase().send({ from: nobody, value: 200000 }).should.be.rejected
      contract.methods.confirmPurchase().send({ from: author, value: 200000 }).should.be.rejected
    })

    it('re-call confirmPurchase() after it has been confirmed', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      await contract.methods.confirmPurchase().send({ from: owner, value: 200000 })
      console.log("[LOG] confirmPurchase() has been called")
      await contract.methods.confirmPurchase().send({ from: owner, value: 200000 }).should.be.rejected
    })

    it('try to confirm an expired purchase', async() => {
      const result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[purchaser, owner, author, sha3 ,16],
      }).send({from:purchaser, value: offer})
      const contract = new web3.eth.Contract(Purchase.abi, address)
      
      console.log("[LOG]18s start, expire time:" + await contract.methods.checkerEndTime().call())
      await new Promise(resolve => setTimeout(resolve,25000 )).then(async()=>{
        console.log("[LOG]18s end, now at:" + new Date().valueOf())
        console.log("[LOG] block.timestamp:" + await contract.methods.checkerTmSp().call())
        await contract.methods.confirmPurchase().send({ from: owner, value: 200000 }).should.be.rejected
      })
    })
    
  })

  
})
