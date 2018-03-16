const ChainList = artifacts.require("./ChainList.sol");

// test suite
contract('ChainList', function(accounts){
  // Initialize test variables 
  let chainListInstance;
  let articleCount, 
      articlesForSale;
  const seller = accounts[1];
  const buyer = accounts[2];
  const articleName1 = "article 1";
  const articleDescription1 = "Description for article 1";
  const articlePrice1 = 10;
  const articleName2 = "article 2";
  const articleDescription2 = "Description for article 2";
  const articlePrice2 = 20;
  let sellerBalanceBeforeBuy, 
      sellerBalanceAfterBuy,
      buyerBalanceBeforeBuy, 
      buyerBalanceAfterBuy;
      
  // Balance retrieval method
  const getBalanceInEther = async account => { 
    let balance = await web3.eth.getBalance(account);
    return web3.fromWei(balance, "ether").toNumber();
  }  
      
  // Contract initialization
  it("should initialized contract with empty values", async () => {
    // Get contract instance 
    chainListInstance = await ChainList.deployed();
    // Check number of articles 
    articleCount = await chainListInstance.getArticleCount();
    assert.equal(articleCount.toNumber(), 0, 'number of articles must be zero');
    // Check number of articles for sale
    articlesForSale = await chainListInstance.getArticlesForSale();
    assert.equal(articlesForSale.length, 0, "there shouldn't be any article for sale");
  });    

  // Sell an article 
  it("should list an article for sale", async () => {
    // Get contract instance 
    chainListInstance = await ChainList.deployed();    
    // Sell article 
    const receipt = await chainListInstance.sellArticle(
      articleName1,
      articleDescription1,
      web3.toWei(articlePrice1, "ether"),
      {from: seller}
    );
    // Check transaction details 
    const { _id, _seller, _name, _price } = receipt.logs[0].args;
    assert.equal(receipt.logs.length, 1, "one event should have been triggered");
    assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
    assert.equal(_id.toNumber(), 1, "id must be 1");
    assert.equal(_seller, seller, "event seller must be " + seller);
    assert.equal(_name, articleName1, "event article name must be " + articleName1);
    assert.equal(_price.toNumber(), web3.toWei(articlePrice1, "ether"), "event article price must be " + web3.toWei(articlePrice1, "ether"));
    // Check number of articles 
    articleCount = await chainListInstance.getArticleCount();
    assert.equal(articleCount, 1, "number of articles must be one");
    // Check number of articles for sale 
    articlesForSale = await chainListInstance.getArticlesForSale();   
    assert.equal(articlesForSale.length, 1, "there must be one article for sale");
    assert.equal(articlesForSale[0].toNumber(), 1, "article id must be 1"); 
    // Check deatils of article for sale 
    let article = await chainListInstance.articles(articlesForSale[0]);
    assert.equal(article[0].toNumber(), 1, "article id must be 1");
    assert.equal(article[1], seller, "seller must be " + seller);
    assert.equal(article[2], 0x0, "buyer must be empty");
    assert.equal(article[3], articleName1, "article name must be " + articleName1);
    assert.equal(article[4], articleDescription1, "article description must be " + articleDescription1);
    assert.equal(article[5].toNumber(), web3.toWei(articlePrice1, "ether"), "article price must be " + web3.toWei(articlePrice1, "ether"));
  });    

  // List multiple articles for sale 
  it("should list second article for sale", async () => {
    // Get contract instance 
    chainListInstance = await ChainList.deployed();    
    // Sell article
    const receipt = await chainListInstance.sellArticle(
      articleName2,
      articleDescription2,
      web3.toWei(articlePrice2, "ether"),
      {from: seller}
    );
    // Check transaction details
    const { _id, _seller, _name, _price } = receipt.logs[0].args;
    assert.equal(receipt.logs.length, 1, "one event should have been triggered");
    assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
    assert.equal(_id.toNumber(), 2, "id must be 2");
    assert.equal(_seller, seller, "event seller must be " + seller);
    assert.equal(_name, articleName2, "event article name must be " + articleName2);
    assert.equal(_price.toNumber(), web3.toWei(articlePrice2, "ether"), "event article price must be " + web3.toWei(articlePrice2, "ether"));
    // Check number of articles 
    articleCount = await chainListInstance.getArticleCount();
    assert.equal(articleCount, 2, "number of articles must be 2");
    // Check number of articles for sale
    articlesForSale = await chainListInstance.getArticlesForSale();   
    assert.equal(articlesForSale.length, 2, "there must be 2 articles for sale");
    assert.equal(articlesForSale[1].toNumber(), 2, "article id must be 2"); 
    // Check details of second article for sale 
    let article = await chainListInstance.articles(articlesForSale[1]);
    assert.equal(article[0].toNumber(), 2, "article id must be 2");
    assert.equal(article[1], seller, "seller must be " + seller);
    assert.equal(article[2], 0x0, "buyer must be empty");
    assert.equal(article[3], articleName2, "article name must be " + articleName2);
    assert.equal(article[4], articleDescription2, "article description must be " + articleDescription2);
    assert.equal(article[5].toNumber(), web3.toWei(articlePrice2, "ether"), "article price must be " + web3.toWei(articlePrice2, "ether"));    
  });

  // Buy an article 
  it("should buy the specified article", async () => {
    // Get contract instance 
    chainListInstance = await ChainList.deployed();
    // Get balances before transaction 
    sellerBalanceBeforeBuy = await getBalanceInEther(seller);
    buyerBalanceBeforeBuy = await getBalanceInEther(buyer);

    // Buy article 
    const receipt = await chainListInstance.buyArticle(1, { 
      from: buyer, 
      value: web3.toWei(articlePrice1, "ether")
    });

    // Check transaction details
    const { _id, _seller, _buyer, _name, _price } = receipt.logs[0].args;
    assert.equal(receipt.logs.length, 1, "one event should have been triggered");
    assert.equal(receipt.logs[0].event, "LogBuyArticle", "event should be LogBuyArticle");
    assert.equal(_id.toNumber(), 1, "article id must be 1");
    assert.equal(_seller, seller, "event seller must be " + seller);
    assert.equal(_buyer, buyer, "event buyer must be " + buyer);
    assert.equal(_name, articleName1, "event article name must be " + articleName1);
    assert.equal(_price.toNumber(), web3.toWei(articlePrice1, "ether"), "event article price must be " + web3.toWei(articlePrice1, "ether"));    
    
    // Check balances after transaction
    sellerBalanceAfterBuy = await getBalanceInEther(seller);
    buyerBalanceAfterBuy = await getBalanceInEther(buyer);
    assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, "seller's balance should increase by " + articlePrice1 + " ETH");
    assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, "buyer's balance should decrease by " + articlePrice1 + " ETH");
    
    // Check number of articles 
    articleCount = await chainListInstance.getArticleCount(); 
    assert.equal(articleCount.toNumber(), 2, "there should still be 2 articles in total");    
    
    // Check number of articles for sale 
    articlesForSale = await chainListInstance.getArticlesForSale(); 
    assert.equal(articlesForSale.length, 1, "there should now be only 1 article for sale");
    assert.equal(articlesForSale[0].toNumber(), 2, "article 2 should be the article for sale");            
  });
});
