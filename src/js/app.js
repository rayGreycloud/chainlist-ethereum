App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    let articlesRow = $('#articlesRow');
    let articleTemplate = $('#articleTemplate');
    
    articleTemplate.find('.panel-title').text('Article 1');
    articleTemplate.find('.article-description').text('Description of Article 1');
    articleTemplate.find('.article-price').text('2.12');
    articleTemplate.find('.article-seller').text('0x12345678901234567890');

    articlesRow.append(articleTemplate.html());
    
    return App.initWeb3();
  },

  initWeb3: function() {

    return App.initContract();
  },

  initContract: function() {

  },
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
