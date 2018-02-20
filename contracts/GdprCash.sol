pragma solidity ^0.4.19;

import './GdprConfig.sol';

import 'zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol';
import 'zeppelin-solidity/contracts/token/ERC20/CappedToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';


/**
 * @title GdprCash
 * @dev GdprCash Token implementation.
 */
contract GdprCash is DetailedERC20, CappedToken, GdprConfig {

    bool private transfersEnabled = false;
    address public crowdsale = address(0);

    event Burn(address indexed burner, uint256 value);

    /**
     * @dev Only the contract owner can transfer without restrictions.
     *      Regular holders need to wait until sale is finalized.
     */
    modifier canTransfer() {
        require(transfersEnabled || msg.sender == owner || msg.sender == crowdsale);
        _;
    }

    modifier onlyCrowdsale() {
        require(msg.sender == crowdsale);
        _;
    }
    

    /**
     * @dev Constructor that sets a maximum supply cap.
     */
    function GdprCash() public 
                DetailedERC20(TOKEN_NAME, TOKEN_SYMBOL,TOKEN_DECIMALS)  
                CappedToken(TOTAL_SUPPLY_CAP) {

        // mints all possible tokens
        /*mint(owner, TOTAL_SUPPLY_CAP);
        finishMinting();

        // Genesis allocation of tokens
        transfer(EXPERTS_POOL_ADDR, EXPERTS_POOL_TOKENS);
        transfer(COMMUNITY_POOL_ADDR, COMMUNITY_POOL_TOKENS);
        transfer(TEAM_POOL_ADDR, TEAM_POOL_TOKENS);
        transfer(LEGAL_EXPENSES_ADDR, LEGAL_EXPENSES_TOKENS);*/
        mint(EXPERTS_POOL_ADDR, EXPERTS_POOL_TOKENS);
        mint(COMMUNITY_POOL_ADDR, COMMUNITY_POOL_TOKENS);
        mint(TEAM_POOL_ADDR, TEAM_POOL_TOKENS);
        mint(LEGAL_EXPENSES_ADDR, LEGAL_EXPENSES_TOKENS);
    }

    /**
     * @dev Checks modifier and allows transfer if tokens are not locked.
     * @param _to — The address to receive tokens
     */
    function transfer(address _to, uint256 _value)
        public canTransfer returns (bool)
    {
        return super.transfer(_to, _value);
    }

    /**
     * @dev Checks modifier and allows transfer if tokens are not locked.
     * @param _from — The address to send tokens from
     * @param _to — The address to receive tokens
     */
    function transferFrom(address _from, address _to, uint256 _value)
        public canTransfer returns (bool)
    {
        return super.transferFrom(_from, _to, _value);
    }   

    /**
     * @dev Enables token transfers.
     *      Called when the token sale is successfully finalized
     */
    function setCrowdsale(address _crowdsaleAddr) external onlyOwner {
        require(crowdsale == address(0));
        require(_crowdsaleAddr != address(0));
        require(!transfersEnabled);
        crowdsale = _crowdsaleAddr;
        mint(crowdsale, SALE_CAP);
        assert(totalSupply() == TOTAL_SUPPLY_CAP);
        finishMinting();
    }

    /**
     * @dev Enables token transfers.
     *      Called when the token sale is successfully finalized
     */
    function enableTransfers() public onlyCrowdsale {
        transfersEnabled = true;
        approve(crowdsale, 0);
    }

    /**
    * @dev Burns a specific number of tokens.
    * @param _value — The number of tokens to be burned.
    */
    function burn(uint256 _value) public onlyCrowdsale {
        require(_value <= balances[msg.sender]);

        address burner = msg.sender;
        balances[burner] = balances[burner].sub(_value);
        totalSupply_ = totalSupply_.sub(_value);
        Burn(burner, _value);
    }
}
