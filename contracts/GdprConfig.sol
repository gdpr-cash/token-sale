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
    address public constant EXPERTS_POOL_ADDR = 0x1a1Cfa223FF0FF7E9373E6e0914FBfb0F9d7E482;
    address public constant MARKETING_POOL_ADDR = 0xf0BEd08A7971D7353BE18b45FfCF1D5D7900eef1;
    address public constant TEAM_POOL_ADDR = 0xFC3897d37Fae4Eb3aa6041b3616ecB99206F445C;
    address public constant LEGAL_EXPENSES_ADDR = 0xd99CF78420D5e0e36a9C30E3C1910d983307ad8D;
    address public constant SALE_FUNDS_ADDR = 0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e;
    address public constant RESERVE_POOL_ADDR = 0x4747b03f8F04FD1915335462612de8FB9E2a409f;
}
