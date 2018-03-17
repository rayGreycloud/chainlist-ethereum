const ChainList = artifacts.require("./ChainList.sol");

// test suite 
contract('ChainList', accounts => {
  let chainListInstance;
  const seller = accounts[1];
  const buyer = accounts[2];
  const articleName = "Wacky Widget";
  const articleDescription = "Widget that is wacky"; 
  const articlePrice = 10;
  
  // No article for sale 
  it("should throw exception when buy article is attempted and no article is for sale", () => {
    return ChainList.deployed()
      .then(instance => {
        chainListInstance = instance;
        return chainListInstance.buyArticle(1, { 
          from: buyer, 
          value: web3.toWei(articlePrice, "ether") 
        });
      })
      // If here then test failed
      .then(assert.fail)
      // Expected error passes test
      .catch(error => assert(true))
      // Check article unchanged
      .then(() => chainListInstance.getArticleCount())
      .then(data => {
        assert.equal(data.toNumber(), 0, "number of articles should be zero");
      });          
  });
  
  // Article Id does not exist 
  it("should throw an exception when buy article is attempted with non-existent article Id", () => {
    return ChainList.deployed()
      .then(instance => {
        chainListInstance = instance;
        return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), { from: seller});
      })    
      .then(receipt => {
        return chainListInstance.buyArticle(2, {
          from: seller, 
          value: web3.toWei(articlePrice, "ether")});
      })
      .then(assert.fail)
      .catch(error => {
        assert(true);
      })
      .then(() => chainListInstance.articles(1))
      .then(data => {
        assert.equal(data[2], 0x0, "buyer should be empty");
      });
  });
  
  // Seller attempts to buy own article 
  it("should throw exception when seller attempts to buy own article", () => {
    return ChainList.deployed()
      .then(instance => {
        chainListInstance = instance;
        return chainListInstance.buyArticle(1, {
          from: seller, 
          value: web3.toWei(articlePrice, "ether")});
      })
      .then(assert.fail)
      .catch(error => {
        assert(true);
      })
      .then(() => chainListInstance.articles(1))
      .then(data => {
        assert.equal(data[0].toNumber(), 1, "article id must be 1");        
        assert.equal(data[1], seller, `seller must be ${seller}`);
        assert.equal(data[2], 0x0, `buyer must be empty`);
        assert.equal(data[3], articleName, `article name must be ${articleName}`);
        assert.equal(data[4], articleDescription, `article description must be ${articleDescription}`);
        assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), `article price must be ${web3.toWei(articlePrice, "ether")}`);
    });
  });  
  
  // Buyer sends wrong price 
  it("should throw exception if buyer does not send correct value", () => {
    return ChainList.deployed()
      .then(instance => {
        chainListInstance = instance;
        return chainListInstance.buyArticle(1, { 
          from: buyer, 
          value: web3.toWei(articlePrice - 1, "ether") 
        });
      })
      .then(assert.fail)
      .catch(error => {
        assert(true);
      })
      .then(() => chainListInstance.articles(1))
      .then(data => {
        assert.equal(data[0].toNumber(), 1, "article id must be 1");        
        assert.equal(data[1], seller, `seller must be ${seller}`);
        assert.equal(data[2], 0x0, `buyer must be empty`);
        assert.equal(data[3], articleName, `article name must be ${articleName}`);
        assert.equal(data[4], articleDescription, `article description must be ${articleDescription}`);
        assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), `article price must be ${web3.toWei(articlePrice, "ether")}`);
    });
  });  

  // Article already bought 
  it("should throw exception if article was already purchased", () => {
    return ChainList.deployed()
      .then(instance => {
        chainListInstance = instance;
        return chainListInstance.buyArticle(1, { 
          from: buyer, 
          value: web3.toWei(articlePrice, "ether") 
        });
      })
      .then(() => chainListInstance.buyArticle(1, { 
        from: web3.eth.accounts[0], 
        value: web3.toWei(articlePrice, "ether") 
      }))
      .then(assert.fail)
      .catch(error => {
        assert(true);
      })
      .then(() => chainListInstance.articles(1))
      .then(data => {
        assert.equal(data[0].toNumber(), 1, "article id must be 1");        
        assert.equal(data[1], seller, `seller must be ${seller}`);
        assert.equal(data[2], buyer, `buyer must be ${buyer}`);
        assert.equal(data[3], articleName, `article name must be ${articleName}`);
        assert.equal(data[4], articleDescription, `article description must be ${articleDescription}`);
        assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), `article price must be ${web3.toWei(articlePrice, "ether")}`);
    });
  });  
});