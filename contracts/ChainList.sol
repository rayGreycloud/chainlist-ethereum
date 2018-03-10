pragma solidity ^0.4.18;

contract ChainList {
  // state variables 
  address seller;
  string name;
  string description;
  uint256 price;
  
  // constructor
  function ChainList() public {
    sellArticle("Wacky Widget", "This is the default article", 10 ether);
  }
  
  // sell an article 
  function sellArticle(string _name, string _description, uint256 _price) public {
    seller = msg.sender;
    name = _name;
    description = _description;
    price = _price;
  }
  
  // get an article 
  function getArticle() public view returns (
    address _seller,
    string _name,
    string _description,
    uint256 _price
  ) {
      return(seller, name, description, price);
  }
}
