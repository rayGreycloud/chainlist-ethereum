const ChainList = artifacts.require("./ChainList.sol");

// test suite 
contract('ChainList', accounts => {
  let chainListInstance;
  const seller = accounts[1];
  const articleName = "Article 1";
  const articleDescription = "Description of article 1"; 
  const articlePrice = 10;

  it("should be initialized with empty values", () => {
    return ChainList.deployed()
      .then(instance => instance.getArticle())
      .then(data => {
        assert.equal(data[0], 0x0, "seller must be empty");
        assert.equal(data[1], "", "article name must be empty");
        assert.equal(data[2], "", "article description must be empty");
        assert.equal(data[3].toNumber(), 0, "article price must be empty");
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
        assert.equal(data[1], articleName, `article name must be ${articleName}`);
        assert.equal(data[2], articleDescription, `article description must be ${articleDescription}`);
        assert.equal(data[3].toNumber(), web3.toWei(articlePrice, "ether"), `article price must be ${articlePrice}`);
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
