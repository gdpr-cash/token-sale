pragma solidity ^0.4.19;

//import "./GdprConfig.sol";
import "./GdprCash.sol";

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";


/**
 * @title GDPR Crowdsale
 * @dev GDPR Cash crowdsale contract. 
 */
contract GdprCrowdsale is Pausable, GdprConfig {
    using SafeMath for uint256;

    // Token contract
    GdprCash public token;

    // Start and end timestamps where investments are allowed (both inclusive)
    uint256 public startTime;
    uint256 public endTime;

    // Address where funds are collected
    address public wallet;

    // How many token units a buyer gets per wei
    uint256 public rate;

    // Amount of raised money in wei
    uint256 public weiRaised = 0;

    // Total amount of tokens purchased
    uint256 public totalPurchased = 0;

    // Purchases
    mapping(address => uint256) public tokensPurchased;

    // Whether the crowdsale is finalized
    bool public isFinalized = false;

    // Crowdsale events
    /**
     * Event for token purchase logging
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

     /**
     * Event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param amount amount of tokens purchased
     */
    event TokenPresale(
        address indexed purchaser, 
        uint256 amount);

    /**
     * Event invoked when the rate is changed
     * @param newRate The new rate GDPR / ETH
     */
    event RateChange(uint256 newRate);

    /**
     * Triggered when ether is withdrawn to the sale wallet
     * @param amount How many funds to withdraw in wei
     */
    event FundWithdrawal(uint256 amount);

    /**
     * Event for crowdsale finalization
     */
    event Finalized();

    /**
     * @dev GdprCrowdsale contract constructor
     * @param _startTime uint256 Unix timestamp representing the crowdsale start time
     * @param _endTime uint256 Unix timestamp representing the crowdsale end time
     * @param _tokenAddress address Address of the GDPR Cash token contract
     */
    function GdprCrowdsale(
        uint256 _startTime,
        uint256 _endTime,
        address _tokenAddress
    ) public
    {
        require(_endTime > _startTime);
        require(_tokenAddress != address(0));

        startTime = _startTime;
        endTime = _endTime;
        token = GdprCash(_tokenAddress);
        rate = token.INITIAL_RATE();
        wallet = token.SALE_FUNDS_ADDR();
    }

    /**
     * @dev Fallback function is used to buy tokens.
     * It's the only entry point since `buyTokens` is internal.
     * When paused funds are not accepted.
     */
    function () public whenNotPaused payable {
        buyTokens(msg.sender, msg.value);
    }

    /**
     * @dev Sets a new start date as long as token sale hasn't started yet
     * @param _startTime uint256 Unix timestamp of the new start time
     */
    function setStartTime (uint256 _startTime) public onlyOwner {
        require(now < startTime);
        require(_startTime > now);
        require(_startTime < endTime);

        startTime = _startTime;
    }

    /**
     * @dev Sets a new end date as long as end date hasn't been reached
     * @param _endTime uint2t56 Unix timestamp of the new end time
     */
    function setEndTime (uint256 _endTime) public onlyOwner {
        require(now < endTime);
        require(_endTime > now);
        require(_endTime > startTime);

        endTime = _endTime;
    }

    /**
     * @dev Updates the GDPR/ETH conversion rate
     * @param _rate uint256 Updated conversion rate
     */
    function setRate(uint256 _rate) public onlyOwner {
        require(_rate > 0);
        rate = _rate;
        RateChange(rate);
    }

    /**
     * @dev Must be called after crowdsale ends, to do some extra finalization
     * work. Calls the contract's finalization function.
     */
    function finalize() public onlyOwner {
        require(now > startTime);
        require(!isFinalized);

        finalization();
        Finalized();

        isFinalized = true;
    }

    /**
     * @dev Anyone can check if the crowdsale is over
     * @return true if crowdsale has endeds
     */
    function hasEnded() public view returns (bool) {
        return now > endTime;
    }

    /**
     * @dev Transfers ether to the sale wallet
     * @param _amount uint256 The amount to withdraw. 
     * If 0 supplied transfers the entire balance.
     */
    function withdraw(uint256 _amount) public onlyOwner {
        require(this.balance > 0);
        require(_amount <= this.balance);
        uint256 balanceToSend = _amount;
        if (balanceToSend == 0) {
            balanceToSend = this.balance; 
        }
        wallet.transfer(balanceToSend);
        FundWithdrawal(balanceToSend);
    }

    /**
     *  @dev Registers a presale order
     *  @param _participant address The address of the token purchaser
     *  @param _tokenAmount uin256 The amount of GDPR Cash (in wei) purchased
     */
    function addPresaleOrder(address _participant, uint256 _tokenAmount) external onlyOwner {
        require(now < startTime);

        // Update state
        tokensPurchased[_participant] = tokensPurchased[_participant].add(_tokenAmount);
        totalPurchased = totalPurchased.add(_tokenAmount);

        token.transfer(_participant, _tokenAmount);

        TokenPresale(
            _participant,
            _tokenAmount
        );
    }

    /**
     *  @dev Token purchase logic. Used internally.
     *  @param _participant address The address of the token purchaser
     *  @param _weiAmount uin256 The amount of ether in wei sent to the contract
     */
    function buyTokens(address _participant, uint256 _weiAmount) internal {
        require(_participant != address(0));
        require(now >= startTime);
        require(now < endTime);
        require(!isFinalized);
        require(_weiAmount != 0);

        // Calculate the token amount to be allocated
        uint256 tokens = _weiAmount.mul(rate);

        // Update state
        tokensPurchased[_participant] = tokensPurchased[_participant].add(tokens);
        totalPurchased = totalPurchased.add(tokens);
        // update state
        weiRaised = weiRaised.add(_weiAmount);

        require(totalPurchased <= token.SALE_CAP());
        require(tokensPurchased[_participant] >= token.PURCHASER_MIN_TOKEN_CAP());

        if (now < startTime + 86400) {
            // if still during the first day of token sale, apply different max cap
            require(tokensPurchased[_participant] <= token.PURCHASER_MAX_TOKEN_CAP_DAY1());
        } else {
            require(tokensPurchased[_participant] <= token.PURCHASER_MAX_TOKEN_CAP());
        }

        token.transfer(_participant, tokens);

        TokenPurchase(
            msg.sender,
            _participant,
            _weiAmount,
            tokens
        );
    }

    /**
     * @dev Additional finalization logic. 
     * Enables token transfers and burns all unsold tokens.
     */
    function finalization() internal {
        withdraw(0);
        burnUnsold();
        token.enableTransfers();
    }

    /**
     * @dev Burn all remaining (unsold) tokens.
     * This should be called automatically after sale finalization
     */
    function burnUnsold() internal {
        // All tokens held by this contract get burned
        token.burn(token.balanceOf(this));
    }
}
