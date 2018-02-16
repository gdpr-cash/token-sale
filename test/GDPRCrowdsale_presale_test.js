const GDPRCrowdsale = artifacts.require('./GDPRCrowdsale.sol')
const GDPRCash = artifacts.require('./GDPRCash.sol')

const assertThrows = require('./utils/assertThrows')
const { goal } = require('./utils/common')

contract('GDPRCrowdsale (Pre-sale)', accounts => {
  const YEAR_IN_SECONDS = 31622400
  const now = new Date().getTime() / 1000
  const start = now + YEAR_IN_SECONDS
  const end = start + YEAR_IN_SECONDS

  const owner = accounts[0]

  const [
    buyer3,
    buyer2,
    buyer,
    verifier,
    verifier2,
    notVerifier,
    notOwner
  ] = accounts.slice(3)

  let presaleCrowdsale
  let presaleToken

  before(async () => {
    presaleCrowdsale = await GDPRCrowdsale.new(start, end, goal)
    const token = await presaleCrowdsale.token.call()
    presaleToken = await GDPRCash.at(token)
  })

  it('does not allow end date to be earlier or the same than start date', async () => {
    await assertThrows(GDPRCrowdsale.new(start, start, goal))
  })

  it('deploys successfully in pre-sale mode', async () => {
    assert.isNotNull(presaleCrowdsale)
    assert.isNotNull(presaleToken)
  })

  // Offchain purchases
  it("adds 'pre-commitments' for off-chain contributions, no vesting", async () => {
    const allocation = web3.toWei(5, 'ether') // allocates 5 KEY
    const balance1 = await presaleToken.balanceOf.call(buyer2)

    // test non-timelocked pre-commitment
    await presaleCrowdsale.addPresale(buyer2, allocation, {
      from: owner
    })
    const balance2 = await presaleToken.balanceOf.call(buyer2)
    assert.equal(balance2 - balance1, allocation)
  })

  it('does not allow any contributions before start time', async () => {
    const sender = buyer

    const sendAmount = web3.toWei(1, 'ether')
    await assertThrows(
      presaleCrowdsale.sendTransaction({ from: sender, value: sendAmount })
    )
  })

  it('allows the updating of ETH price before sale starts', async () => {
    // const rate1 = await presaleCrowdsale.rate.call()
    const newEthPrice = 800

    // Set new ETH price and get related attributes
    await presaleCrowdsale.setEthPrice(newEthPrice)
    const rate2 = await presaleCrowdsale.rate.call()
    const keyPrice = await presaleCrowdsale.TOKEN_PRICE_THOUSANDTH.call()

    // Calculate rates and caps to compare
    const expectedRate = parseInt(newEthPrice * 1000 / keyPrice, 10)

    assert.equal(expectedRate, rate2)
  })

  it('does not allow to set an ETH price equal to zero or negative number', async () => {
    assertThrows(presaleCrowdsale.setEthPrice(0))
    assertThrows(presaleCrowdsale.setEthPrice(-999))
  })

  it('can change the start date if sale has not started', async () => {
    const additionalTime = 9
    const beforeStart = await presaleCrowdsale.startTime.call()
    await presaleCrowdsale.setStartTime(beforeStart.toNumber() + additionalTime)
    const laterStart = await presaleCrowdsale.startTime.call()
    assert.equal(laterStart.toNumber(), beforeStart.toNumber() + additionalTime)

    await assertThrows(presaleCrowdsale.setStartTime(now - 999))
    await assertThrows(presaleCrowdsale.setStartTime(end + 1))
  })
})
