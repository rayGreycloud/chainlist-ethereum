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
        return chainListInstance.buyArticle({ 
          from: buyer, 
          value: web3.toWei(articlePrice, "ether") 
        });
      })
      // If here then test failed
      .then(assert.fail)
      // Expected error passes test
      .catch(error => assert(true))
      // Check article unchanged
      .then(() => chainListInstance.getArticle())
      .then(data => {
        assert.equal(data[0], 0x0, "seller must be empty");
        assert.equal(data[1], 0x0, "buyer must be empty");
        assert.equal(data[2], "", "article name must be empty");
        assert.equal(data[3], "", "article description must be empty");
        assert.equal(data[4].toNumber(), 0, "article price must be empty");
      });          
  });
  
  // Seller attempts to buy 
  it("should throw exception when seller attempts to buy own article", () => {
    return ChainList.deployed()
      .then(instance => {
        chainListInstance = instance;
        return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), { from: seller});
      })
      .then(receipt => {
        return chainListInstance.buyArticle({from: seller, value: web3.toWei(articlePrice, "ether")});
      })
      .then(assert.fail)
      .catch(error => {
        assert(true);
      })
      .then(() => chainListInstance.getArticle())
      .then(data => {
        assert.equal(data[0], seller, `seller must be ${seller}`);
        assert.equal(data[1], 0x0, `buyer must be empty`);
        assert.equal(data[2], articleName, `article name must be ${articleName}`);
        assert.equal(data[3], articleDescription, `article description must be ${articleDescription}`);
        assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), `article price must be ${web3.toWei(articlePrice, "ether")}`);
    });
  });  
   
});