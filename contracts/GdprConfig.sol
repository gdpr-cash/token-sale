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
    // 10% tokens for the experts
    uint256 public constant EXPERTS_POOL_TOKENS = 20000000 * MIN_TOKEN_UNIT;
    // 10% tokens for marketing expenses
    uint256 public constant MARKETING_POOL_TOKENS = 20000000 * MIN_TOKEN_UNIT;
    // 9% founders' distribution
    uint256 public constant TEAM_POOL_TOKENS = 18000000 * MIN_TOKEN_UNIT;
    // 1% for legal advisors
    uint256 public constant LEGAL_EXPENSES_TOKENS = 2000000 * MIN_TOKEN_UNIT;
    // 10% tokens for the reserve
    uint256 public constant RESERVE_POOL_TOKENS = 20000000 * MIN_TOKEN_UNIT;

    // Contract wallet addresses for initial allocation
    address public constant EXPERTS_POOL_ADDR = 0x289bB02deaF473c6Aa5edc4886A71D85c18F328B;
    address public constant MARKETING_POOL_ADDR = 0x7BFD82C978EDDce94fe12eBF364c6943c7cC2f27;
    address public constant TEAM_POOL_ADDR = 0xB4AfbF5F39895adf213194198c0ba316f801B24d;
    address public constant LEGAL_EXPENSES_ADDR = 0xf72931B08f8Ef3d8811aD682cE24A514105f713c;
    address public constant SALE_FUNDS_ADDR = 0xb8E81a87c6D96ed5f424F0A33F13b046C1f24a24;
    address public constant RESERVE_POOL_ADDR = 0x010aAA10BfB913184C5b2E046143c2ec8A037413;
}
