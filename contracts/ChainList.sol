pragma solidity ^0.4.18;

contract ChainList {
  // custom types 
  struct Article {
    uint id;
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price;    
  }

  // state variables 
  mapping (uint => Article) public articles;
  uint articleCounter;
  
  // events 
  event LogSellArticle(
    uint indexed _id,
    address indexed _seller,
    string _name,
    uint256 _price
    );
    
  event LogBuyArticle(
    uint indexed _id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price
    );
  
  // sell an article 
  function sellArticle(string _name, string _description, uint256 _price) public {
    // increment counter 
    articleCounter++;
    // instantiate and store new Article
    articles[articleCounter] = Article(
      articleCounter,
      msg.sender,
      0x0,
      _name,
      _description,
      _price
    );
    
    LogSellArticle(articleCounter, msg.sender, _name, _price);
  }
  
  // fetch number of articles 
  function getArticleCount() public view returns(uint) {
    return articleCounter;
  }
  
  // fetch ids of available articles 
  function getArticlesForSale() public view returns(uint []) {
    // prepare output array
    uint[] memory articleIds = new uint[](articleCounter);
    // initialize index variable
    uint numberOfArticlesForSale = 0;    
    // iterate over articles 
    for (uint i = 1; i <= articleCounter; i++) {
      // keep id if article has not been bought
      if (articles[i].buyer == 0x0) {
        articleIds[numberOfArticlesForSale] = articles[i].id;
        numberOfArticlesForSale++;
      }
    }
    
    // copy id array into for sale array 
    uint[] memory forSale = new uint[](numberOfArticlesForSale);
    for (uint j = 0; j < numberOfArticlesForSale; j++) {
      forSale[j] = articleIds[j];
    }
    
    return forSale;
  }
  
  // buy an article 
  function buyArticle(uint _id) payable public {
    // check there is an article for sale
    require(articleCounter > 0);
    // check that id is within parameters 
    require(_id > 0 && _id <= articleCounter);
    // retrieve article from mapping 
    Article storage article = articles[_id];    
    // check article still available
    require(article.buyer == 0x0);
    // check buyer is not seller 
    require(msg.sender != article.seller);
    // check value sent equals price 
    require(msg.value == article.price);
    
    // track buyer's info
    article.buyer = msg.sender;
    
    // transfer value from buyer to seller 
    article.seller.transfer(msg.value);
    
    // trigger the event 
    LogBuyArticle(
      _id,
      article.seller, 
      article.buyer, 
      article.name, 
      article.price
    );
  }
}
