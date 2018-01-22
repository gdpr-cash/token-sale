// Quantstamp Technologies Inc. (info@quantstamp.com)

pragma solidity ^0.4.17;

import '../GDPRCashSale.sol';

/**
 * The QuantstampSale smart contract is used for selling QuantstampToken
 * tokens (QSP). It does so by converting ETH received into a quantity of
 * tokens that are transferred to the contributor via the ERC20-compatible
 * transferFrom() function.
 */
contract GDPRCashSaleMock is GDPRCashSale {

    uint public _now;

    function GDPRCashSaleMock(
        address ifSuccessfulSendTo,
        uint fundingGoalInEthers,
        uint fundingCapInEthers,
        uint minimumContributionInWei,
        uint start,
        uint durationInMinutes,
        uint rateQspToEther,
        address addressOfTokenUsedAsReward
    ) GDPRCashSale(ifSuccessfulSendTo, fundingGoalInEthers, fundingCapInEthers,
                     minimumContributionInWei, start, durationInMinutes, rateQspToEther,
                     addressOfTokenUsedAsReward) { 
        _now = start + 1;
    }

    function currentTime() internal constant returns (uint) {
        return _now;
    }

    event HitLine(uint key, uint val);

    function changeTime(uint _newTime) onlyOwner external {
        HitLine(123, _newTime);
        _now = _newTime;
    }
}
