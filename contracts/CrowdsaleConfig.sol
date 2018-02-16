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
    /*address public constant CROWDSALE_WALLET_ADDR = 0x627306090abaB3A6e1400e9345bC60c78a8BEf57;
    address public constant EXPERTS_POOL_ADDR = 0xf17f52151EbEF6C7334FAD080c5704D77216b732;
    address public constant COMMUNITY_POOL_ADDR = 0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef;
    address public constant TEAM_POOL_ADDR = 0x821aEa9a577a9b44299B9c15c88cf3087F3b5544;
    address public constant LEGAL_EXPENSES_ADDR = 0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2;*/
    address public constant CROWDSALE_WALLET_ADDR = 0xE0831b1687c9faD3447a517F9371E66672505dB0;
    address public constant EXPERTS_POOL_ADDR = 0xD68947892Ef4D94Cdef7165b109Cf6Cd3f58A8e8;
    address public constant COMMUNITY_POOL_ADDR = 0xd0C24Bb82e71A44eA770e84A3c79979F9233308D;
    address public constant TEAM_POOL_ADDR = 0x0506c5485AE54aB14C598Ef16C459409E5d8Fc03;
    address public constant LEGAL_EXPENSES_ADDR = 0x4452d6454e777743a5Ee233fbe873055008fF528;

    // 6 months period, in seconds, for pre-commitment half-vesting
    //uint64 public constant PRECOMMITMENT_VESTING_SECONDS = 15552000;
}
