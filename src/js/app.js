App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // initialize web3 
    if (typeof web3 !== 'undefined') {
      // reuse provider from Metamask web3 object
      App.web3Provider = web3.currentProvider;
    } else {
      // create a new provider and plug into local node
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    
    // Display account info
    App.displayAccountInfo();
    
    return App.initContract();
  },

  displayAccountInfo: function() {
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $('#account').text(account);
        
        web3.eth.getBalance(account, function (err, balance) {
          $('#accountBalance').text(web3.fromWei(balance, 'ether') + ' ETH');
        });
      }
    }); 
  },
  
  initContract: function() {
    $.getJSON('ChainList.json', function (chainListArtifact) {
      // Get contract and instantiate contract 
      App.contracts.ChainList = TruffleContract(chainListArtifact);
      // Set provider 
      App.contracts.ChainList.setProvider(App.web3Provider);
      // Retrieve article(s) from contract 
      return App.reloadArticles();
    });
  },
  
  reloadArticles: function() {
    // refresh account info 
    App.displayAccountInfo();
    
    // retrieve the article placeholder and clear 
    $('#articlesRow').empty();
    
    App.contracts.ChainList.deployed()
      .then(instance => instance.getArticle())
      .then(article => {
        if (article[0] == 0x0) {
          // exit if no article 
          return;
        }
        
        // retrieve the article template and fill it
        let articleTemplate = $('#articleTemplate');
        articleTemplate.find('.panel-title').text(article[1]);
        articleTemplate.find('.article-description').text(article[2]);
        articleTemplate.find('.article-price').text(web3.fromWei(article[3], 'ether'));
        
        let seller = App.account == article[0] ? "You" : article[0];      
        articleTemplate.find('.article-seller').text(seller);
        
        // add this article 
        $('#articlesRow').append(articleTemplate.html());
      }).catch(function(err) {
        console.error(err.message);
      });
  },
  
  sellArticle: function () {
    // retrieve details of article 
    const _article_name = document.querySelector('#article_name').value;
    const _description = document.querySelector('#article_description').value;
    const _price = web3.toWei(
      parseFloat(document.querySelector('#article_price').value || 0), 
      'ether'
    );
    
    if ((_article_name.trim() == '') || (_price == 0)) {
      return false; // because nothing to sell
    }
    
    App.contracts.ChainList.deployed()
      .then(instance => instance.sellArticle(_article_name, _description, _price, { 
        from: App.account,
        gas: 500000
      }))
      .then(result => {
        // refresh UI
        App.reloadArticles();
      }).catch(err => console.error(err)); 
      
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
