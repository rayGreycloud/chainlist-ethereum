App = {
  // Global variables
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,
  
  // Initialize App 
  // init: function() {
  //   return App.initWeb3();
  // },
  init: () => App.initWeb3(),
  
  // Initialize web3 and set provider
  initWeb3: () => {
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
    // Next step, initialize contract
    return App.initContract();
  },
  
  // Display account info 
  // displayAccountInfo: async () => {
  //   try {  
  //     const account = await web3.eth.getCoinbase();
  //     App.account = account;
  //     document.querySelector('#account').textContent = account;
  //     // $('#account').text(account);
  // 
  //     const balance = await web3.eth.getBalance(account);
  //     $('#accountBalance').text(web3.fromWei(balance, 'ether') + ' ETH');
  //   } catch (err) {
  //     let errorMessage = err.message.split("\n")[0];
  //     $('#account').text(errorMessage);
  //   }
  // },  
  displayAccountInfo: () => {  
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        document.querySelector('#account').textContent = account;        
        //$('#account').text(account);
  
        web3.eth.getBalance(account, function (err, balance) {
          balanceText = `${web3.fromWei(balance, 'ether')} ETH`;
          document.querySelector('#accountBalance').textContent = balanceText;
          
          //$('#accountBalance').text(web3.fromWei(balance, 'ether') + ' ETH');
        });
      }
    }); 
  },
  
  // Initialize contract 
  initContract: () => {
    // ? Replace with JSON.parse()?
    $.getJSON('ChainList.json', function (chainListArtifact) {
      // Get contract and instantiate contract 
      App.contracts.ChainList = TruffleContract(chainListArtifact);
      // Set provider 
      App.contracts.ChainList.setProvider(App.web3Provider);
      // Listen to events 
      App.listenToEvents();
      // Retrieve article(s) from contract 
      return App.reloadArticles();
    });
  },
  
  // Reload article info 
  reloadArticles: () => {
    // Check loading status - avoid reentry 
    if (App.loading) { return; }    
    // Toggle loading status 
    App.loading = true;
    // refresh account info 
    App.displayAccountInfo();
    
    // Initialize instance variable 
    let chainListInstance;
    // Get contract instance 
    App.contracts.ChainList.deployed()
      .then(instance => {
        chainListInstance = instance;
        // Get articles for sale 
        return chainListInstance.getArticlesForSale();
      })
      .then(articleIds => {
        // retrieve the article placeholder and clear 
        document.getElementById("articlesRow").innerHTML = ""; 
        //$('#articlesRow').empty();
        // Iterate thru articles and call display function
        for (let i = 0; i < articleIds.length; i++) {
          let articleId = articleIds[i];
          // Get that article 
          chainListInstance.articles(articleId.toNumber())
            .then(article => {
              App.displayArticle(
                article[0],
                article[1],
                article[3],
                article[4],
                article[5]              
              );
            });
        }
        // Toggle loading status
        App.loading = false; 
      })
      .catch(err => {
        console.error(err.message);
        App.loading = false; 
      });
  },
  // Create html for article 
  displayArticle: (id, seller, name, description, price) => {
    let articlesRow = $('#articlesRow');
    let etherPrice = web3.fromWei(price, "ether");
    
    let articleTemplate = $('#articleTemplate');
    articleTemplate.find('.panel-title').text(name);
    articleTemplate.find('.article-description').text(description);
    articleTemplate.find('.article-price').text(etherPrice + " ETH");
    articleTemplate.find('.btn-buy').attr('data-id', id);
    articleTemplate.find('.btn-buy').attr('data-value', etherPrice);
  
    if (seller == App.account) {
      articleTemplate.find('.article-seller').text('You');
      articleTemplate.find('.btn-buy').hide();      
    } else {
      articleTemplate.find('.article-seller').text(seller);     articleTemplate.find('.btn-buy').show();     
    }
    
    articlesRow.append(articleTemplate.html());
  },
  
  // Sell article 
  sellArticle: () => {
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
    // Get contract instance and call sell article function
    App.contracts.ChainList.deployed()
      .then(instance => instance.sellArticle(_article_name, _description, _price, { 
        from: App.account,
        gas: 500000
      }))
      .catch(err => console.error(err)); 
      
  }, 
  
  // Listen to events triggered by contract
  listenToEvents: () => {
    App.contracts.ChainList.deployed().then(instance => {
      instance.LogSellArticle({}, {})
        .watch(function (error, event) {
          if (!error) {
            $("#events").append(`<li class="list-group-item">${event.args._name} is now for sale</li>`);
          } else {
            console.error(error);
          }  
          App.reloadArticles();
        });
        
      instance.LogBuyArticle({}, {})
        .watch(function (error, event) {
          if (!error) {
            $("#events").append(`<li class="list-group-item">${event.args._buyer} bought ${event.args._name}</li>`);
          } else {
            console.error(error);
          }  
          App.reloadArticles();
        });

    });
  },
  
  buyArticle: () => {
    event.preventDefault();
    
    // Retrieve the article id and price from button data 
    const _articleId = $(event.target).data('id');
    const _price = parseFloat($(event.target).data('value'));
    // Get contract instance and call buy article 
    App.contracts.ChainList.deployed()
      .then(instance => instance.buyArticle(_articleId, {
        from: App.account,
        value: web3.toWei(_price, "ether"),
        gas: 500000
      }))
      .catch(error => console.error(error));
  }
};

$(function() {
  $(window).load(() => App.init());
});
// ?? Replace with
// document.addEventListener("DOMContentLoaded", App.init);
