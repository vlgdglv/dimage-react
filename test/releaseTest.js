const { assert } = require('chai')

const Release = artifacts.require('./Release.sol')

require('chai').use(require('chai-as-promised')).should()

contract('Release',([deployer, author, buyer]) => {
  let release

  describe('deployment',async () => {
   
    before(async () => {
      release = await Release.deployed()
    })
  
    it('deploys successfully', async() => {
        const address = await release.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
        const name = await release.contractName()
        assert.equal(name, 'release')
    })
  })

  describe('images', async()=>{
    let result, imageCount
    const hash = 'abc123'
    
    before(async () => {
        result = await release.uploadImage(hash, 'sha3','signature', 'Image title',{from: author})
        imageCount = await release.imageCount()
        await release.uploadImage(hash, 'sha32','signature2', 'Image 2',{from: author})
    })

    it('create images', async() =>{
        assert.equal(imageCount, 1)
        const event = result.logs[0].args
        assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
        assert.equal(event.hash, hash, 'Hash is correct')
        assert.equal(event.sha3, 'sha3', 'sha3 is correct')
        assert.equal(event.signature, 'signature', 'signature is correct')
        assert.equal(event.title, 'Image title', 'title is correct')
        assert.equal(event.author, author, 'author is correct')   
        assert.equal(event.owner, author, 'owner is correct')   
        await release.uploadImage('','sha3', 'signature', 'Title', {from: author}).should.be.rejected
        await release.uploadImage(hash,'' ,'signature', 'Title',{from: author}).should.be.rejected
        await release.uploadImage(hash, 'sha3','', 'Title', {from: author}).should.be.rejected
        await release.uploadImage(hash, 'sha3','signature', '', {from: author}).should.be.rejected
        await release.uploadImage(hash, 'sha3','signature', 'Title', 0x0).should.be.rejected
    })
    
    it('change owner', async()=> {
        await release.changeOwner(1, buyer, {from: author})
        const image = await release.images(1)
        assert.equal(image.owner, buyer,'Owner is correct')
        assert.equal(image.author, author,'Author is correct')
        assert.equal(image.sha3,'sha3', 'sha3 is correct')
        assert.equal(image.signature,'signature', 'sign is correct')
        await release.changeOwner(3, buyer, author, {from: author}).should.be.rejected
        await release.changeOwner(2, buyer, author, {from: buyer}).should.be.rejected
        await release.changeOwner(2, buyer, buyer,  {from: author}).should.be.rejected
        await release.changeOwner(2, author, author,{from: author}).should.be.rejected
        await release.changeOwner(2, 0x0, author,   {from: author}).should.be.rejected
      })

    it('change signature', async() => {
      await release.changeSign(2,"newSign",{from : author})
      const image = await release.images(2)
      assert.equal(image.signature,"newSign","sign is correct")
      await release.changeSign(3,"newSign", {from : author}).should.be.rejected
      await release.changeSign(2,"", {from : author}).should.be.rejected
      await release.changeSign(3,"newSign", {from : buyer}).should.be.rejected
    })

    it('test sha3 match', async() => {
      let result = await release.isSHA3Match(1, "sha3")
      console.log(result)
      result = await release.isSHA3Match(2, "sha32")
      console.log(result)
    })
  })
})
