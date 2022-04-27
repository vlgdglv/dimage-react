const { assert } = require('chai');

// const Purchase = artifacts.require('./Purchase.sol')
const Purchase = require( '../client/src/abis/Purchase.json');
const Release = artifacts.require('./Release.sol')

require('chai').use(require('chai-as-promised')).should()

contract('Purchase confirmPurchase() safety tests', ([deployer,purchaser, owner, author, nobody]) => {
  const gasLimit = 30000000
  const offer = 2000000000000000;
  let instance, address, release, releaseAddress;

  beforeEach(async() => {
    release = await Release.deployed()
    releaseAddress = await release.address;
    await release.uploadImage("as", 'sha3','signature from author', 'Image title',{from: owner})
    await release.uploadImage("sa", '3ahs','erutangis from author', 'Egami eltit',{from: owner})
    //deploy a Purchase instance before every describe
    //purchaser balance before deployment
    instance = new web3.eth.Contract(Purchase.abi,{gasLimit:gasLimit} )
    const result = await instance.deploy({
      data: Purchase.bytecode,
      arguments:[releaseAddress, 1, purchaser, owner, owner ,360],
    }).send({from:purchaser, value: offer})
    address = result.options.address
    //calc deploy contract gas fee
  })

  describe('illegal confirmPurchase() operations', async() => {

    it('malicious purchaser or third-party calls confirmPurchase()', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      await contract.methods.confirmPurchase().send({ from: purchaser}).should.be.rejected
      await contract.methods.confirmPurchase().send({ from: nobody   }).should.be.rejected
      await contract.methods.confirmPurchase().send({ from: author   }).should.be.rejected
    })

    it('re-call confirmPurchase() after it has been confirmed', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      await contract.methods.confirmPurchase().send({ from: owner })
      await contract.methods.confirmPurchase().send({ from: owner }).should.be.rejected
    })
  })
})

contract('Purchase declinePurchase() safety tests', ([deployer,purchaser, owner, author, nobody]) => {
  const gasLimit = 30000000
  const offer = 2000000000000000;
  let instance, address, release, releaseAddress;

  beforeEach(async() => {
    release = await Release.deployed()
    releaseAddress = await release.address;
    await release.uploadImage("as", 'sha3','signature from author', 'Image title',{from: owner})
    await release.uploadImage("sa", '3ahs','erutangis from author', 'Egami eltit',{from: owner})
    //deploy a Purchase instance before every describe
    //purchaser balance before deployment
    instance = new web3.eth.Contract(Purchase.abi,{gasLimit:gasLimit} )
    const result = await instance.deploy({
      data: Purchase.bytecode,
      arguments:[releaseAddress, 1, purchaser, owner, owner ,360],
    }).send({from:purchaser, value: offer})
    address = result.options.address
    //calc deploy contract gas fee
  })

  describe('illegal declinePurchase() operations:', async() => {

    it('malicious third-party calls declinePurchase()', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      await contract.methods.declinePurchase().send({ from: purchaser, value: 200000 }).should.be.rejected
      await contract.methods.declinePurchase().send({ from: nobody, value: 200000 }).should.be.rejected
      await contract.methods.declinePurchase().send({ from: author, value: 200000 }).should.be.rejected
    })

    it('re-call declinePurchase() after it has been confirmed', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      await contract.methods.confirmPurchase().send({ from: owner, })
      await contract.methods.declinePurchase().send({ from: owner, }).should.be.rejected
    })
  })
})

