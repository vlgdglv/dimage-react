const { assert } = require('chai')

const Verification = artifacts.require('./Verification.sol')

require('chai').use(require('chai-as-promised')).should()


contract('Verification',([deployer])=>{
  let ver

  before(async() => {
      ver = await Verification.deployed()
  })
  describe('deployment',async () => {
    it('deploys successfully', async() => {
      const address = await ver.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await ver.contractName()
      assert.equal(name, 'Verification')
    })
  })
    
  describe('verify',async()=>{
    it('recover a signature',async() =>{
      const message = "0x94cc90c5b07e695df1398288330f919c82bd9dda0835e8e7d8e2ad463a015d88"
      const signature = "0xc9cc22876784e142e7673324ece9421a01d03de4bbd3aec07b4233313a9c07f168ecc7fd47cec2cf9f1f4fd76794d1ec5230a1a63e5184449fc38c3ec19ec0431b"
      var signer = await ver.verify(message,signature)
      assert.equal(signer,"0x9Af1EBDB4Bfba3f1f9DCECB8cD204b3eFda673Ee")
      console.log(signer)
    })
  })
})
