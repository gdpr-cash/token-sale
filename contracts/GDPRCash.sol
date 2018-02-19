pragma solidity ^0.4.19;

import 'zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol';
import 'zeppelin-solidity/contracts/token/ERC20/CappedToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';


/**
 * @title SelfKeyToken
 * @dev SelfKey Token implementation.
 */
contract GDPRCash is DetailedERC20, CappedToken, BurnableToken {

    bool private transfersEnabled = false;

    /**
     * @dev Only the contract owner can transfer without restrictions.
     *      Regular holders need to wait until sale is finalized.
     * @param _sender — The address sending the tokens
     * @param _value — The number of tokens to send
     */
    modifier canTransfer(address _sender, uint256 _value) {
        require(transfersEnabled || _sender == owner);
        _;
    }

    /**
     * @dev Constructor that sets a maximum supply cap.
     * @param _cap — The maximum supply cap.
     */
    function GDPRCash(uint256 _cap) public 
                DetailedERC20('Character1', 'CHR1', 18)  
                CappedToken(_cap) {
    }

    /**
     * @dev Checks modifier and allows transfer if tokens are not locked.
     * @param _to — The address to receive tokens
     * @param _value — The number of tokens to send
     */
    function transfer(address _to, uint256 _value)
        public canTransfer(msg.sender, _value) returns (bool)
    {
        return super.transfer(_to, _value);
    }

    /**
     * @dev Checks modifier and allows transfer if tokens are not locked.
     * @param _from — The address to send tokens from
     * @param _to — The address to receive tokens
     * @param _value — The number of tokens to send
     */
    function transferFrom(address _from, address _to, uint256 _value)
        public canTransfer(_from, _value) returns (bool)
    {
        return super.transferFrom(_from, _to, _value);
    }

    /**
     * @dev Enables token transfers.
     *      Called when the token sale is successfully finalized
     */
    function enableTransfers() public onlyOwner {
        transfersEnabled = true;
    }
}
