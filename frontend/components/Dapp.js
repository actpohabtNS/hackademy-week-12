import React from "react";

import { ethers } from "ethers";

import TokenArtifact from "../contracts/Token.json";
import contractAddresses from "../contracts/contract-address.json";

import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { BuyTokens } from "./BuyTokens";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import { NoTokensMessage } from "./NoTokensMessage";
import { OwhBalanceOf } from "./OwhBalanceOf";

const BSC_NETWORK_ID = '97';
const ROPSTEN_NETWORK_ID = '3';

const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

export default class Dapp extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      tokenData: undefined,
      
      selectedAddress: undefined,
      balance: undefined,
      tokenBalance: undefined,
      totalSupply: undefined,

      owhBalance: undefined,
      
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    };

    this.state = this.initialState;
  }

  render() {
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet 
          connectWallet={() => this._connectWallet()} 
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    if (!this.state.tokenData || !this.state.tokenBalance) {
      return <Loading />;
    }
    
    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>
              {this.state.tokenData.name} ({this.state.tokenData.symbol}){" - "}
              <span
                style={{
                  color: "#009e12"
                }}
              >
                connected to {window.ethereum.networkVersion === BSC_NETWORK_ID ? "Binance Smart Chain testnet" : "Ropsten Testnet"}
              </span>
            </h1>
            <h5>
              Total supply: {this.state.totalSupply.toString()}, price: {this.state.tokenData.price.toString()} tokens per ETH/BNB
            </h5>

            <hr />

            <p>
              Welcome <b>{this.state.selectedAddress}</b>, you have{" "}
              <b>
                {this.state.tokenBalance.toString()} {this.state.tokenData.symbol}
              </b>
              {" and "}
              <b>
                {this.state.balance.toString()} {window.ethereum.networkVersion === BSC_NETWORK_ID ? "BNB" : "ETH"}
              </b>
              .
            </p>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-12">
            {this.state.txBeingSent && (
              <WaitingForTransactionMessage txHash={this.state.txBeingSent} />
            )}

            {this.state.transactionError && (
              <TransactionErrorMessage
                message={this._getRpcErrorMessage(this.state.transactionError)}
                dismiss={() => this._dismissTransactionError()}
              />
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            {this.state.tokenBalance.eq(0) && (
              <NoTokensMessage selectedAddress={this.state.selectedAddress} />
            )}

            {this.state.tokenBalance.gt(0) && (
              <BuyTokens
                buyToken={(amount) =>
                  this._buyToken(amount)
                }
                tokenSymbol={this.state.tokenData.symbol}
              />
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <OwhBalanceOf
              owhBalanceOf={(address) => this._owhBalanceOf(address)}
            />

            {
              this.state.owhBalance &&
              <p className="mt-3">
                {this.state.owhBalance.address} has {this.state.owhBalance.balance.toString()} owh tokens!
              </p>
            }
          </div>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    this._stopPollingData();
  }

  async _connectWallet() {
    const [selectedAddress] = await window.ethereum.enable();

    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(selectedAddress);
    
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      this._stopPollingData();
     
      if (newAddress === undefined) {
        return this._resetState();
      }
      
      this._initialize(newAddress);
    });
    
    window.ethereum.on("networkChanged", ([networkId]) => {
      this._stopPollingData();
      this._resetState();
    });
  }

  _initialize(userAddress) {
    this.setState({
      selectedAddress: userAddress,
    });

    this._intializeEthers();
    this._getTokenData();
    this._startPollingData();
  }

  async _intializeEthers() {
    
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    const netId = window.ethereum.networkVersion;

    const contractAddress = netId === ROPSTEN_NETWORK_ID ?
      contractAddresses.Ropsten : contractAddresses.BSC
    
    this._token = new ethers.Contract(
      contractAddress,
      TokenArtifact.abi,
      this._provider.getSigner(0)
    );
  }

  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateBalanceSupply(), 1000);
    this._updateBalanceSupply();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }
  
  async _getTokenData() {
    const name = await this._token.name();
    const symbol = await this._token.symbol();
    const price = await this._token.tokenPrice();
    this.setState({ tokenData: { name, symbol, price } });
  }

  async _updateBalanceSupply() {
    const tokenBalance = await this._token.balanceOf(this.state.selectedAddress);
    let balance = await this._provider.getBalance(this.state.selectedAddress);
    balance = ethers.utils.formatEther(balance);
    const totalSupply = await this._token.totalSupply();
    this.setState({ tokenBalance, totalSupply, balance });
  }

  async _buyToken(amount) {
    try {
      this._dismissTransactionError();

      const tx = await this._provider.getSigner().sendTransaction({
        to: this._token.address,
        value: ethers.utils.parseEther("" + amount / this.state.tokenData.price)
      })

      this.setState({ txBeingSent: tx.hash });

      const receipt = await tx.wait();

      if (receipt.status === 0) { 
        throw new Error("Transaction failed");
      }

      await this._updateBalanceSupply();

    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      
      console.error(error);
      this.setState({ transactionError: error });

    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }

  async _owhBalanceOf(address) {

    try { 
      this._dismissTransactionError();
      this.setState({ owhBalance: undefined });

      const tx = await this._token.owhBalanceOf(address);
      this.setState({ txBeingSent: tx.hash });

      this.setState({ owhBalance: { address, balance: tx.toNumber() } });

    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      console.error(error);
      this.setState({ transactionError: error });

    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }

  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  _resetState() {
    this.setState(this.initialState);
  }

  _checkNetwork() {
    const netId = window.ethereum.networkVersion;
    if (netId === BSC_NETWORK_ID || netId === ROPSTEN_NETWORK_ID) {
      return true;
    }

    this.setState({ 
      networkError: 'Please connect Metamask to BSC Testnet or Ropsten Testnet'
    });

    return false;
  }
}
