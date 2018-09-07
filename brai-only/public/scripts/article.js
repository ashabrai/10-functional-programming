'use strict';
var app = app || {};
//wrap the contents of article.js in a IIFE and give the IIFE a pram of module

(function(module){

  function Article(rawDataObj) {
    Object.keys(rawDataObj).forEach(key => this[key] = rawDataObj[key]);
  }

  Article.all = [];

  Article.prototype.toHtml = function() {
    var template = Handlebars.compile($('#article-template').text());

    this.daysAgo = parseInt((new Date() - new Date(this.published_on))/60/60/24/1000);
    this.publishStatus = this.published_on ? `published ${this.daysAgo} days ago` : '(draft)';
    this.body = marked(this.body);

    return template(this);
  };

  Article.loadAll = articleData => {
    articleData.sort((a,b) => (new Date(b.published_on)) - (new Date(a.published_on)))

    //  OLD forEach():
    //   articleData.forEach(articleObject => Article.all.push(new Article(articleObject)));

    //here changed the forEach() to map
    app.Article.all = articleData.map(articleObject => new module.Article(articleObject));
  };

  Article.fetchAll = callback => {
    $.get('/articles')
      .then(results => {
        module.Article.loadAll(results);
        callback();
      })
  };

  //Here use .map() and .reduce() to get a count of all words in articles.
  Article.numWordsAll = () => {
    return app.Article.all.map(article =>article.body.split(' ').length).reduce( (acc, cur) => {
      return acc + cur;
    });
  };
  //Here we used .map() and .reduce() to produce an array of unique authors
  Article.allAuthors = () => {
    return app.Article.all.map(article =>article.author).sort().reduce( (acc, cur)=>{
      const length = acc.length;
      if(length === 0 || acc[length - 1] !== cur) {
        acc.push(cur);
      }
      return acc;
    }, []);
  };

  Article.numWordsByAuthor = () => {
    return app.Article.allAuthors().map(author => {
      var object = {};
      object.author = author;
      object.numWords = app.Article.all.filter(article => article.author === author).map(article => article.body.split(' ').length).reduce( (acc, cur)=> acc + cur);
      return object;
    });
  };

  Article.truncateTable = callback => {
    $.ajax({
      url: '/articles',
      method: 'DELETE',
    })
      .then(console.log)
    // REVIEW: Check out this clean syntax for just passing 'assumed' data into a named function! The reason we can do this has to do with the way Promise.prototype.then() works. It's a little outside the scope of 301 material, but feel free to research!
      .then(callback);
  };

  Article.prototype.insertRecord = function(callback) {
  // REVIEW: Why can't we use an arrow function here for .insertRecord()?
    $.post('/articles', {author: this.author, author_url: this.author_url, body: this.body, category: this.category, published_on: this.published_on, title: this.title})
      .then(console.log)
      .then(callback);
  };

  Article.prototype.deleteRecord = function(callback) {
    $.ajax({
      url: `/articles/${this.article_id}`,
      method: 'DELETE'
    })
      .then(console.log)
      .then(callback);
  };

  Article.prototype.updateRecord = function(callback) {
    $.ajax({
      url: `/articles/${this.article_id}`,
      method: 'PUT',
      data: {
        author: this.author,
        author_url: this.author_url,
        body: this.body,
        category: this.category,
        published_on: this.published_on,
        title: this.title,
        author_id: this.author_id
      }
    })
      .then(console.log)
      .then(callback);
  };
  module.Article = Article;
})(app);
