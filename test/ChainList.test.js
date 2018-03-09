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
  

});
