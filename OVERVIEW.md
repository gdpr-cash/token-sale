https://gdpr.cash

# GDPR Cash contract main structure

## Contracts

* GdprConfig
* GdprCash
* GdprCrowdsale

### GdprConfig

Holds all settings for the token and the crowdsale, such as the cap, the token distribution etc.

### GdprCash

The token itself defined as a standard ERC20 token with few extensions - it is burnable and is capped. Transfers are by default disabled, and are enabled after the crowdsale is finalized.

### GdprCrowdsale

The contract dealing with the crowdsale process. It is limited in time and is pausable. Participant must send their contributions directly to this contract. However their tokens will be locked until the sale is over. After that all unsold tokens will be burned and the transfers will be unlocked.
The participation is limited especially on day 1.

## GdprCrowdsale Contract Overview

Besides the parameters "hard-coded" in `GdprConfig`, the following parameters are passed to the Crowdsale contract at deployment time:

* Start time
* End time
* Token address

### Initial allocation of tokens

At token contract deployment time, and according to our terms, a percentage of tokens is splitted among certain addresses, namely:

* Experts pool: 10% (to incentivize our experts)
* Marketing pool: 10% (for marketing expenses)
* Legal expenses: 1%
* Team pool: 9% 
* Reserve: 10% (for marketplace bootstrapping)

The remaining 60% are available for pre-sale and crowd-sale.

### Stages of the token sale

#### Pre-sale:

All pre-sale is done privately and "off-chain". After participants' KYC status is verified, SelfKey admins manually calculate the corresponding token allocation, and then `crowdsaleContract` owner should invoke the `addPrecommitment` function to allocate the tokens to the beneficiary.

A parameter is provided to the `addPrecommitment` method so that "half-vesting" is optionally applied to a pre-commitment participant, meaning half of their allocated tokens are to be "time-locked" for a period of 6 months.

#### Sale:

Sale is enabled at `start date` which means it starts receiving any payments done directly to the contract address. The tokens corresponding to each participant are held by the contract until the sale is finalized. All contributions (in ETH) are held by the `KYCRefundVault` contract and no one (not even the crowdsale contract owner) can withdraw these funds. Only by successfully finalizing the crowdsale does the crowdsale owner have access to the funds raised.

Participants' KYC status is by default "unverified". KYC verification can occur at any time, authorizing the transfer of tokens to the corresponding wallet, or refunding in case of KYC rejection.

#### Finalization:

Finalization is manually triggered by the contract owner. This is even valid to occur before the set `end date`. Finalization process merely verifies the goal was reached or not, and invokes the `KYCRefundVault` for transfer of funds to the contract owner in case of successful crowdsale. Otherwise (the goal was not reached), the vault is enabled for refund claims.

All unsold tokens are "burned", meaning they are destroyed and substracted from the total supply.

**Note:** Any contributors' addresses still pending for KYC verification (meaning the necessary identity data was not provided yet) are considered as "rejected" when the `finalize()` method is invoked. All those automatically rejected cases are enabled for refund and the corresponding tokens burned. After crowdsale finalization, no pending KYC cases are left uncleared.

# Additional notes

* All tokens are being generated at deployment time, being held by the `SelfKeyCrowdsale` contract for due management. No more tokens can be minted after contract deployment.
* When KYC is rejected for a given participant, the whole purchase is rolled-back and all contributed ETH from this participant is put into "refundable" mode, substracting its amount from all crowdsale variables, which means such participant _must_ claim such refund even if he/she is KYC-verified for later purchases as the corresponding contributed funds are "taken apart" from the crowdsale for refund.
* Participants can be KYC-rejected and then make another purchase while trying to get their KYC data re-checked. In that case, `verifyKYC`/`rejectKYC` needs to be invoked again with such address.

# Conclusion

This is a brief summary of the KEY token sale functioning at the moment of this writing. At this point, the desired behavior of the aforementioned contracts is subject to change for enhancement of the system until it's ready for official launch. Still security audits and subsequent discussion and adjustments are expected.
