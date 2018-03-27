const GdprCrowdsale = artifacts.require('./GdprCrowdsale.sol')
const GdprCash = artifacts.require('./GdprCash.sol')

const assertThrows = require('./utils/assertThrows')
const timeTravel = require('./utils/timeTravel')

contract('GdprPresale', accounts => {
    const now = new Date().getTime() / 1000
    const start = now + 86400 // 1 day
    const end = start + 1296000 // 15 days after start

    const [
        owner,
        experts,
        marketing,
        team,
        legal,
        reserve,
        funds,
        userA,
        userB,
        userC
    ] = accounts

    let tokenContract
    let saleContract

    context('presale', () => {

        before(async () => {
            tokenContract = await GdprCash.new()
            saleContract = await GdprCrowdsale.new(start, end, tokenContract.address)
            await tokenContract.setCrowdsale(saleContract.address)
        })

        it('owner can add presale orders before the crowdsale start', async () => {
            const sendAmount = web3.toWei(50000, 'ether')
            const userBalanceBefore = await tokenContract.balanceOf(userA)
            await saleContract.addPresaleOrder(userA, sendAmount)
            const userBalanceAfter = await tokenContract.balanceOf(userA)
            assert.equal(userBalanceAfter.toNumber(), userBalanceBefore.toNumber() + sendAmount)
        })

        it('non-owner cannot add presale orders', async () => {
            await assertThrows(
                saleContract.addPresaleOrder(userB, 5000, {from: experts})
            )
        })

        it('presale orders cannot be made after the crowdsale has started', async () => {
            timeTravel(86400) // fast forward 1 day

            await assertThrows(
                saleContract.addPresaleOrder(userA, 5000)
            )
        })
    })
})
