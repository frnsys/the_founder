import _ from 'underscore';
import Event from 'game/Event';
import Player from 'app/Player';

Event.journalists = ['foo'];
var news = [{
  "articles": [{
    "image": "assets/news/foo.jpg",
    "title": "{{=it.company.name}}",
    "body": "{{=it.company.name}}"
  }],
  "conditions": [{
    "type": "cash",
    "op": "ge",
    "val": 1000
  }]
}, {
  "article": {
    "image": "assets/news/foo.jpg",
    "title": "{{=it.company.name}} special",
    "body": "{{=it.company.name}} special"
  },
  "conditions": [{
    "type": "cash",
    "op": "ge",
    "val": 10000
  }]
}];
var emails = [{
  "subject": "{{=it.company.name}}",
  "from": "mentor@{{=it.companySlug}}.com",
  "body": "{{=it.company.name}}",
  "effects": [{
    "type": "cash",
    "value": 500000
  }],
  "conditions": [{
    "type": "cash",
    "op": "lt",
    "val": 0
  }]
}];
var expectedEmail = _.clone(emails[0]);
expectedEmail.subject = "DEFAULTCORP";
expectedEmail.from = "mentor@defaultcorp.com";
expectedEmail.body = "DEFAULTCORP";
var expectedArticles = [{
  "title": "DEFAULTCORP",
  "body": "DEFAULTCORP",
  "image": "assets/news/foo.jpg",
  "author": "foo"
}, {
  "title": "DEFAULTCORP special",
  "body": "DEFAULTCORP special",
  "image": "assets/news/foo.jpg",
  "author": "foo"
}];


describe('Event', function() {
  var player, company;
  beforeEach(function() {
    player = new Player();
    company = player.company;
    company.name = 'DEFAULTCORP';
    company.cofounder = {name: 'foobar'};
    player.news = news;
    player.emails = emails;
  });

  describe('news', function() {
    it('has filler news when no conditions are satisfied', function() {
      expect(player.current.news).toEqual({});

      Event.updateNews(player);

      var news = player.current.news;
      expect(news.mainArticle).not.toBeUndefined();
      expect(news.topArticles).not.toEqual([]);
      expect(news.topArticles).not.toBeUndefined();
      expect(news.articles).not.toEqual([]);
      expect(news.articles).not.toBeUndefined();

      _.each(expectedArticles, function(exp) {
        expect(news.mainArticle).not.toEqual(exp);
        _.each(news.topArticles, a => expect(a).not.toEqual(exp));
        _.each(news.articles, a => expect(a).not.toEqual(exp));
      });
    });

    it('triggers non-filler news when conditions are satisfied', function() {
      player.company.cash = 1000;
      Event.updateNews(player);
      expect(player.current.news.mainArticle).toEqual(expectedArticles[0])
    });

    it('prioritizes special articles', function() {
      player.company.cash = 10000;
      Event.updateNews(player);
      expect(player.current.news.mainArticle).toEqual(expectedArticles[1]);
      expect(player.current.news.topArticles[0]).toEqual(expectedArticles[0]);
    });

    it('does not repeat special articles and repeats non-special articles', function() {
      player.company.cash = 10000;
      Event.updateNews(player);
      Event.updateNews(player);
      expect(player.current.news.mainArticle).toEqual(expectedArticles[0]);
      _.each(news.topArticles, a => expect(a).not.toEqual(expectedArticles[1]));
      _.each(news.articles, a => expect(a).not.toEqual(expectedArticles[1]));
    });
  });

  describe('emails', function() {
    it('only triggers when conditions are satisfied', function() {
      expect(player.current.inbox).toEqual([]);
      expect(player.current.emails).toEqual([]);

      player.company.cash = 1000;
      Event.updateEmails(player);
      expect(player.current.inbox).toEqual([]);
      expect(player.current.emails).toEqual([]);

      player.company.cash = -1000;
      Event.updateEmails(player);
      expect(player.current.inbox).toEqual([expectedEmail]);
      expect(player.current.emails).toEqual([expectedEmail]);
    });

    it('can have effects', function() {
      player.company.cash = -1000;
      Event.updateEmails(player);
      expect(player.company.cash).toEqual(499000);
    });

    it('does not repeat', function() {
      player.company.cash = -1000;
      Event.updateEmails(player);
      expect(player.current.inbox).toEqual([expectedEmail]);
      expect(player.current.emails).toEqual([expectedEmail]);

      player.company.cash = -1000;
      Event.updateEmails(player);
      expect(player.current.inbox).toEqual([]);
      expect(player.current.emails).toEqual([expectedEmail]);
    });
  });
});
