const ChainList = artifacts.require("./ChainList.sol");

// test suite
contract('ChainList', function(accounts){
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

  it("should initialized contract with empty values", async () => {
    chainListInstance = await ChainList.deployed();
  
    articleCount = await chainListInstance.getArticleCount();
    assert.equal(articleCount.toNumber(), 0, 'number of articles must be zero');
    
    articlesForSale = await chainListInstance.getArticlesForSale();
    assert.equal(articlesForSale.length, 0, "there shouldn't be any article for sale");
  });    

  // Sell an article 
  it("should list an article for sale", async () => {
    chainListInstance = await ChainList.deployed();    
    
    const receipt = await chainListInstance.sellArticle(
      articleName1,
      articleDescription1,
      web3.toWei(articlePrice1, "ether"),
      {from: seller}
    );
    
    const { _id, _seller, _name, _price } = receipt.logs[0].args;
    assert.equal(receipt.logs.length, 1, "one event should have been triggered");
    assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
    assert.equal(_id.toNumber(), 1, "id must be 1");
    assert.equal(_seller, seller, "event seller must be " + seller);
    assert.equal(_name, articleName1, "event article name must be " + articleName1);
    assert.equal(_price.toNumber(), web3.toWei(articlePrice1, "ether"), "event article price must be " + web3.toWei(articlePrice1, "ether"));
    
    articleCount = await chainListInstance.getArticleCount();
    assert.equal(articleCount, 1, "number of articles must be one");
    
    articlesForSale = await chainListInstance.getArticlesForSale();   
    assert.equal(articlesForSale.length, 1, "there must be one article for sale");
    assert.equal(articlesForSale[0].toNumber(), 1, "article id must be 1"); 
    
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
    chainListInstance = await ChainList.deployed();    
    
    const receipt = await chainListInstance.sellArticle(
      articleName2,
      articleDescription2,
      web3.toWei(articlePrice2, "ether"),
      {from: seller}
    );
    
    const { _id, _seller, _name, _price } = receipt.logs[0].args;
    assert.equal(receipt.logs.length, 1, "one event should have been triggered");
    assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
    assert.equal(_id.toNumber(), 2, "id must be 2");
    assert.equal(_seller, seller, "event seller must be " + seller);
    assert.equal(_name, articleName2, "event article name must be " + articleName2);
    assert.equal(_price.toNumber(), web3.toWei(articlePrice2, "ether"), "event article price must be " + web3.toWei(articlePrice2, "ether"));
    
    articleCount = await chainListInstance.getArticleCount();
    assert.equal(articleCount, 2, "number of articles must be 2");
    
    articlesForSale = await chainListInstance.getArticlesForSale();   
    assert.equal(articlesForSale.length, 2, "there must be 2 articles for sale");
    assert.equal(articlesForSale[1].toNumber(), 2, "article id must be 2"); 
    
    let article = await chainListInstance.articles(articlesForSale[1]);
    assert.equal(article[0].toNumber(), 2, "article id must be 2");
    assert.equal(article[1], seller, "seller must be " + seller);
    assert.equal(article[2], 0x0, "buyer must be empty");
    assert.equal(article[3], articleName2, "article name must be " + articleName2);
    assert.equal(article[4], articleDescription2, "article description must be " + articleDescription2);
    assert.equal(article[5].toNumber(), web3.toWei(articlePrice2, "ether"), "article price must be " + web3.toWei(articlePrice2, "ether"));    
  });

  // buy the first article
  it("should buy an article", function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      // record balances of seller and buyer before the buy
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
      return chainListInstance.buyArticle(1, {
        from: buyer,
        value: web3.toWei(articlePrice1, "ether")
      });
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogBuyArticle", "event should be LogBuyArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "article id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer must be " + buyer);
      assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event article price must be " + web3.toWei(articlePrice1, "ether"));

      // record balances of buyer and seller after the buy
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      // check the effect of buy on balances of buyer and seller, accounting for gas
      assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, "seller should have earned " + articlePrice1 + " ETH");
      assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, "buyer should have spent " + articlePrice1 + " ETH");

      return chainListInstance.getArticlesForSale();
    }).then(function(data){
      assert.equal(data.length, 1, "there should now be only 1 article left for sale");
      assert.equal(data[0].toNumber(), 2, "article 2 should be the only article left for sale");

      return chainListInstance.getArticleCount();
    }).then(function(data){
      assert.equal(data.toNumber(), 2, "there should still be 2 articles in total");
    });
  });
});
