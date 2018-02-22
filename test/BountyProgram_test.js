const GdprCrowdsale = artifacts.require('./GdprCrowdsale.sol')
const GdprCash = artifacts.require('./GdprCash.sol')

const assertThrows = require('./utils/assertThrows')
const timeTravel = require('./utils/timeTravel')

contract('GdprCash', accounts => {
    const now = new Date().getTime() / 1000
    const start = now
    const end = start + 1296000 // 15 days after start

    const [
        owner,
        experts,
        community,
        team,
        legal,
        userA,
        userB
    ] = accounts

    let tokenContract
    let saleContract
    let expertsTokens
    let communityTokens
    let teamTokens
    let legalTokens

    context('Bounty Program', () => {
        const sendAmount = web3.toWei(1, 'ether')

        before(async () => {
            tokenContract = await GdprCash.new()
            saleContract = await GdprCrowdsale.new(start, end, tokenContract.address)
            await tokenContract.setCrowdsale(saleContract.address);
            
            expertsTokens = await saleContract.EXPERTS_POOL_TOKENS.call()
            communityTokens = await saleContract.COMMUNITY_POOL_TOKENS.call()
            legalTokens = await saleContract.LEGAL_EXPENSES_TOKENS.call()
        })

        it('can give approval to the owner for transfers', async () => {
            await tokenContract.approve(owner, expertsTokens, {from: experts})
            await tokenContract.approve(owner, communityTokens, {from: community})
            await tokenContract.approve(owner, legalTokens, {from: legal})

            const expertsAllowance = await tokenContract.allowance(experts, owner)
            const communityAllowance = await tokenContract.allowance(community, owner)
            const legalAllowance = await tokenContract.allowance(legal, owner)

            assert.equal(expertsAllowance.toNumber(), expertsTokens.toNumber())
            assert.equal(communityAllowance.toNumber(), communityTokens.toNumber())
            assert.equal(legalAllowance.toNumber(), legalTokens.toNumber())
        })

        it('owner can make transfers even before the crowdsale end', async () => {
            isFinalized = await saleContract.isFinalized()
            assert.equal(isFinalized, false)

            const sendAmount = web3.toWei(5000)
            const userBalanceBefore = await tokenContract.balanceOf.call(userA)
            await tokenContract.transferFrom(experts, userA, sendAmount, {from: owner})
            const userBalanceAfter = await tokenContract.balanceOf.call(userA)
            assert.equal(userBalanceAfter.toNumber() - userBalanceBefore.toNumber(), sendAmount)
        })

        it('owner cannot transfer more than allowed', async () => {
            await tokenContract.approve(owner, 1, {from: experts})

            const sendAmount = 2
            await assertThrows(tokenContract.transferFrom(experts, userA, sendAmount, {from: owner}))
        })
    })
})
