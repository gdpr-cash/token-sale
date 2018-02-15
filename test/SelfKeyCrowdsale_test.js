const GDPRCrowdsale = artifacts.require('./GDPRCrowdsale.sol')
const GDPRCash = artifacts.require('./GDPRCash.sol')
const RefundVault = artifacts.require(
  'zeppelin-solidity/contracts/crowdsale/RefundVault.sol'
)

const assertThrows = require('./utils/assertThrows')
const timeTravel = require('./utils/timeTravel')
const { goal } = require('./utils/common')

contract('GDPRCrowdsale', accounts => {
  const now = new Date().getTime() / 1000
  const start = now
  const end = start + 1296000 // 15 days after start

  const SIGNIFICANT_AMOUNT = 2048

  const [
    buyer,
    buyer2,
    buyer3,
    buyer4,
    buyer5,
    receiver,
    middleman
  ] = accounts.slice(1)

  let crowdsaleContract
  let tokenContract
  let vaultContract

  context("Crowdsale whose goal hasn't been reached", () => {
    const hugeGoal = 950000000000000000000000000
    const sendAmount = web3.toWei(3, 'ether')

    before(async () => {
      crowdsaleContract = await GDPRCrowdsale.new(start, end, hugeGoal)
      const token = await crowdsaleContract.token.call()
      tokenContract = await GDPRCash.at(token)

      const vaultAddress = await crowdsaleContract.vault.call()
      vaultContract = await RefundVault.at(vaultAddress)
    })

    it('deployed with the right owner', async () => {
      assert.isNotNull(crowdsaleContract)
      assert.isNotNull(tokenContract)
      const owner = await tokenContract.owner.call()
      assert.equal(owner, crowdsaleContract.address)
    })

    it('allows refunds', async () => {
      // Purchase equivalent of <sendAmount> in tokens
      const REFUNDING = 1
      const sender = buyer

      await crowdsaleContract.sendTransaction({
        from: sender,
        value: sendAmount
      })

      // check no refund can be claimed before finalization
      await assertThrows(crowdsaleContract.claimRefund(sender))

      // finalize sale and check it was not successful
      await crowdsaleContract.finalize()
      const goalReached = await crowdsaleContract.goalReached.call()
      assert.isFalse(goalReached)
      const vaultState = await vaultContract.state.call()
      assert.equal(vaultState, REFUNDING)

      // issue refund
      const balance1 = web3.eth.getBalance(sender)
      await crowdsaleContract.claimRefund(sender)
      const balance2 = web3.eth.getBalance(sender)

      // check buyer balance increases
      assert.isAbove(balance2.toNumber(), balance1.toNumber())
    })
  })

  context('Regular Crowdsale', () => {
    before(async () => {
      crowdsaleContract = await GDPRCrowdsale.new(start, end, goal)
      const token = await crowdsaleContract.token.call()
      tokenContract = await GDPRCash.at(token)

      const vaultAddress = await crowdsaleContract.vault.call()
      vaultContract = await RefundVault.at(vaultAddress)
    })

    it('deploys and instantiates all derived contracts', async () => {
      assert.isNotNull(crowdsaleContract)
      assert.isNotNull(tokenContract)
      assert.isNotNull(vaultContract)

      // check token contract owner is the crowdsale contract
      const owner = await tokenContract.owner.call()
      assert.equal(owner, crowdsaleContract.address)
    })

    it('distributed the initial token amounts correctly', async () => {
      // Get allocation wallet addresses
      const expertsPool = await crowdsaleContract.EXPERTS_POOL_ADDR.call()
      const communityPool = await crowdsaleContract.COMMUNITY_POOL_ADDR.call()
      const teamPool = await crowdsaleContract.TEAM_POOL_ADDR.call()
      const legalExpensesAddress = await crowdsaleContract.LEGAL_EXPENSES_ADDR.call()

      // Get expected token amounts from contract config
      const expectedExpertsTokens = await crowdsaleContract.EXPERTS_POOL_TOKENS.call()
      const expectedCommunityTokens = await crowdsaleContract.COMMUNITY_POOL_TOKENS.call()
      const expectedTeamTokens = await crowdsaleContract.TEAM_TOKENS.call()
      const expectedLegalTokens = await crowdsaleContract.LEGAL_EXPENSES_TOKENS.call()

      // Get actual balances
      const expertsBalance = await tokenContract.balanceOf.call(expertsPool)
      const communityBalance = await tokenContract.balanceOf.call(communityPool)
      const teamBalance = await tokenContract.balanceOf.call(teamPool)
      const legalBalance = await tokenContract.balanceOf.call(legalExpensesAddress) 

      // Check allocation was done as expected
      assert.equal(
        expertsBalance.toNumber(),
        expectedExpertsTokens.toNumber()
      )
      assert.equal(
        communityBalance.toNumber(),
        expectedCommunityTokens.toNumber()
      )
      assert.equal(
        teamBalance.toNumber(),
        expectedTeamTokens.toNumber()
      )
      assert.equal(legalBalance.toNumber(), expectedLegalTokens.toNumber())
    })

    it('cannot change start time if sale already started', async () => {
      await assertThrows(crowdsaleContract.setStartTime(start + 999))
    })

    it('allows token purchases', async () => {
      const sender = buyer3

      const vaultInitialBalance = await vaultContract.deposited.call(sender)
      const rate = await crowdsaleContract.rate.call()

      // send ETH to the contract to purchase tokens
      const sendAmount = web3.toWei(2, 'ether')
      await crowdsaleContract.sendTransaction({
        from: sender,
        value: sendAmount
      })
      const buyerBalance = await tokenContract.balanceOf.call(sender)

      // check allocated amount corresponds to the set exchange rate according to ETH price
      assert.equal(buyerBalance.toNumber(), sendAmount * rate)

      // Check wei added to the vault is correct
      const vaultNewBalance = await vaultContract.deposited.call(sender)
      assert.equal(
        vaultNewBalance.toNumber() - vaultInitialBalance.toNumber(),
        sendAmount
      )
    })

    it('does not allow contributions below minimum cap per purchaser', async () => {
      const sender = buyer4

      const minTokenCap = await crowdsaleContract.PURCHASER_MIN_TOKEN_CAP.call()
      const rate = await crowdsaleContract.rate.call()
      const minWei = minTokenCap.toNumber() / rate.toNumber()
      const sendAmount = minWei - SIGNIFICANT_AMOUNT

      // check below cap transaction fails
      await assertThrows(
        crowdsaleContract.sendTransaction({ from: sender, value: sendAmount })
      )
    })

    it('does allow contributions above minimum purchaser cap', async () => {
      const sender = buyer4

      const minTokenCap = await crowdsaleContract.PURCHASER_MIN_TOKEN_CAP.call()
      const rate = await crowdsaleContract.rate.call()
      const minWei = minTokenCap.toNumber() / rate.toNumber()
      const sendAmount = minWei + SIGNIFICANT_AMOUNT
      const balance1 = await tokenContract.balanceOf(sender)

      await crowdsaleContract.sendTransaction({
        from: sender,
        value: sendAmount
      })
      const balance2 = await tokenContract.balanceOf(sender)
      assert.isAbove(balance2.toNumber(), balance1.toNumber())
    })

    it('does not allow contributions above $3000 per purchaser on day 1', async () => {
      const sender = buyer4

      const maxTokenCap = await crowdsaleContract.PURCHASER_MAX_TOKEN_CAP_DAY1.call()
      const rate = await crowdsaleContract.rate.call()
      const maxWei = maxTokenCap.toNumber() / rate.toNumber()
      const sendAmount = maxWei

      await assertThrows(
        crowdsaleContract.sendTransaction({ from: sender, value: sendAmount })
      )
    })

    it('allows contributions above $2000 after day 1', async () => {
      const sender = buyer4

      timeTravel(86400) // fast forward 1 day

      const maxTokenCap = await crowdsaleContract.PURCHASER_MAX_TOKEN_CAP_DAY1.call()
      const rate = await crowdsaleContract.rate.call()
      const maxWei = maxTokenCap.toNumber() / rate.toNumber()
      const sendAmount = maxWei + SIGNIFICANT_AMOUNT
      const balance1 = await tokenContract.balanceOf(sender)

      await crowdsaleContract.sendTransaction({
        from: sender,
        value: sendAmount
      })
      const balance2 = await tokenContract.balanceOf(sender)
      assert.isAbove(balance2.toNumber(), balance1.toNumber())
    })

    it('does not allow contributions above $20,000 after day 1', async () => {
      const sender = buyer5

      const maxTokenCap = await crowdsaleContract.PURCHASER_MAX_TOKEN_CAP.call()
      const rate = await crowdsaleContract.rate.call()
      const maxWei = maxTokenCap.toNumber() / rate.toNumber()
      let sendAmount = maxWei + SIGNIFICANT_AMOUNT

      // check transaction fails because purchase is above cap
      await assertThrows(
        crowdsaleContract.sendTransaction({ from: sender, value: sendAmount })
      )

      // check participant can still purchase slightly above the max cap
      sendAmount = maxWei - SIGNIFICANT_AMOUNT
      const balance1 = await tokenContract.balanceOf(sender)
      crowdsaleContract.sendTransaction({ from: sender, value: sendAmount })
      const balance2 = await tokenContract.balanceOf(sender)
      assert.isAbove(balance2.toNumber(), balance1.toNumber())
    })

    it('does not allow updating ETH price if sale has already started', () => {
      assertThrows(crowdsaleContract.setEthPrice(999))
    })

    it('can change the end date if sale has not ended', async () => {
      const additionalTime = 999
      const beforeEnd = await crowdsaleContract.endTime.call()
      await crowdsaleContract.setEndTime(beforeEnd.toNumber() + additionalTime)
      const laterEnd = await crowdsaleContract.endTime.call()
      assert.equal(laterEnd.toNumber(), beforeEnd.toNumber() + additionalTime)

      await assertThrows(crowdsaleContract.setEndTime(now - 999))
      await assertThrows(crowdsaleContract.setEndTime(start - 1))
    })

    it('does not allow contributions after end date', async () => {
      const sender = buyer

      // fast forwards until crowdsale end time
      const untilEnd = end - now
      timeTravel(untilEnd)

      // check transaction fails
      const sendAmount = web3.toWei(1, 'ether')
      await assertThrows(
        crowdsaleContract.sendTransaction({ from: sender, value: sendAmount })
      )
    })

    it('cannot change end time if sale has already ended', async () => {
      await assertThrows(crowdsaleContract.setEndTime(end + 999))
    })

    it('does not allow token transfers before crowdsale is finalized', async () => {
      const sender = buyer3
      const sendAmount = 5

      // check participant has enough token funds
      const balance = await tokenContract.balanceOf.call(sender)
      assert.isAtLeast(balance.toNumber(), sendAmount)

      // Tokens are not yet transferrable because sale has not been finalized
      await assertThrows(
        tokenContract.transfer(receiver, sendAmount, { from: sender })
      )
    })

    it('can finalize token sale successfully', async () => {
      const crowdsaleWallet = await crowdsaleContract.CROWDSALE_WALLET_ADDR.call()
      const vaultBalance = web3.eth.getBalance(vaultContract.address)
      const walletBalance1 = web3.eth.getBalance(crowdsaleWallet)

      // finalize token sale
      await crowdsaleContract.finalize()
      const walletBalance2 = web3.eth.getBalance(crowdsaleWallet)
      const vaultBalance2 = web3.eth.getBalance(vaultContract.address)
      const contractTokenBalance = await tokenContract.balanceOf.call(
        crowdsaleContract.address
      )

      // check unsold tokens were effectively burned
      assert.equal(contractTokenBalance, 0)

      // check all ETH was effectively transferred to the crowdsale wallet
      assert.equal(vaultBalance2, 0)
      assert.equal(
        walletBalance2.toNumber(),
        walletBalance1.toNumber() + vaultBalance.toNumber()
      )
    })

    it('does not allow finalize to be re-invoked', async () => {
      await assertThrows(crowdsaleContract.finalize())
    })

    it('enables token transfers after finalization', async () => {
      const sender = buyer3
      const sendAmount = 9 // GDPR

      // check sender has enough tokens
      const senderBalance = await tokenContract.balanceOf(sender)
      assert.isAtLeast(senderBalance, sendAmount)

      // test transfer method
      let receiverBalance1 = await tokenContract.balanceOf.call(receiver)
      await tokenContract.transfer(receiver, sendAmount, { from: sender })
      let receiverBalance2 = await tokenContract.balanceOf.call(receiver)
      assert.equal(
        receiverBalance2.toNumber() - receiverBalance1.toNumber(),
        sendAmount
      )

      // approve a middleman to make transfer on behalf of sender
      await tokenContract.approve(middleman, sendAmount, { from: sender })
      const senderBalance1 = await tokenContract.balanceOf.call(sender)
      receiverBalance1 = await tokenContract.balanceOf.call(receiver)

      // test unsuccessful transferFrom invocation (above the approved amount)
      await assertThrows(
        tokenContract.transferFrom(sender, receiver, sendAmount + 1, {
          from: middleman
        })
      ) // function-paren-newline

      // test successful transferFrom invocation
      await tokenContract.transferFrom(sender, receiver, sendAmount, {
        from: middleman
      })
      const senderBalance2 = await tokenContract.balanceOf.call(sender)
      receiverBalance2 = await tokenContract.balanceOf.call(receiver)

      assert.equal(senderBalance1.minus(senderBalance2), sendAmount)
      assert.equal(receiverBalance2.minus(receiverBalance1), sendAmount)
    })
  })
})
