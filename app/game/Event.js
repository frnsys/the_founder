import doT from 'dot';
import _ from 'underscore';
import util from 'util';
import Effect from './Effect';
import Condition from './Condition';


function template(obj, keys, player) {
  var result = {},
      data = _.extend({
        cofounderSlug: util.slugify(player.company.cofounder.name),
        companySlug: util.slugify(player.company.name),
        taxesAvoided: util.formatCurrencyAbbrev(player.company.taxesAvoided),
        debtOwned: util.formatCurrencyAbbrev(player.company.debtOwned),
        competitor: _.sample(player.competitors),
        globalAvgWage: util.formatCurrency(player.snapshot.globalAvgWage),
        consumerSpending: player.snapshot.consumerSpending
      }, player);
  _.each(keys, function(k) {
    result[k] = doT.template(obj[k])(data);
  });
  return result;
}

const Event = {
  satisfied: function(event, player) {
    return _.every(event.conditions, function(condition) {
      return Condition.satisfied(condition, player);
    });
  },

  updateEmails: function(player) {
    var emails = _.filter(player.emails, (email) => Event.satisfied(email, player));

    // emails are non-repeatable
    player.emails = _.difference(player.emails, emails);

    // apply email effects
    _.each(emails, function(email) {
      if (email.effects) {
        Effect.applies(email.effects, player);
      }
    });

    // apply templates
    emails = _.map(emails, (e) => template(e, ['subject', 'from', 'body'], player));

    player.current.inbox = emails;
    player.current.emails = player.current.emails.concat(emails);
  },

  updateNews: function(player) {
    var specialNews = [],
        news = [];

    _.each(player.news, function(n) {
      if (Event.satisfied(n, player)) {
        // if just one article, it's a special one-time event
        if (n.article) {
          specialNews.push(n);
        } else {
          news.push(n);
        }
      }
    });

    // special news is non-repeatable
    player.news = _.difference(player.news, specialNews);

    specialNews = _.pluck(specialNews, 'article');
    news = _.map(news, (n) => _.sample(n.articles));

    // special news take priority
    news = specialNews.concat(news);

    // apply templates
    news = _.map(news, (n) => template(n, ['title', 'body'], player));

    player.current.news = {
      mainArticle: news.pop(),
      topArticles: _.compact([news.pop(), news.pop()]),
      articles: news
    };
  }
};

export default Event;