contract('Purchase cancelPurchase() safety tests', ([deployer,purchaser, owner, author, nobody]) => {
  const gasLimit = 30000000
  const offer = 2000000000000000;
  let instance, address, release, releaseAddress;
  beforeEach(async() => {
    release = await Release.deployed()
    releaseAddress = await release.address;
    await release.uploadImage("as", 'sha3','signature from author', 'Image title',{from: owner})
    await release.uploadImage("sa", '3ahs','erutangis from author', 'Egami eltit',{from: owner})
    //deploy a Purchase instance before every describe
    //purchaser balance before deployment
    instance = new web3.eth.Contract(Purchase.abi,{gasLimit:gasLimit} )
    const result = await instance.deploy({
      data: Purchase.bytecode,
      arguments:[releaseAddress, 1, purchaser, owner, owner ,360],
    }).send({from:purchaser, value: offer})
    address = result.options.address
  })

  describe('illegal cancelPurchase() operations:', async() => {

    it('malicious third-party calls cancelPurchase()', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      await contract.methods.cancelPurchase().send({ from: owner, value: 200000 }).should.be.rejected
      await contract.methods.cancelPurchase().send({ from: nobody, value: 200000 }).should.be.rejected
      await contract.methods.cancelPurchase().send({ from: author, value: 200000 }).should.be.rejected
    })

    it('re-call cancelPurchase() after it has been confirmed', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      await contract.methods.confirmPurchase().send({ from: owner })
      await contract.methods.cancelPurchase().send({ from: purchaser }).should.be.rejected
    })
  
  })
})

contract('time expired tests', ([deployer,purchaser, owner, author, nobody]) => {
  const gasLimit = 30000000
  const offer = 2000000000000000;
  let instance, address, release;

  beforeEach(async() => {
    release = await Release.deployed()
    releaseAddress = await release.address;
    await release.uploadImage("as", 'sha3','signature from author', 'Image title',{from: owner})
    await release.uploadImage("sa", '3ahs','erutangis from author', 'Egami eltit',{from: owner})
    //deploy a Purchase instance before every describe
    //purchaser balance before deployment
    instance = new web3.eth.Contract(Purchase.abi,{gasLimit:gasLimit} )
    const result = await instance.deploy({
      data: Purchase.bytecode,
      arguments:[releaseAddress, 1, purchaser, owner, owner ,360],
    }).send({from:purchaser, value: offer})
    address = result.options.address
    //calc deploy contract gas fee
  })
    
  describe('confirm and decline should be rejected', async() => {
      //  this test takes long time
    it('try to confirm or decline an expired purchase', async() => {
      const result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[releaseAddress, 1, purchaser, owner, owner, 16],
      }).send({from:purchaser, value: offer})
      const contract = new web3.eth.Contract(Purchase.abi, result.options.address)
      // console.log("[LOG]launch time:" + await contract.methods.checkerLaunchTime().call())
      // console.log("[LOG]18s start, expire time:" + await contract.methods.checkerEndTime().call())
      await new Promise(resolve => setTimeout(resolve,25000 )).then(async()=>{
        // console.log("[LOG]18s end, now at:" + new Date().valueOf())
        // console.log("[LOG]block.timestamp:" + await contract.methods.checkerTmSp().call())
        await contract.methods.confirmPurchase().send({ from: owner }).should.be.rejected
        await contract.methods.declinePurchase().send({ from: owner }).should.be.rejected
      })
    })
  })

  describe('cancel still available', async() => {
    //  this test takes long time
    it('cancel a expired contract to retrieve ether', async() => {
      const result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[releaseAddress, 1, purchaser, owner, owner, 16],
      }).send({from:purchaser, value: offer})
      const contract = new web3.eth.Contract(Purchase.abi, result.options.address)
      
      // console.log("[LOG]launch time:" + await contract.methods.checkerLaunchTime().call())
      // console.log("[LOG]18s start, expire time:" + await contract.methods.checkerEndTime().call())
      await new Promise(resolve => setTimeout(resolve,25000 )).then(async()=>{
        // console.log("[LOG]18s end, now at:" + new Date().valueOf())
        // console.log("[LOG]block.timestamp:" + await contract.methods.checkerTmSp().call())
        const beforeBalance = await web3.eth.getBalance(purchaser)

        const result = await contract.methods.cancelPurchase().send({ from: purchaser }).should.be.fulfilled
        const gasUsed = parseInt(result.gasUsed)
        const effectiveGasPrice = parseInt(web3.utils.toBN(result.effectiveGasPrice))
        const GasFee = BigInt(gasUsed * effectiveGasPrice)
        
        const afterBalance = await web3.eth.getBalance(purchaser)
        const balanceShould = BigInt(beforeBalance) + BigInt(offer) - GasFee;

        assert.equal(afterBalance, balanceShould, "purchase get money back")

      })
    })
  })
})