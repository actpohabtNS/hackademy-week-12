import React from "react";

export function BuyTokens({ buyToken, tokenSymbol }) {
  return (
    <div className="mb-5">
      <h4>Buy Tokens ({tokenSymbol})</h4>
      <form
        onSubmit={(event) => {
          // This function just calls the transferTokens callback with the
          // form's data.
          event.preventDefault();

          const formData = new FormData(event.target);
          const amount = formData.get("amount");

          if (amount) {
            buyToken(amount);
          }
        }}
      >
        <div className="form-group">
          <label>Amount of {tokenSymbol}</label>
          <input
            className="form-control"
            type="number"
            step="1"
            name="amount"
            placeholder="1"
            required
          />
        </div>
        <div className="form-group mt-3">
          <input className="btn btn-primary" type="submit" value="Buy" />
        </div>
      </form>
    </div>
  );
}
