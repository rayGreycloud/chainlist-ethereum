const ChainList = artifacts.require("./ChainList.sol");

// test suite 
contract('ChainList', accounts => {
  let chainListInstance;
  const seller = accounts[1];
  const buyer = accounts[2];
  const articleName = "Wacky Widget";
  const articleDescription = "Widget that is wacky"; 
  const articlePrice = 10;
  let sellerBalanceBefore, sellerBalanceAfter;
  let buyerBalanceBefore, buyerBalanceAfter;

  it("should be initialized with empty values", () => {
    return ChainList.deployed()
      .then(instance => instance.getArticle())
      .then(data => {
        assert.equal(data[0], 0x0, "seller must be empty");
        assert.equal(data[1], 0x0, "buyer must be empty");
        assert.equal(data[2], "", "article name must be empty");
        assert.equal(data[3], "", "article description must be empty");
        assert.equal(data[4].toNumber(), 0, "article price must be empty");
      });
  });
  
  it("should sell an article", () => {
    return ChainList.deployed()
      .then(instance => {
        chainListInstance = instance;
        chainListInstance.sellArticle(
          articleName,
          articleDescription,
          web3.toWei(articlePrice, "ether"),
          { from: seller }
        );
      })
      .then(() => chainListInstance.getArticle())
      .then(data => {
        assert.equal(data[0], seller, `seller must be ${seller}`);
        assert.equal(data[1], 0x0, `buyer must be empty`);
        assert.equal(data[2], articleName, `article name must be ${articleName}`);
        assert.equal(data[3], articleDescription, `article description must be ${articleDescription}`);
        assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), `article price must be ${articlePrice}`);
      });
  });
  // Using article for sale from previous test   
  it("should buy an article", () => {
    return ChainList.deployed()
      .then(instance => {
        chainListInstance = instance;
        // Get balances 
        sellerBalanceBefore = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
        buyerBalanceBefore = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
        // Buy article 
        return chainListInstance.buyArticle({ 
          from: buyer, 
          value: web3.toWei(articlePrice, "ether") 
        });
      })
      .then(receipt => {
        assert.equal(receipt.logs.length, 1, "one event should be triggered");
        assert.equal(receipt.logs[0].event, "LogBuyArticle", "event should be LogBuyArticle");
        assert.equal(receipt.logs[0].args._seller, seller, "event seller should be " + seller);
        assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer should be " + buyer);
        assert.equal(receipt.logs[0].args._name, articleName, "event name should be " + articleName);
        assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice, "ether"), "event price should be " + web3.toWei(articlePrice, "ether"));
        
        // Get balances after transaction
        sellerBalanceAfter = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
        buyerBalanceAfter = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();   
        
        assert(sellerBalanceAfter == sellerBalanceBefore + articlePrice, "seller balance should increase by price amount"); 
        assert(buyerBalanceAfter <= buyerBalanceBefore - articlePrice, "buyer balance should decrease by price amount + some gas");
        
        return chainListInstance.getArticle();        
      })
      .then(data => {
        assert.equal(data[0], seller, `seller must be ${seller}`);
        assert.equal(data[1], buyer, `buyer must be ${buyer}`);
        assert.equal(data[2], articleName, `article name must be ${articleName}`);
        assert.equal(data[3], articleDescription, `article description must be ${articleDescription}`);
        assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), `article price must be ${articlePrice}`);
      });  
  });
  
  it("should trigger event when new article is sold", () => {
    return ChainList.deployed()
      .then(instance => {
        chainListInstance = instance;        
        return chainListInstance.sellArticle(
          articleName,
          articleDescription,
          web3.toWei(articlePrice, "ether"),
          { from: seller }
        );
      })    
      .then(receipt => {  
        assert.equal(receipt.logs.length, 1, "one event should be triggered");
        assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
        assert.equal(receipt.logs[0].args._seller, seller, "event seller should be " + seller);
        assert.equal(receipt.logs[0].args._name, articleName, "event name should be " + articleName);
        assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice, "ether"), "event price should be " + web3.toWei(articlePrice, "ether"));      
      });
  });
  

  
});
