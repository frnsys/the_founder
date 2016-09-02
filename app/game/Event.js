/*
 * Event
 * - only occur when conditions are satisfied
 * - emails
 *   - may have effects
 *   - may have an associated task
 *   - may be repeatable, scheduled to repeat at some random time later
 * - news
 *   - may be repeatable
 *   - if not enough "real" news is available, filler news is provided
 */

import doT from 'dot';
import _ from 'underscore';
import util from 'util';
import Effect from './Effect';
import Condition from './Condition';
import fillerNews from 'data/newsFiller.json';

const MIN_NEWS_ARTICLES = 9;
const EMAIL_REPEAT_PROB = 0.001;
const EMAIL_COUNTDOWN_MIN = 32;
const EMAIL_COUNTDOWN_MAX = 64;

function template(obj, keys, player) {
  var result = _.clone(obj),
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

  formatEmail: function(email, player) {
    return template(email, ['subject', 'from', 'body'], player);
  },

  updateEmails: function(player) {
    var emails = _.filter(player.emails, function(email) {
      var satisfied = Event.satisfied(email, player);
      if (email.repeatable) {
        email.countdown = Math.max(0, email.countdown - 1);
        return satisfied && email.countdown <= 0 && Math.random <= EMAIL_REPEAT_PROB;
      } else {
        return satisfied;
      }
    });

    // apply email effects
    _.each(emails, function(email) {
      if (email.effects) {
        Effect.applies(email.effects, player);
      }
      if (email.repeatable) {
        email.countdown = _.random(EMAIL_COUNTDOWN_MIN, EMAIL_COUNTDOWN_MAX);
      }
    });

    // some emails are non-repeatable
    player.emails = _.difference(
      player.emails,
      _.filter(emails, e => !e.repeatable));

    // apply templates
    emails = _.map(emails, e => this.formatEmail(e, player));

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
    news = _.map(news, n => _.sample(n.articles));

    // special news take priority
    news = specialNews.concat(news);

    // apply templates
    news = _.map(news, n => template(n, ['title', 'body'], player));

    // add filler news
    if (news.length < MIN_NEWS_ARTICLES) {
      var filler = _.shuffle(fillerNews);
      _.times(MIN_NEWS_ARTICLES - news.length, function() {
        news.push(filler.pop());
      });
    }
    news = news.reverse();

    player.current.news = {
      mainArticle: news.pop(),
      topArticles: _.compact([news.pop(), news.pop()]),
      articles: news
    };
  }
};

export default Event;
