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

All tokens are being generated at deployment time. No more tokens can be minted after contract deployment.

At token contract deployment time, and according to our terms, a percentage of tokens is splitted among certain addresses, namely:

* Experts pool: 10% (to incentivize our experts)
* Marketing pool: 10% (for marketing expenses)
* Legal expenses: 1%
* Team pool: 9% 
* Reserve: 10% (for marketplace bootstrapping)

The remaining 60% are available for pre-sale and crowd-sale.

### Stages of the token sale

#### Pre-sale:

All pre-sale is done privately and "off-chain". After participants' are verified, our staff manually calculate the corresponding token allocation, and then `GdprCrowdsale` contract owner should invoke the `addPresaleOrder` function to allocate the tokens to the beneficiary.

#### Sale:

Sale is enabled at `start date` which means it starts receiving any payments done directly to the contract address. 
The contributor just need to send ether to the crowdsale contract and will receive tokens converted due to the current rate. The rate is set by the owner and follows the pattern defined in the token sale terms. 
There is a limit of the minimum and maximum amount of tokens one can purchase. These limits are defined in the GdprConfig contract. The first day of the contract the maximum limit is even lower.
The crowdsale can be finalized after `end date` and then the transfers are enabled.
All unsold tokens are "burned", meaning they are destroyed and substracted from the total supply.

# Conclusion

This is a brief summary of the GDPR.CASH token sale functioning at the moment of this writing. At this point, the desired behavior of the aforementioned contracts is subject to change for enhancement of the system until it's ready for official launch. 

# Credits

Thanks the Selfkey team (https://github.com/SelfKeyFoundation/selfkey-token) for some of the ideas in these contracts. 