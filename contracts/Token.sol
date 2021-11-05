pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

interface owhToken {
    function balanceOf(address _owner) external view returns (uint256 balance);
}

contract Token is ERC20Upgradeable {
  uint private tokensPerETH;
  address public owner;
  address public owh;

  event BuyToken(address indexed sender, uint256 tokenAmount, uint256 price);

  function initialize() initializer public {
        __ERC20_init("Token", "TKN");
        _mint(msg.sender, 1000);
        tokensPerETH = 5000000;
        owner = msg.sender;
        owh = 0xA4465b289842FB8FA856b28236825220202FDe68;
     }

  function tokenPrice() view public returns (uint) {
    return tokensPerETH;
  }

  function owhBalanceOf(address _who) view external returns (uint256) {
    return owhToken(owh).balanceOf(_who);
  }

  receive() external payable {
    _mint(msg.sender, msg.value * tokensPerETH);
    emit BuyToken(msg.sender, msg.value * tokensPerETH, tokensPerETH);
  }
}
