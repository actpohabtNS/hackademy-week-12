import React from "react";

export function NoTokensMessage({ tokenSymbol }) {
  return (
    <>
      <h4>Buy Tokens ({tokenSymbol})</h4>
      <p>You don't have currency to buy tokens</p>
      <p>
        To get some tokens, go to corresponding faucet and get currency: 
        <br />
        <span>ETH: </span><a href="https://faucet.ropsten.be/">https://faucet.ropsten.be/</a>
        <br />
        <span>BNB: </span><a href="https://testnet.binance.org/faucet-smart">https://testnet.binance.org/faucet-smart</a>
      </p>
    </>
  );
}
