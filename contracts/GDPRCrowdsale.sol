/* solhint-disable not-rely-on-time */

pragma solidity ^0.4.19;

import './GDPRCash.sol';
import './CrowdsaleConfig.sol';

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/crowdsale/RefundVault.sol';
import 'zeppelin-solidity/contracts/token/ERC20/TokenTimelock.sol';
import 'zeppelin-solidity/contracts/token/ERC20/SafeERC20.sol';


/**
 * @title SelfKeyCrowdsale
 * @dev SelfKey Token Crowdsale implementation.
 */
// solhint-disable-next-line max-states-count
contract GDPRCrowdsale is Ownable, CrowdsaleConfig {
    using SafeMath for uint256;
    using SafeERC20 for GDPRCash;

    // whitelist of addresses that can perform precommitments and KYC verifications
    //mapping(address => bool) public isVerifier;

    // Token contract
    GDPRCash public token;

    uint64 public startTime;
    uint64 public endTime;

    // Minimum tokens expected to sell
    uint256 public goal;

    // How many tokens a buyer gets per ETH
    uint256 public rate = 5000;

    // ETH price in USD, can be later updated until start date
    uint256 public ethPrice = 928;

    // Total amount of tokens purchased, including pre-sale
    uint256 public totalPurchased = 0;

    mapping(address => bool) public kycVerified;
    mapping(address => uint256) public tokensPurchased;

    // a mapping of dynamically instantiated token timelocks for each pre-commitment beneficiary
    mapping(address => address) public vestedTokens;

    bool public isFinalized = false;

    // Token Timelocks
    //TokenTimelock public foundersTimelock1;
    //TokenTimelock public foundersTimelock2;
    //TokenTimelock public foundationTimelock;

    // Vault to hold funds until crowdsale is finalized. Allows refunding if crowdsale is not successful.
    RefundVault public vault;

    // Crowdsale events
    event TokenPurchase(
        address indexed purchaser,
        address indexed beneficiary,
        uint256 value,
        uint256 amount
    );

    //event VerifiedKYC(address indexed participant);

    event AddedPresale(
        address indexed participant,
        uint256 tokensAllocated
    );

    event Finalized();

    /*modifier verifierOnly() {
        require(isVerifier[msg.sender]);
        _;
    }*/

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
        token.mint(address(this), TOTAL_SUPPLY_CAP);
        token.finishMinting();

        startTime = _startTime;
        endTime = _endTime;
        goal = _goal;

        vault = new RefundVault(CROWDSALE_WALLET_ADDR);

        // Set timelocks to 6 months and a year after startTime, respectively
        //uint64 sixMonthLock = uint64(startTime + 15552000);
        //uint64 yearLock = uint64(startTime + 31104000);

        // Instantiation of token timelocks
        //foundersTimelock1 = new TokenTimelock(token, FOUNDERS_POOL_ADDR, sixMonthLock);
        //foundersTimelock2 = new TokenTimelock(token, FOUNDERS_POOL_ADDR, yearLock);
        //foundationTimelock = new TokenTimelock(token, FOUNDATION_POOL_ADDR_VEST, yearLock);

        // Genesis allocation of tokens
        token.safeTransfer(EXPERTS_POOL_ADDR, EXPERTS_POOL_TOKENS);
        token.safeTransfer(COMMUNITY_POOL_ADDR, COMMUNITY_POOL_TOKENS);
        token.safeTransfer(TEAM_POOL_ADDR, TEAM_POOL_TOKENS);
        token.safeTransfer(LEGAL_EXPENSES_ADDR, LEGAL_EXPENSES_TOKENS);

        // Allocation of vested tokens
        //token.safeTransfer(foundersTimelock1, FOUNDERS_TOKENS_VESTED_1);
        //token.safeTransfer(foundersTimelock2, FOUNDERS_TOKENS_VESTED_2);
        //token.safeTransfer(foundationTimelock, FOUNDATION_POOL_TOKENS_VESTED);
    }

    /**
     * @dev Fallback function is used to buy tokens.
     *      It's the only entry point since `buyTokens` is internal
     */
    function () public payable {
        buyTokens(msg.sender);
    }

    /**
     * @dev Adds an address to the whitelist of Verifiers
     * @param _address - address of the verifier
     */
    /*function addVerifier (address _address) public onlyOwner {
        isVerifier[_address] = true;
    }*/

    /**
     * @dev Removes an address from the whitelist of Verifiers
     * @param _address - address of the verifier to be removed
     */
    /*function removeVerifier (address _address) public onlyOwner {
        isVerifier[_address] = false;
    }*/

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
     */
    function setEthPrice(uint256 _ethPrice) public onlyOwner {
        require(now < startTime);
        require(_ethPrice > 0);

        ethPrice = _ethPrice;
        rate = ethPrice.mul(1000).div(TOKEN_PRICE_THOUSANDTH);
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
     * @dev Release time-locked tokens
     */
    /*function releaseLockFounders1() public {
        foundersTimelock1.release();
    }

    function releaseLockFounders2() public {
        foundersTimelock2.release();
    }

    function releaseLockFoundation() public {
        foundationTimelock.release();
    }*/

    /**
     * @dev Release time-locked tokens for any vested address
     */
    /*function releaseLock(address participant) public {
        require(vestedTokens[participant] != 0x0);

        TokenTimelock timelock = TokenTimelock(vestedTokens[participant]);
        timelock.release();
    }*/

    /**
     * @dev Verifies KYC for given participant.
     *      This enables token purchases by the participant addres
     */
    /*function verifyKYC(address participant) public verifierOnly {
        kycVerified[participant] = true;

        VerifiedKYC(participant);
    }*/

    /**
     * @dev Adds an address for pre-sale commitments made off-chain.
     * @param beneficiary — Address of the already verified participant
     * @param tokensAllocated — Exact amount of KEY tokens (including decimal places) to allocate
     */
    function addPresale(
        address beneficiary,
        uint256 tokensAllocated
    ) public onlyOwner
    {
        // requires to be on pre-sale
        require(now < startTime); // solhint-disable-line not-rely-on-time

        uint256 tokens = tokensAllocated;
        totalPurchased = totalPurchased.add(tokens);
        tokensPurchased[beneficiary] = tokensPurchased[beneficiary].add(tokens);

        // all tokens are sent to the participant's address
        token.safeTransfer(beneficiary, tokens);

        AddedPresale(
            beneficiary,
            tokens
        );
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
        totalPurchased = totalPurchased.add(tokens);

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
        token.safeTransfer(participant, tokens);

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
