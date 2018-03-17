const ChainList = artifacts.require("./ChainList.sol");

// test suite 
contract('ChainList', accounts => {
  let chainListInstance;
  const seller = accounts[1];
  const buyer = accounts[2];
  const articleName = "Wacky Widget";
  const articleDescription = "Widget that is wacky"; 
  const articlePrice = web3.toWei(10);
  
  // No article for sale 
  it("should throw exception when buy article is attempted and no article is for sale", async () => {
    // Get contract instance 
    chainListInstance = await ChainList.deployed();
    // Attempt to buy non-existent article     
    try {
      await chainListInstance.buyArticle(1, { 
        from: buyer, 
        value: articlePrice
      });
    } catch (error) {
      // If error then test passed
      assert(true);
      return;
    }
    // If no error, test failed
    assert.fail;            
  });
  
  // Article Id does not exist 
  it("should throw an exception when buy article is attempted with non-existent article Id", async () => {
    // Get contract instance 
    chainListInstance = await ChainList.deployed();
    // Sell article 
    await chainListInstance.sellArticle(
      articleName, 
      articleDescription, 
      articlePrice, 
      { from: seller}
    );
    
    // Attempt to buy article with non-existent id      
    try {
      await chainListInstance.buyArticle(2, { 
        from: buyer, 
        value: articlePrice
      });
    } catch (error) {
      // If error then test passed
      assert(true);
      // Check buyer property of article for sale
      const article = await chainListInstance.articles(1);
      assert.equal(article[2], 0x0, "buyer should be empty")
      return;
    }
    // If no error, test failed
    assert.fail;    
  });       
  
  // Seller attempts to buy own article 
  it("should throw exception when seller attempts to buy own article", () => {
    return ChainList.deployed()
      .then(instance => {
        chainListInstance = instance;
        return chainListInstance.buyArticle(1, {
          from: seller, 
          value: articlePrice
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
        assert.equal(data[5].toNumber(), articlePrice, `article price must be ${articlePrice}`);
    });
  });  
  
  // Buyer sends wrong price 
  it("should throw exception if buyer does not send correct value", () => {
    return ChainList.deployed()
      .then(instance => {
        chainListInstance = instance;
        return chainListInstance.buyArticle(1, { 
          from: buyer, 
          value: articlePrice - web3.toWei(1, "ether") 
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
        assert.equal(data[5].toNumber(), articlePrice, `article price must be ${articlePrice}`);
    });
  });  

  // Article already bought 
  it("should throw exception if article was already purchased", () => {
    return ChainList.deployed()
      .then(instance => {
        chainListInstance = instance;
        return chainListInstance.buyArticle(1, { 
          from: buyer, 
          value: articlePrice 
        });
      })
      .then(() => chainListInstance.buyArticle(1, { 
        from: web3.eth.accounts[0], 
        value: articlePrice 
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
        assert.equal(data[5].toNumber(), articlePrice, `article price must be ${articlePrice}`);
    });
  });  
});