pragma solidity ^0.4.19;

/**
 * @title CrowdsaleConfig
 * @dev Holds all constants for SelfKeyCrowdsale contract
*/
contract CrowdsaleConfig {

    /*
        1 ether = 5000 gdpr
        1 gdpr = 0.0002 ether
        1 ether = 928 usd
        1 gdpr = 0.0002 ether * 928 usd = 0.1856 usd
    */

    uint256 public constant TOKEN_DECIMALS = 18;
    uint256 public constant MIN_TOKEN_UNIT = 10 ** uint256(TOKEN_DECIMALS);

    // Initial distribution amounts
    uint256 public constant TOTAL_SUPPLY_CAP = 200000000 * MIN_TOKEN_UNIT;

    // 60% of the total supply cap
    uint256 public constant SALE_CAP = 120000000 * MIN_TOKEN_UNIT;

    // Minimum cap per purchaser on public sale ~ $100 in GDPR Cash
    uint256 public constant PURCHASER_MIN_TOKEN_CAP = 500 * MIN_TOKEN_UNIT;

    // Maximum cap per purchaser on first day of public sale ~ $2,000 in GDPR Cash
    uint256 public constant PURCHASER_MAX_TOKEN_CAP_DAY1 = 10000 * MIN_TOKEN_UNIT;

    // Maximum cap per purchaser on public sale ~ $20,000 in GDPR
    uint256 public constant PURCHASER_MAX_TOKEN_CAP = 100000 * MIN_TOKEN_UNIT;

    // Tokens for the experts 20%
    uint256 public constant EXPERTS_POOL_TOKENS = 40000000 * MIN_TOKEN_UNIT;
    //uint256 public constant FOUNDATION_POOL_TOKENS_VESTED = 113333334 * MIN_TOKEN_UNIT;

    // Tokens for bounties etc 10%
    uint256 public constant COMMUNITY_POOL_TOKENS = 20000000 * MIN_TOKEN_UNIT;

    // Founders' distribution. Total = 9%
    uint256 public constant TEAM_POOL_TOKENS = 18000000 * MIN_TOKEN_UNIT;

    // 1% for legal advisors
    uint256 public constant LEGAL_EXPENSES_TOKENS = 2000000 * MIN_TOKEN_UNIT;

    // KEY price in USD (thousandths)
    uint256 public constant TOKEN_PRICE_THOUSANDTH = 186;  // $0.186 per GDPR

    // Contract wallet addresses for initial allocation
    address public constant CROWDSALE_WALLET_ADDR = 0xc8e922d283bf770a3F33C15b7f8faD117b72A5a6;
    address public constant EXPERTS_POOL_ADDR = 0x1a1Cfa223FF0FF7E9373E6e0914FBfb0F9d7E482;
    address public constant COMMUNITY_POOL_ADDR = 0xf0BEd08A7971D7353BE18b45FfCF1D5D7900eef1;
    address public constant TEAM_POOL_ADDR = 0xFC3897d37Fae4Eb3aa6041b3616ecB99206F445C;
    address public constant LEGAL_EXPENSES_ADDR = 0xd99CF78420D5e0e36a9C30E3C1910d983307ad8D;
    
    // 6 months period, in seconds, for pre-commitment half-vesting
    //uint64 public constant PRECOMMITMENT_VESTING_SECONDS = 15552000;
}
