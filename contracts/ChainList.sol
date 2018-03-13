pragma solidity ^0.4.18;

contract ChainList {
  // state variables 
  address seller;
  address buyer;
  string name;
  string description;
  uint256 price;
  
  // events 
  event LogSellArticle(
    address indexed _seller,
    string _name,
    uint256 _price
    );
    
  event LogBuyArticle(
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price
    );
  
  // sell an article 
  function sellArticle(string _name, string _description, uint256 _price) public {
    seller = msg.sender;
    name = _name;
    description = _description;
    price = _price;
    
    LogSellArticle(seller, name, price);
  }
  
  // get an article 
  function getArticle() public view returns (
    address _seller,
    address _buyer,
    string _name,
    string _description,
    uint256 _price
  ) {
      return(seller, buyer, name, description, price);
  }
  
  // buy an article 
  function buyArticle() payable public {
    // check article exists
    require(seller != 0x0);
    // check article still available
    require(buyer == 0x0);
    // check buyer is not seller 
    require(msg.sender != seller);
    // check value sent equals price 
    require(msg.value == price);
    
    // track buyer's info
    buyer = msg.sender;
    
    // transfer value from buyer to seller 
    seller.transfer(msg.value);
    
    // trigger the event 
    LogBuyArticle(seller, buyer, name, price);
  }
}
