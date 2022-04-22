const { assert } = require('chai')

const Release = artifacts.require('./Release.sol')
const Verification = artifacts.require('./Verification.sol')
// const Purchase = artifacts.require('./Purchase.sol')

require('chai').use(require('chai-as-promised')).should()

//done!
// contract('Release',([deployer, author, buyer]) => {
//   let release

//   describe('deployment',async () => {
   
//     before(async () => {
//       release = await Release.deployed()
//     })
  
//     it('deploys successfully', async() => {
//         const address = await release.address
//         assert.notEqual(address, 0x0)
//         assert.notEqual(address, '')
//         assert.notEqual(address, null)
//         assert.notEqual(address, undefined)
//     })

//     it('has a name', async () => {
//         const name = await release.contractName()
//         assert.equal(name, 'release')
//     })
//   })

//   describe('images', async()=>{
//     let result, imageCount
//     const hash = 'abc123'
    
//     before(async () => {
//         result = await release.uploadImage(hash, 'sha3','signature', 'Image title',{from: author})
//         imageCount = await release.imageCount()
//         await release.uploadImage(hash, 'sha32','signature2', 'Image 2',{from: author})
//     })

//     it('create images', async() =>{
//         assert.equal(imageCount, 1)
//         const event = result.logs[0].args
//         assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
//         assert.equal(event.hash, hash, 'Hash is correct')
//         assert.equal(event.sha3, 'sha3', 'sha3 is correct')
//         assert.equal(event.signature, 'signature', 'signature is correct')
//         assert.equal(event.title, 'Image title', 'title is correct')
//         assert.equal(event.author, author, 'author is correct')   
//         assert.equal(event.owner, author, 'owner is correct')   
//         await release.uploadImage('','sha3', 'signature', 'Title', {from: author}).should.be.rejected
//         await release.uploadImage(hash,'' ,'signature', 'Title',{from: author}).should.be.rejected
//         await release.uploadImage(hash, 'sha3','', 'Title', {from: author}).should.be.rejected
//         await release.uploadImage(hash, 'sha3','signature', '', {from: author}).should.be.rejected
//         await release.uploadImage(hash, 'sha3','signature', 'Title', 0x0).should.be.rejected
//     })
    
//     it('change owner', async()=> {
//         await release.changeOwner(1, buyer, author, {from: author})
//         const image = await release.images(1)
//         assert.equal(image.owner, buyer,'Owner is correct')
//         assert.equal(image.author, author,'Author is correct')
//         assert.equal(image.sha3,'sha3', 'sha3 is correct')
//         assert.equal(image.signature,'signature', 'sign is correct')
//         await release.changeOwner(3, buyer, author, {from: author}).should.be.rejected
//         await release.changeOwner(2, buyer, author, {from: buyer}).should.be.rejected
//         await release.changeOwner(2, buyer, buyer,  {from: author}).should.be.rejected
//         await release.changeOwner(2, author, author,{from: author}).should.be.rejected
//         await release.changeOwner(2, 0x0, author,   {from: author}).should.be.rejected
//       })

//     it('change signature', async() => {
//       await release.changeSign(2,"newSign",{from : author})
//       const image = await release.images(2)
//       assert.equal(image.signature,"newSign","sign is correct")
//       await release.changeSign(3,"newSign", {from : author}).should.be.rejected
//       await release.changeSign(2,"", {from : author}).should.be.rejected
//       await release.changeSign(3,"newSign", {from : buyer}).should.be.rejected
//     })
//   })
// })

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


// contract('Purchase', ([deployer, buyer]) => {
//     var contract

//     before(async() => {
//         // contract = Purchase.new([deployer,buyer,3600])
        
//     })
    
    
//     describe('run time deployment',async()=>{
//         it('deploys successfully' ,async()=>{
//             deployer.deploy(Purchase, buyer, 0, 3600);
//             contract = await Purchase.deployed()
//             const address = await contract.address
//             console.log("Deploy Address:"+address)
//         })
//     })
// })
 
// contract('Verification',([deployer])=>{
//     let ver

//     before(async() => {
//         ver = await Verification.deployed()
//     })
//     describe('deployment',async () => {
//         it('deploys successfully', async() => {
//             const address = await ver.address
//             assert.notEqual(address, 0x0)
//             assert.notEqual(address, '')
//             assert.notEqual(address, null)
//             assert.notEqual(address, undefined)
//         })

//         it('has a name', async () => {
//             const name = await ver.contractName()
//             assert.equal(name, 'Verification')
//         })
//     })
    
//     describe('verify',async()=>{
//         it('recover a signature',async() =>{
//             const message = "0x94cc90c5b07e695df1398288330f919c82bd9dda0835e8e7d8e2ad463a015d88"
//             const signature = "0xc9cc22876784e142e7673324ece9421a01d03de4bbd3aec07b4233313a9c07f168ecc7fd47cec2cf9f1f4fd76794d1ec5230a1a63e5184449fc38c3ec19ec0431b"
//             var signer = await ver.verify(message,signature)
//             assert.equal(signer,"0x9Af1EBDB4Bfba3f1f9DCECB8cD204b3eFda673Ee")
//             console.log(signer)
//         })
//     })
// })

// describe('images', async()=>{
//     let result, imageCount
//     const hash = 'abc123'

//     before(async () => {
//         result = await release.uploarelease(hash, 'Image description', {from: author})
//         imageCount = await release.imageCount()
//     })

//     it('create images', async() =>{
//         assert.equal(imageCount, 1)
//         const event = result.logs[0].args
//         assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
//         assert.equal(event.hash, hash, 'Hash is correct')
//         assert.equal(event.description, 'Image description', 'description is correct')
//         assert.equal(event.tipAmount, '0', 'tip amount is correct')
//         assert.equal(event.author, author, 'author is correct')   
//         await release.uploarelease('', 'Image description', {from: author}).should.be.rejected
//         await release.uploarelease(hash, '', {from: author}).should.be.rejected
//         await release.uploarelease(hash, 'Image description', 0x0).should.be.rejected
//     })

//     it('list images', async() => {
//         const image = await release.images(imageCount)
//         assert.equal(image.id.toNumber(), imageCount.toNumber(), 'id is correct')
//         assert.equal(image.hash, hash, 'Hash is correct')
//         assert.equal(image.description, 'Image description', 'description is correct')
//         assert.equal(image.tipAmount, '0', 'tip amount is correct')
//         assert.equal(image.author, author, 'author is correct')
//     })

//     it('allows users to tip images', async() => {
//         let oldAuthorBalance
//         oldAuthorBalance = await web3.eth.getBalance(author)
//         oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)
        
//         result = await release.tipImageOwner(imageCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })
        
//         const event = result.logs[0].args
//         assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
//         assert.equal(event.hash, hash, 'Hash is correct')
//         assert.equal(event.description, 'Image description', 'description is correct')
//         assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
//         assert.equal(event.author, author, 'author is correct')

//         let newAuthorBalance
//         newAuthorBalance = await web3.eth.getBalance(author)
//         newAuthorBalance = new web3.utils.BN(newAuthorBalance)

//         let tipImageOwner
//         tipImageOwner = web3.utils.toWei('1', 'Ether')
//         tipImageOwner = new web3.utils.BN(tipImageOwner)

//         const expectedBalance = oldAuthorBalance.add(tipImageOwner)

//         assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

//         await release.tipImageOwner(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;    
//     })
// })