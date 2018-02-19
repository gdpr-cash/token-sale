/* solhint-disable not-rely-on-time */

pragma solidity ^0.4.19;

import './GDPRCash.sol';
import './CrowdsaleConfig.sol';

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/crowdsale/RefundVault.sol';


/**
 * @title SelfKeyCrowdsale
 * @dev SelfKey Token Crowdsale implementation.
 */
// solhint-disable-next-line max-states-count
contract GDPRCrowdsale is Ownable, CrowdsaleConfig {
    using SafeMath for uint256;

    // Token contract
    GDPRCash public token;

    // start and end timestamps where investments are allowed (both inclusive)
    uint256 public startTime;
    uint256 public endTime;

    // address where funds are collected
    address public wallet;

    // how many token units a buyer gets per wei
    uint256 public rate;

    // amount of raised money in wei
    uint256 public weiRaised;

    // Minimum tokens expected to sell
    uint256 public goal;

    // How many tokens a buyer gets per ETH
    uint256 public rate = 5000;

    // Total amount of tokens purchased
    uint256 public tokensSold = 0;

    mapping(address => uint256) public tokensPurchased;

    bool public isFinalized = false;

    // Vault to hold funds until crowdsale is finalized. Allows refunding if crowdsale is not successful.
    RefundVault public vault;

    // Crowdsale events
    event TokenPurchase(
        address indexed purchaser,
        address indexed beneficiary,
        uint256 value,
        uint256 amount
    );

     event RateChanged(
         uint256 oldRate, 
         uint256 newRate);

    event Finalized();

    /**
     * @dev Crowdsale contract constructor
     * @param _startTime — Unix timestamp representing the crowdsale start time
     * @param _endTime — Unix timestamp representing the crowdsale start time
     * @param _goal — Minimum amount of tokens expected to sell.
     */
    function GDPRCrowdsale(
        uint64 _startTime,
        uint64 _endTime,
        uint256 _goal
    ) public
    {
        require(_endTime > _startTime);

        // sets contract owner as a verifier
        //isVerifier[msg.sender] = true;

        token = new GDPRCash(TOTAL_SUPPLY_CAP);

        // mints all possible tokens to the crowdsale contract
        token.mint(owner, TOTAL_SUPPLY_CAP);
        token.finishMinting();

        startTime = _startTime;
        endTime = _endTime;
        goal = _goal;

        vault = new RefundVault(CROWDSALE_WALLET_ADDR);

        // Genesis allocation of tokens
        token.safeTransfer(EXPERTS_POOL_ADDR, EXPERTS_POOL_TOKENS);
        token.safeTransfer(COMMUNITY_POOL_ADDR, COMMUNITY_POOL_TOKENS);
        token.safeTransfer(TEAM_POOL_ADDR, TEAM_POOL_TOKENS);
        token.safeTransfer(LEGAL_EXPENSES_ADDR, LEGAL_EXPENSES_TOKENS);
    }

    /**
     * @dev Fallback function is used to buy tokens.
     *      It's the only entry point since `buyTokens` is internal
     */
    function () public payable {
        buyTokens(msg.sender);
    }

    /**
     * @dev Sets a new start date as long as token hasn't started yet
     * @param _startTime - unix timestamp of the new start time
     */
    function setStartTime (uint64 _startTime) public onlyOwner {
        require(now < startTime);
        require(_startTime > now);
        require(_startTime < endTime);

        startTime = _startTime;
    }

    /**
     * @dev Sets a new end date as long as end date hasn't been reached
     * @param _endTime - unix timestamp of the new end time
     */
    function setEndTime (uint64 _endTime) public onlyOwner {
        require(now < endTime);
        require(_endTime > now);
        require(_endTime > startTime);

        endTime = _endTime;
    }

    /**
     * @dev Updates the ETH/USD conversion rate as long as the public sale hasn't started
     * @param _ethPrice - Updated conversion rate
     */r
    function setRate(uint256 _rate) public onlyOwner {
        rate = _rate;
    }

    /**
     * @dev Must be called after crowdsale ends, to do some extra finalization
     *      work. Calls the contract's finalization function.
     */
    function finalize() public onlyOwner {
        require(now > startTime);
        require(!isFinalized);

        finalization();
        Finalized();

        isFinalized = true;
    }

    /**
     * @dev If crowdsale is unsuccessful, a refund can be claimed back
     */
    function claimRefund(address participant) public {
        // requires sale to be finalized and goal not reached,
        require(isFinalized);
        require(!goalReached());

        vault.refund(participant);
    }

    /**
     * @dev If crowdsale is unsuccessful, participants can claim refunds
     */
    function goalReached() public constant returns (bool) {
        return totalPurchased >= goal;
    }

    /**
     * @dev Additional finalization logic. Enables token transfers.
     */
    function finalization() internal {
        if (goalReached()) {
            burnUnsold();
            vault.close();
            token.enableTransfers();
        } else {
            vault.enableRefunds();
        }
    }

    /**
     *  @dev Low level token purchase. Only callable internally. Participants MUST be KYC-verified before purchase
     *  @param participant — The address of the token purchaser
     */
    function buyTokens(address participant) internal {
        //require(kycVerified[participant]);
        require(now >= startTime);
        require(now < endTime);
        require(!isFinalized);
        require(msg.value != 0);

        // Calculate the token amount to be allocated
        uint256 weiAmount = msg.value;
        uint256 tokens = weiAmount.mul(rate);

        // Update state
        tokensPurchased[participant] = tokensPurchased[participant].add(tokens);
        tokensSold = tokensSold.add(tokens);
        // update state
        weiRaised = weiRaised.add(weiAmount);

        require(totalPurchased <= SALE_CAP);
        require(tokensPurchased[participant] >= PURCHASER_MIN_TOKEN_CAP);

        if (now < startTime + 86400) {
            // if still during the first day of token sale, apply different max cap
            require(tokensPurchased[participant] <= PURCHASER_MAX_TOKEN_CAP_DAY1);
        } else {
            require(tokensPurchased[participant] <= PURCHASER_MAX_TOKEN_CAP);
        }

        // Sends ETH contribution to the RefundVault and tokens to participant
        vault.deposit.value(msg.value)(participant);
        token.transfer(participant, tokens);

        TokenPurchase(
            msg.sender,
            participant,
            weiAmount,
            tokens
        );
    }

    /**
     * @dev Burn all remaining (unsold) tokens.
     *      This should be called after sale finalization
     */
    function burnUnsold() internal {
        // All tokens held by this contract get burned
        token.burn(token.balanceOf(this));
    }
}
