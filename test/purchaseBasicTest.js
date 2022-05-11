const { assert } = require('chai');

const Purchase = require( '../client/src/abis/Purchase.json');
const Release = artifacts.require('./Release.sol')

require('chai').use(require('chai-as-promised')).should()

contract('Purchase basics', ([deployer,purchaser, owner, author, nobody]) => {
  
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
  })
  
  describe('run time deployment',async()=>{
    
    beforeEach(async() => {
      //deploy a Purchase instance before every describe
      //purchaser balance before deployment
      originPurchaseBalance = BigInt(await web3.eth.getBalance(purchaser))
      //new an instance and deploy it
      instance = new web3.eth.Contract(Purchase.abi,{gasLimit:gasLimit})
      // console.log(instance)
      const result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[releaseAddress, 1, purchaser ,3600, "0x1234"],
      }).send({ from:purchaser, value: offer})
      address = result.options.address
      //calc deploy contract gas fee
      const afterB = BigInt(await web3.eth.getBalance(purchaser))
      deployGasFee = originPurchaseBalance - afterB - BigInt(offer)
      // console.log('deploy gas = ' + deployGasFee )
    })

    it('deployment issues', async() => {
      instance = new web3.eth.Contract(Purchase.abi,{
        gasLimit:30000000
      })
      instance.deploy({data: Purchase.bytecode,arguments:[releaseAddress,0,purchaser ,3600, "0x1234"]})
      .send({from:purchaser, value: offer}).should.be.rejected
      instance.deploy({data: Purchase.bytecode,arguments:[releaseAddress,1,purchaser,3, "0x1234"]})
      .send({from:purchaser, value: offer}).should.be.rejected  
      instance.deploy({data: Purchase.bytecode,arguments:[releaseAddress, 1, owner,3600, "0x1234"]})
      .send({from:purchaser, value: offer}).should.be.rejected 
    })
    it('parameters check', async() => {
      const sha3="0x1234000000000000000000000000000000000000000000000000000000000000"
      const contract = new web3.eth.Contract(Purchase.abi, address)
      // console.log("[LOG]deployGasFee = " + Number(deployGasFee))
      assert.equal(await contract.methods.contractRelease().call(), releaseAddress, "release contract right")
      assert.equal(await contract.methods.imageID().call(), 1, "id right")
      assert.equal(await contract.methods.purchaser().call(), purchaser, "purchase right")
      assert.equal(await contract.methods.imageOwner().call(), owner, "owner right")
      assert.equal(await contract.methods.imageAuthor().call(), owner, "author right")
      assert.equal(await contract.methods.SHA3().call(), sha3, "sha3 right")
      assert.equal(await contract.methods.duration().call(), 3600, "duration right")
      assert.equal(await contract.methods.amount().call(), offer, "amount right")
      assert.equal(await contract.methods.isClosed().call(), false, "success flag right")
      // console.log("[LOG] author share = " + await contract.methods.authorShare().call())
      // console.log("[LOG] owner share = " + await contract.methods.ownerShare().call())
      // for(let i=0;i<5;i++) {
      //   console.log("[LOG]" + i+"prev owner share = "+ await contract.methods.prevOwnerShare(i).call())
      // }
    })

    it('gas fee check up', async() => {
      const contract = new web3.eth.Contract(Purchase.abi, address)
      console.log("[LOG] confirmPurchase().estimateGas = " +
        await contract.methods.confirmPurchase().estimateGas({from : owner}))
      console.log("[LOG] declinePurchase().estimateGas = " +
        await contract.methods.declinePurchase().estimateGas({from : owner}))
      console.log("[LOG] cancelPurchase().estimateGas = " +
        await contract.methods.cancelPurchase().estimateGas({from : purchaser}))
    })
  })
})

