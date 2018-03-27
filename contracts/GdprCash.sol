pragma solidity ^0.4.19;

import './GdprConfig.sol';

import 'zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol';
import 'zeppelin-solidity/contracts/token/ERC20/CappedToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';


/**
 * @title GdprCash
 * @dev GDPR Cash - the token used in the gdpr.cash network.
 *
 * All tokens are preminted and distributed at deploy time.
 * Transfers are disabled until the crowdsale is over. 
 * All unsold tokens are burned.
 */
contract GdprCash is DetailedERC20, CappedToken, GdprConfig {

    bool private transfersEnabled = false;
    address public crowdsale = address(0);

    /**
     * @dev Triggered on token burn
     */
    event Burn(address indexed burner, uint256 value);

    /**
     * @dev Transfers are restricted to the crowdsale and owner only
     *      until the crowdsale is over.
     */
    modifier canTransfer() {
        require(transfersEnabled || msg.sender == owner || msg.sender == crowdsale);
        _;
    }

    /**
     * @dev Restriected to the crowdsale only
     */
    modifier onlyCrowdsale() {
        require(msg.sender == crowdsale);
        _;
    }
    
    /**
     * @dev Constructor that sets name, symbol, decimals as well as a maximum supply cap.
     */
    function GdprCash() public 
                DetailedERC20(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS)  
                CappedToken(TOTAL_SUPPLY_CAP) {
    }

    /**
     * @dev Sets the crowdsale. Can be invoked only once and by the owner
     * @param _crowdsaleAddr address The address of the crowdsale contract
     */
    function setCrowdsale(address _crowdsaleAddr) external onlyOwner {
        require(crowdsale == address(0));
        require(_crowdsaleAddr != address(0));
        require(!transfersEnabled);
        crowdsale = _crowdsaleAddr;

        // Generate sale tokens
        mint(crowdsale, SALE_CAP);

        // Distribute non-sale tokens to pools
        mint(EXPERTS_POOL_ADDR, EXPERTS_POOL_TOKENS);
        mint(MARKETING_POOL_ADDR, MARKETING_POOL_TOKENS);
        mint(TEAM_POOL_ADDR, TEAM_POOL_TOKENS);
        mint(LEGAL_EXPENSES_ADDR, LEGAL_EXPENSES_TOKENS);
        mint(RESERVE_POOL_ADDR, RESERVE_POOL_TOKENS);

        finishMinting();
    }

    /**
     * @dev Checks modifier and transfers
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     */
    function transfer(address _to, uint256 _value)
        public canTransfer returns (bool)
    {
        return super.transfer(_to, _value);
    }

    /**
     * @dev Checks modifier and transfers
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     */
    function transferFrom(address _from, address _to, uint256 _value)
        public canTransfer returns (bool)
    {
        return super.transferFrom(_from, _to, _value);
    }      

    /**
     * @dev Enables token transfers.
     * Called when the token sale is successfully finalized
     */
    function enableTransfers() public onlyCrowdsale {
        transfersEnabled = true;
    }

    /**
    * @dev Burns a specific number of tokens.
    * @param _value uint256 The number of tokens to be burned.
    */
    function burn(uint256 _value) public onlyCrowdsale {
        require(_value <= balances[msg.sender]);

        address burner = msg.sender;
        balances[burner] = balances[burner].sub(_value);
        totalSupply_ = totalSupply_.sub(_value);
        Burn(burner, _value);
    }
}
