pragma solidity ^0.4.19;


/**
 * @title GdprConfig
 * @dev Configuration for GDPR Cash token and crowdsale
*/
contract GdprConfig {

    // Token settings
    string public constant TOKEN_NAME = "CHARACTER1";
    string public constant TOKEN_SYMBOL = "CHR1";
    uint8 public constant TOKEN_DECIMALS = 18;

    // Smallest value of the GDPR
    uint256 public constant MIN_TOKEN_UNIT = 10 ** uint256(TOKEN_DECIMALS);
    // Minimum cap per purchaser on public sale ~ $100 in GDPR Cash
    uint256 public constant PURCHASER_MIN_TOKEN_CAP = 500 * MIN_TOKEN_UNIT;
    // Maximum cap per purchaser on first day of public sale ~ $2,000 in GDPR Cash
    uint256 public constant PURCHASER_MAX_TOKEN_CAP_DAY1 = 10000 * MIN_TOKEN_UNIT;
    // Maximum cap per purchaser on public sale ~ $20,000 in GDPR
    uint256 public constant PURCHASER_MAX_TOKEN_CAP = 100000 * MIN_TOKEN_UNIT;

    // Crowdsale rate GDPR / ETH
    uint256 public constant INITIAL_RATE = 5000; // 5000 GDPR for 1 ether

    // Initial distribution amounts
    uint256 public constant TOTAL_SUPPLY_CAP = 200000000 * MIN_TOKEN_UNIT;
    // 60% of the total supply cap
    uint256 public constant SALE_CAP = 120000000 * MIN_TOKEN_UNIT;
    // 20% tokens for the experts
    uint256 public constant EXPERTS_POOL_TOKENS = 40000000 * MIN_TOKEN_UNIT;
    // 10% tokens for marketing expenses
    uint256 public constant COMMUNITY_POOL_TOKENS = 20000000 * MIN_TOKEN_UNIT;
    // 9% founders' distribution
    uint256 public constant TEAM_POOL_TOKENS = 18000000 * MIN_TOKEN_UNIT;
    // 1% for legal advisors
    uint256 public constant LEGAL_EXPENSES_TOKENS = 2000000 * MIN_TOKEN_UNIT;

    // Contract wallet addresses for initial allocation
    address public constant EXPERTS_POOL_ADDR = 0xf17f52151EbEF6C7334FAD080c5704D77216b732;
    address public constant COMMUNITY_POOL_ADDR = 0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef;
    address public constant TEAM_POOL_ADDR = 0x821aEa9a577a9b44299B9c15c88cf3087F3b5544;
    address public constant LEGAL_EXPENSES_ADDR = 0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2;
    address public constant SALE_FUNDS_ADDR = 0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e;
}
