import _ from 'underscore';
import Event from 'game/Event';
import Player from 'app/Player';

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
    "title": "{{=it.company.name}} foo",
    "body": "{{=it.company.name}} bar"
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
var expectedEmail = {
  "subject": "DEFAULTCORP",
  "from": "mentor@defaultcorp.com",
  "body": "DEFAULTCORP"
};
var expectedArticles = [{
  "title": "DEFAULTCORP",
  "body": "DEFAULTCORP"
}, {
  "title": "DEFAULTCORP foo",
  "body": "DEFAULTCORP bar"
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
    it('only triggers when conditions are satisfied', function() {
      expect(player.current.news).toEqual({});

      Event.updateNews(player);
      expect(player.current.news).toEqual({
        mainArticle: undefined,
        topArticles: [],
        articles: []
      });

      player.company.cash = 1000;
      Event.updateNews(player);
      expect(player.current.news).toEqual({
        mainArticle: expectedArticles[0],
        topArticles: [],
        articles: []
      });
    });

    it('prioritizes special articles', function() {
      player.company.cash = 10000;
      Event.updateNews(player);
      expect(player.current.news).toEqual({
        mainArticle: expectedArticles[0],
        topArticles: [expectedArticles[1]],
        articles: []
      });
    });

    it('does not repeat special articles and repeats non-special articles', function() {
      player.company.cash = 10000;
      Event.updateNews(player);
      Event.updateNews(player);
      expect(player.current.news).toEqual({
        mainArticle: expectedArticles[0],
        topArticles: [],
        articles: []
      });
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
