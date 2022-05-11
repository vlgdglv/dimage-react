const { assert } = require('chai');

// const Purchase = artifacts.require('./Purchase.sol')
const Purchase = require( '../client/src/abis/Purchase.json');
const Release = artifacts.require('./Release.sol')

require('chai').use(require('chai-as-promised')).should()

contract('Purchase transaction: consecutive purchase test', ([owner,buyer1,buyer2,buyer3,buyer4,buyer5,buyer6,buyer7,buyer8,buyer9])=>{

  const gasLimit = 30000000
  const offer = 1000000000000000;
  let instance, address;
  let originPurchaseBalance;
  let deployGasFee;
  let release,releaseAddress;

  describe('profit test', async() => {
    before(async() => {
      release = await Release.deployed()
      releaseAddress = await release.address;
      await release.uploadImage("as", '0x1234','0xdef',{from: owner})
      await release.uploadImage("sa", '0x5678','0xabc',{from: owner})
      // console.log("release addr = " + releaseAddress)
    })  
    it('No.1 tx', async() => {
      instance = new web3.eth.Contract(Purchase.abi,{
        gasLimit:gasLimit,
      })
      // console.log(instance)
      let result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[releaseAddress, 1, buyer1 ,3600, "0x1234"],
      }).send({ from:buyer1, value: offer})
      // console.log(result.options.data)
      address = result.options.address
      let contract = new web3.eth.Contract(Purchase.abi, address)
      for(let i=0;i<5;i++) {
        // console.log("PO"+i+" = "+await contract.methods.prevOwners(i).call())
      }
      // console.log(await release.images(1))
      result = await contract.methods.confirmPurchase().send({ from: owner ,gasLimit:250000})
      assert.equal(await release.getImageOwner(1), buyer1,"owner right!")
    })
    it('No.2 tx', async() => {
      instance = new web3.eth.Contract(Purchase.abi,{
        gasLimit:gasLimit,
      })
      // console.log(instance)
      let result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[releaseAddress, 1, buyer2,3600, "0x1234"],
      }).send({ from:buyer2, value: offer})
      // console.log(result.options.data)
      address = result.options.address
      let contract = new web3.eth.Contract(Purchase.abi, address)
      for(let i=0;i<5;i++) {
        // console.log("PO"+i+" = "+await contract.methods.prevOwners(i).call())
      }
      result = await contract.methods.confirmPurchase().send({ from: buyer1 ,gasLimit:250000})
    })
    it('No.3 tx', async() => {
      instance = new web3.eth.Contract(Purchase.abi,{
        gasLimit:gasLimit,
      })
      // console.log(instance)
      let result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[releaseAddress, 1, buyer3 ,3600, "0x1234"],
      }).send({ from:buyer3, value: offer})
      // console.log(result.options.data)
      address = result.options.address
      let contract = new web3.eth.Contract(Purchase.abi, address)
      for(let i=0;i<5;i++) {
        // console.log("PO"+i+" = "+await contract.methods.prevOwners(i).call())
      }
      result = await contract.methods.confirmPurchase().send({ from: buyer2 ,gasLimit:250000})
    })
    it('No.4 tx', async() => {
      instance = new web3.eth.Contract(Purchase.abi,{
        gasLimit:gasLimit,
      })
      // console.log(instance)
      let result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[releaseAddress, 1, buyer4 ,3600, "0x1234"],
      }).send({ from:buyer4, value: offer})
      // console.log(result.options.data)
      address = result.options.address
      let contract = new web3.eth.Contract(Purchase.abi, address)
      for(let i=0;i<5;i++) {
        // console.log("PO"+i+" = "+await contract.methods.prevOwners(i).call())
      }
      result = await contract.methods.confirmPurchase().send({ from: buyer3 ,gasLimit:250000})
    })
    it('No.5 tx', async() => {
      instance = new web3.eth.Contract(Purchase.abi,{
        gasLimit:gasLimit,
      })
      // console.log(instance)
      let result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[releaseAddress, 1, buyer5, 3600, "0x1234"],
      }).send({ from:buyer5, value: offer})
      // console.log(result.options.data)
      address = result.options.address
      let contract = new web3.eth.Contract(Purchase.abi, address)
      for(let i=0;i<5;i++) {
        // console.log("PO"+i+" = "+await contract.methods.prevOwners(i).call())
      }
      result = await contract.methods.confirmPurchase().send({ from: buyer4 ,gasLimit:250000})
    })
    it('No.6 tx', async() => {
      instance = new web3.eth.Contract(Purchase.abi,{
        gasLimit:gasLimit,
      })
      // console.log(instance)
      let result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[releaseAddress, 1, buyer6 ,3600, "0x1234"],
      }).send({ from:buyer6, value: offer})
      // console.log(result.options.data)
      address = result.options.address
      let contract = new web3.eth.Contract(Purchase.abi, address)
      for(let i=0;i<5;i++) {
        // console.log("PO"+i+" = "+await contract.methods.prevOwners(i).call())
      }
      result = await contract.methods.confirmPurchase().send({ from: buyer5 ,gasLimit:300000})
    })
    it('No.7 tx', async() => {
      instance = new web3.eth.Contract(Purchase.abi,{
        gasLimit:gasLimit,
      })
      // console.log(instance)
      let result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[releaseAddress, 1, buyer7, 3600, "0x1234"],
      }).send({ from:buyer7, value: offer})
      // console.log(result.options.data)
      address = result.options.address
      let contract = new web3.eth.Contract(Purchase.abi, address)
      for(let i=0;i<5;i++) {
        // console.log("PO"+i+" = "+await contract.methods.prevOwners(i).call())
      }
      result = await contract.methods.confirmPurchase().send({ from: buyer6 ,gasLimit:300000})
    })
    it('No.8 tx', async() => {
      instance = new web3.eth.Contract(Purchase.abi,{
        gasLimit:gasLimit,
      })
      // console.log(instance)
      let result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[releaseAddress, 1, buyer8 ,3600, "0x1234"],
      }).send({ from:buyer8, value: offer})
      // console.log(result.options.data)
      address = result.options.address
      let contract = new web3.eth.Contract(Purchase.abi, address)
      for(let i=0;i<5;i++) {
        // console.log("PO"+i+" = "+await contract.methods.prevOwners(i).call())
      }
      result = await contract.methods.confirmPurchase().send({ from: buyer7 ,gasLimit:300000})
    })
    it('No.9 tx', async() => {
      instance = new web3.eth.Contract(Purchase.abi,{
        gasLimit:gasLimit,
      })
      // console.log(instance)
      let result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[releaseAddress, 1, buyer9, 3600, "0x1234"],
      }).send({ from:buyer9, value: offer})
      // console.log(result.options.data)
      address = result.options.address
      let contract = new web3.eth.Contract(Purchase.abi, address)
      for(let i=0;i<5;i++) {
        // console.log("PO"+i+" = "+await contract.methods.prevOwners(i).call())
      }
      result = await contract.methods.confirmPurchase().send({ from: buyer8 ,gasLimit:350000})
    })
    it('No.10 tx', async() => {
      instance = new web3.eth.Contract(Purchase.abi,{
        gasLimit:gasLimit,
      })
      // console.log(instance)
      let result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[releaseAddress, 1, buyer1, 3600, "0x1234"],
      }).send({ from:buyer1, value: offer})
      // console.log(result.options.data)
      address = result.options.address
      let contract = new web3.eth.Contract(Purchase.abi, address)
      for(let i=0;i<5;i++) {
        // console.log("PO"+i+" = "+await contract.methods.prevOwners(i).call())
      }
      result = await contract.methods.confirmPurchase().send({ from: buyer9 ,gasLimit:350000})
      // console.log("tx 10 author reward:" + await contract.methods.authorShare().call())
    })
    it('No.11 tx', async() => {
      instance = new web3.eth.Contract(Purchase.abi,{
        gasLimit:gasLimit,
      })
      // console.log(instance)
      let result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[releaseAddress, 1, buyer2 ,3600, "0x1234"],
      }).send({ from:buyer2, value: offer})
      // console.log(result.options.data)
      address = result.options.address
      let contract = new web3.eth.Contract(Purchase.abi, address)
      for(let i=0;i<5;i++) {
        // console.log("PO"+i+" = "+await contract.methods.prevOwners(i).call())
      }
      result = await contract.methods.confirmPurchase().send({ from: buyer1 ,gasLimit:350000})
    })
    it('No.12 tx', async() => {
      instance = new web3.eth.Contract(Purchase.abi,{
        gasLimit:gasLimit,
      })
      // console.log(instance)
      let result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[releaseAddress, 1, buyer3 ,3600, "0x1234"],
      }).send({ from:buyer3, value: offer})
      // console.log(result.options.data)
      address = result.options.address
      let contract = new web3.eth.Contract(Purchase.abi, address)
      for(let i=0;i<5;i++) {
        // console.log("PO"+i+" = "+await contract.methods.prevOwners(i).call())
      }
      result = await contract.methods.confirmPurchase().send({ from: buyer2 ,gasLimit:350000})
    })
    it('final check', async() => {
      instance = new web3.eth.Contract(Purchase.abi,{
        gasLimit:gasLimit,
      })
      // console.log(instance)
      const ob  = await web3.eth.getBalance(owner)
      const by4 = await web3.eth.getBalance(buyer4)
      const by3 = await web3.eth.getBalance(buyer3)
      const by2 = await web3.eth.getBalance(buyer2)
      const by1 = await web3.eth.getBalance(buyer1)
      const by9 = await web3.eth.getBalance(buyer9)
      const by8 = await web3.eth.getBalance(buyer8)
      const by7 = await web3.eth.getBalance(buyer7)

      let result = await instance.deploy({
        data: Purchase.bytecode,
        arguments:[releaseAddress, 1, buyer4 ,3600, "0x1234"],
      }).send({ from:buyer4, value: offer})

      const by4ad = await web3.eth.getBalance(buyer4)

      address = result.options.address
      let contract = new web3.eth.Contract(Purchase.abi, address)
      for(let i=0;i<5;i++) {
        // console.log("PO"+i+" = "+await contract.methods.prevOwners(i).call())
      }


      result = await contract.methods.confirmPurchase().send({ from: buyer3 ,gasLimit:350000})
      gasUsed = parseInt(result.gasUsed)
      effectiveGasPrice = parseInt(web3.utils.toBN(result.effectiveGasPrice))
      GasFee = BigInt(gasUsed * effectiveGasPrice)

      const oa   = await web3.eth.getBalance(owner)
      const by4a = await web3.eth.getBalance(buyer4)
      const by3a = await web3.eth.getBalance(buyer3)
      const by2a = await web3.eth.getBalance(buyer2)
      const by1a = await web3.eth.getBalance(buyer1)
      const by9a = await web3.eth.getBalance(buyer9)
      const by8a = await web3.eth.getBalance(buyer8)
      const by7a = await web3.eth.getBalance(buyer7)

      console.log("Author      profit:" + (BigInt(oa)-BigInt(ob)))
      console.log("prev Owner1 profit:" + (BigInt(by7a)-BigInt(by7)))
      console.log("prev Owner2 profit:" + (BigInt(by8a)-BigInt(by8)))
      console.log("prev Owner3 profit:" + (BigInt(by9a)-BigInt(by9)))
      console.log("prev Owner4 profit:" + (BigInt(by1a)-BigInt(by1)))
      console.log("prev Owner5 profit:" + (BigInt(by2a)-BigInt(by2)))
      
      let ownerD = BigInt(by3a)-BigInt(by3)
      console.log("Owner's     profit:" + ownerD)
      console.log("confirm  gas  used:" + GasFee)
      console.log("Onwer eth received:" + (ownerD + GasFee))

      // console.log("Buyer4 begin:" + by4)
      // console.log("Buyer4 after deploy:" + by4ad)
      // console.log("Buyer4 after all:" + by4a)

    })
  })
})
