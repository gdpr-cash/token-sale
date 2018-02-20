pragma solidity ^0.4.19;

import './GdprConfig.sol';
import './GdprCash.sol';

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';


/**
 * @title SelfKeyCrowdsale
 * @dev SelfKey Token Crowdsale implementation.
 */
// solhint-disable-next-line max-states-count
contract GdprCrowdsale is Pausable, GdprConfig {
    using SafeMath for uint256;

    // Token contract
    GdprCash public token;

    // start and end timestamps where investments are allowed (both inclusive)
    uint256 public startTime;
    uint256 public endTime;

    // address where funds are collected
    address public wallet;

    // how many token units a buyer gets per wei
    uint256 public rate;

    // amount of raised money in wei
    uint256 public weiRaised = 0;

    // Total amount of tokens purchased
    uint256 public totalPurchased = 0;

    mapping(address => uint256) public tokensPurchased;

    bool public isFinalized = false;

    // Crowdsale events
    /**
     * event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param beneficiary who got the tokens
     * @param value weis paid for purchase
     * @param amount amount of tokens purchased
     */
    event TokenPurchase(
        address indexed purchaser, 
        address indexed beneficiary, 
        uint256 value, 
        uint256 amount);

    event RateChange(uint256 newRate);

    event FundWithdrawal(uint256 amount);

    event Finalized();

    /**
     * @dev GdprCrowdsale contract constructor
     * @param _startTime — Unix timestamp representing the crowdsale start time
     * @param _endTime — Unix timestamp representing the crowdsale start time
     * @param _tokenAddress — Minimum amount of tokens expected to sell.
     */
    function GdprCrowdsale(
        uint256 _startTime,
        uint256 _endTime,
        address _tokenAddress
    ) public
    {
        require(_endTime > _startTime);
        require(_tokenAddress != address(0));

        // sets contract owner as a verifier
        //isVerifier[msg.sender] = true;

        startTime = _startTime;
        endTime = _endTime;
        token = GdprCash(_tokenAddress);
        rate = INITIAL_RATE;
        wallet = SALE_FUNDS_ADDR;
    }

    /**
     * @dev Fallback function is used to buy tokens.
     *      It's the only entry point since `buyTokens` is internal
     */
    function () whenNotPaused public payable {
        buyTokens(msg.sender, msg.value);
    }

    /**
     * @dev Sets a new start date as long as token hasn't started yet
     * @param _startTime - unix timestamp of the new start time
     */
    function setStartTime (uint256 _startTime) public onlyOwner {
        require(now < startTime);
        require(_startTime > now);
        require(_startTime < endTime);

        startTime = _startTime;
    }

    /**
     * @dev Sets a new end date as long as end date hasn't been reached
     * @param _endTime - unix timestamp of the new end time
     */
    function setEndTime (uint256 _endTime) public onlyOwner {
        require(now < endTime);
        require(_endTime > now);
        require(_endTime > startTime);

        endTime = _endTime;
    }

    /**
     * @dev Updates the ETH/USD conversion rate as long as the public sale hasn't started
     * @param _rate - Updated conversion rate
     */
    function setRate(uint256 _rate) public onlyOwner {
        require(_rate > 0);
        rate = _rate;
        RateChange(rate);
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

    // @return true if crowdsale event has ended
    function hasEnded() public view returns (bool) {
        return now > endTime;
    }

    function withdraw(uint256 amount) public onlyOwner {
        require(this.balance > 0);
        require(amount <= this.balance);
        uint256 balanceToSend = amount;
        if (balanceToSend == 0) {
            balanceToSend = this.balance; 
        }
        wallet.transfer(balanceToSend);
        FundWithdrawal(balanceToSend);
    }

    /**
     *  @dev Low level token purchase. Only callable internally. Participants MUST be KYC-verified before purchase
     *  @param participant — The address of the token purchaser
     *  @param weiAmount — The address of the token purchaser
     */
    function buyTokens(address participant, uint256 weiAmount) internal {
        require(participant != address(0));
        require(now >= startTime);
        require(now < endTime);
        require(!isFinalized);
        require(weiAmount != 0);

        // Calculate the token amount to be allocated
        uint256 tokens = weiAmount.mul(rate);

        // Update state
        tokensPurchased[participant] = tokensPurchased[participant].add(tokens);
        totalPurchased = totalPurchased.add(tokens);
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

        token.transfer(participant, tokens);

        TokenPurchase(
            msg.sender,
            participant,
            weiAmount,
            tokens
        );
    }

    /**
     * @dev Additional finalization logic. Enables token transfers.
     */
    function finalization() internal {
        withdraw(0);
        burnUnsold();
        token.enableTransfers();
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
