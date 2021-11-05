import React from "react";

export function OwhBalanceOf({ owhBalanceOf }) {
  return (
    <div>
      <h4>Check owh balance</h4>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          const formData = new FormData(event.target);
          const account = formData.get("account");

          if (account) {
            owhBalanceOf(account);
          }
        }}
      >
        <div className="form-group">
          <label>Account address</label>
          <input className="form-control" type="text" name="account" required />
        </div>
        <div className="form-group mt-3">
          <input className="btn btn-primary" type="submit" value="Check" />
        </div>
      </form>
    </div>
  );
}