const { assert } = require('chai')

const Release = artifacts.require('./Release.sol')

require('chai').use(require('chai-as-promised')).should()

contract('Release',([deployer, author, buyer]) => {
  let release

  // describe('deployment',async () => {
   
  //   before(async () => {
  //     release = await Release.deployed()
  //   })
  
  //   it('deploys successfully', async() => {
  //       const address = await release.address
  //       assert.notEqual(address, 0x0)
  //       assert.notEqual(address, '')
  //       assert.notEqual(address, null)
  //       assert.notEqual(address, undefined)
  //   })

  //   it('has a name', async () => {
  //       const name = await release.contractName()
  //       assert.equal(name, 'release')
  //   })
  // })

  describe('images', async()=>{
    let result, imageCount
    const hash = "Qmshit";
    const sha1 = "0x2639920e41d156997db24182cff89f49e830088c86655aa4fe161cc1e8c1b8a5"
    const sha2 = "0x94cc90c5b07e695df1398288330f919c82bd9dda0835e8e7d8e2ad463a015d88"
    const sign1 = "0x53fc2cf438da5d7ada31a30a79fbdf3670083c1e5e85f6a575d2649183e2bcba20dec72ea45b4abf1fcf3b1bba8213e0becef51cc4be5fe4cb51a2eb77d7bf5d1c";
    const sign2 = "0x53fc2cf438da5d7ada31a30a79fbdf3670083c1e5e85f6a575d2649183e2bcba20dec72ea45b4abf1fcf3b1bba8213e0becef51cc4be5fe4cb51a2eb77d7bf5d1c";
    
    
    before(async () => {
        release = await Release.deployed()
        result = await release.uploadImage(hash, sha1,sign1,{from: author})
        imageCount = await release.imageCount()
        await release.uploadImage(hash, sha2, sign2,{from: author})
    })

    it('create images', async() =>{
        assert.equal(imageCount, 1)
        const event = result.logs[0].args
        assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
        assert.equal(event.ipfsHash, hash, 'Hash is correct')
        assert.equal(event.sha3, sha1, 'sha3 is correct')
        assert.equal(event.signature,sign1, 'signature is correct')
        assert.equal(event.author, author, 'author is correct')   
        assert.equal(event.owner, author, 'owner is correct')   

        await release.uploadImage(hash, sha1, sign1,{from: author}).should.be.rejected
        await release.uploadImage("", sha1,sign1, {from: author}).should.be.rejected
        await release.uploadImage(hash, "",sign1,{from: author}).should.be.rejected
        await release.uploadImage(hash, sha1,"", {from: author}).should.be.rejected
        await release.uploadImage(hash, 'sha3','signature',{from: 0x0}).should.be.rejected
    })
    
    it('change owner', async()=> {
        await release.changeOwner(1, buyer, {from: author})
        const image = await release.images(1)
        assert.equal(image.owner, buyer,'Owner is correct')
        assert.equal(image.author, author,'Author is correct')
        assert.equal(image.sha3,sha1, 'sha3 is correct')
        assert.equal(image.signature,sign1, 'sign is correct')
        await release.changeOwner(3, buyer, author, {from: author}).should.be.rejected
        await release.changeOwner(2, buyer, author, {from: buyer}).should.be.rejected
        await release.changeOwner(2, buyer, buyer,  {from: author}).should.be.rejected
        await release.changeOwner(2, author, author,{from: author}).should.be.rejected
        await release.changeOwner(2, 0x0, author,   {from: author}).should.be.rejected
      })

    it('change signature', async() => {
      await release.changeSign(2,"0xa93283",{from : author})
      const image = await release.images(2)
      assert.equal(image.signature,"0xa93283","sign is correct")
      await release.changeSign(3,"0xa93283", {from : author}).should.be.rejected
      await release.changeSign(2,"", {from : author}).should.be.rejected
      await release.changeSign(3,"0xa93283", {from : buyer}).should.be.rejected
    })

    it('test sha3 match', async() => {
      let result = await release.isSHA3Match(1,sha1)
      // console.log(result)
      assert.equal(result, true)
      result = await release.isSHA3Match(2, sha2)
      assert.equal(result, true)
      // console.log(result)
      result = await release.isSHA3Match(1, sha2)
      assert.equal(result, false)
      // console.log(result)
    })

    it('test txCount', async() => {
      const btxCount = await release.getTxCount(1);
      // console.log(await release.images(1))
      assert.equal(btxCount,0,"before tx count right")   
      const  change =  await release.incTxCount(1, {from:buyer});   
      // console.log(await release.images(1))
      const atxCount = await release.getTxCount(1);    
      // console.log(atxCount)
      assert.equal(atxCount,1,"after tx count right")      
    })
  })
})
