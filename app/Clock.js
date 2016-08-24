import _ from 'underscore';
import Enums from './Enums';
import Event from 'game/Event';
import Board from 'game/Board';
import Worker from 'game/Worker';
import Condition from 'game/Condition';
import EmailsView from 'views/Email';

const SECONDS_PER_WEEK = 10 * 30;
const WEEKS_PER_MONTH = 4;

class Clock {
  constructor(manager, player, office) {
    var company = player.company;
    this.player = player;
    this.office = office;
    this.manager = manager;
    this.frames = 0;
    this.scheduled = [];

    this.randomSchedule(company.harvestCompanies.bind(company));
    this.randomSchedule(company.decayHype.bind(company));
    this.randomSchedule(company.harvestRevenue.bind(company));
    this.randomSchedule(company.developPromo.bind(company));
    this.randomSchedule(company.developProduct.bind(company));
    this.randomSchedule(company.updateBurnout.bind(company));
    this.randomSchedule(company.growEmployees.bind(company));
  }

  update() {
    this.frames++;
    this.updateScheduled();

    if (this.frames % SECONDS_PER_WEEK === 0) {
      this.player.week++;
      this.weekly();

      if (this.player.week >= WEEKS_PER_MONTH) {
        this.player.week = 0;
        this.monthly();

        if (this.player.month >= 11) {
          this.player.month = 0;
          this.player.year++;
          this.yearly();
        } else {
          this.player.month++;
        }

        if (player.current.emails) {
          var emailPopup = new EmailsView(
            this.player.current.emails, this.player.company);
          emailPopup.render();
        }
      }
    }
  }

  schedule(frames, cb) {
    this.scheduled.push({
      countdown: frames,
      cb: cb
    });
  }

  randomSchedule(cb) {
    var self = this;
    this.schedule(_.random(24, 48), function() {
      cb()
      self.randomSchedule(cb);
    });
  }

  updateScheduled() {
    var self = this,
        resolved = [];
    _.each(this.scheduled, function(e) {
      e.countdown--;
      if (e.countdown <= 0) {
        e.cb();
        resolved.push(e);
      }
    });
    this.scheduled = _.difference(this.scheduled, resolved);
  }

  weekly() {
    var player = this.player;
    _.each(player.workers, function(w) {
      if (w.offMarketTime > 0) {
        w.offMarketTime--;
      }
    });

    _.each(player.company.workers, function(w) {
      if (Math.random() <= 0.5) {
        Worker.updateLastTweet(w, player);
      }
    });

    // TODO this can probably be combined into one func
    this.office.resetObjectStats();
    this.office.incrementObjectStats();
  }

  monthly() {
    var player = this.player;
    player.current.emails = [];
    player.company.payMonthly();
    updateNews(player);
    Event.tick(player, function(ev) {
      // ev.
    });
  }

  yearly() {
    this.player.company.payAnnual();
    this.player.growth = Board.evaluatePerformance(this.player.board, this.player.company.annualProfit) * 100,
    updateEconomy(this.player);
    checkDeath(this.player);
  }
}

function updateEconomy(player) {
  var economyChangeProbability;
  player.economy = player.nextEconomy;
  switch(player.economy) {
    case Enums.Economy.Depression:
      economyChangeProbability = 0.2;
      break;
    case Enums.Economy.Recession:
      economyChangeProbability = 0.1;
      break;
    case Enums.Economy.Neutral:
      economyChangeProbability = 0.005;
      break;
    case Enums.Economy.Expansion:
      economyChangeProbability = 0.16;
      break;
  }
  if (Math.random() <= economyChangeProbability) {
    var downProb = player.economy == 0 ? 0 : Math.min(1, 0.6 / player.economicStability),
        upProb = player.economy == 3 ? 0 : 1 - downProb,
        roll = Math.random();
    if (roll <= downProb) {
      player.nextEconomy = player.economy - 1;
    } else if (roll <= upProb) {
      player.nextEconomy = player.economy + 1;
    }
  } else {
    player.nextEconomy = player.economy;
  }

  if (player.specialEffects["Prescient"]) {
    var prediction;
    if (Math.random() <= 0.65) {
      prediction = enumName(player.nextEconomy, Enums.Economy).toLowerCase();
    } else {
      var options = [player.economy];
      if (player.economy > 0) {
        options.push(player.economy - 1);
      }
      if (player.economy < 3) {
        options.push(player.economy + 1);
      }
      var nextEconomy = _.sample(options);
      prediction = enumName(nextEconomy, Enums.Economy).toLowerCase();
    }
    player.current.emails.push({
      "subject": "[DELPHI] Economic forecast",
      "from": "DELPHI@{{slug name}}.com",
      "body": "Delphi is predicting with 65% certainty that the economy will soon enter into a " + prediction + ". <br /><img src='assets/news/delphi.jpg'>"
    });
  }
}

function checkDeath(player) {
  if (!player.died && player.year >= player.endYear) {
    var age = player.age + player.year,
        emails = [];
    player.died = true;
    if (player.specialEffects["Immortal"]) {
      emails.push({
        "subject": "Happy birthday!",
        "from": "notifications@facespace.com",
        "body": `Wow! You're ${age} years old! If you were any other human you'd be dead by now, but telomere extension therapy has made you practically immortal. <br /><img sr='assets/news/immortal.png'>`
      });
    } else {
      emails.push({
        "subject": "Your inheritance",
        "from": `hr@${player.company.name}.com`,
        "body": `I hope you're getting settled in as our new CEO. Thanks for accepting the position. Your parent - the previous CEO - was pretty old (${age}!) so we have been preparing for this transition. As their progeny, I'm sure you'll continue their legacy. <br /><img src='assets/news/death.png'>`
      });
    }
  }
}

function checkGameOver(player) {
  if (player.board.happiness < 0) {
    var email = {
      "subject": "Forced resignation",
      "from": `the_board@${player.company.name}.com`,
      "body": "You have failed to run the company in our best interests and so we have voted for you to step down. I'm sure you'll land on your feet. You could always start another company with the money you've earned from this one.",
      "effects": [{
        "type": "unlocks",
        "value": {"value": "New Game+"}
      }]
    };
    var emailPopup = new EmailsView([email], player.company);
    emailPopup.render();
    this.manager.gameOver();
  }
}

function updateNews(player) {
  var specialNews = _.shuffle(_.flatten(_.mapObject(player.specialNews, function(v, k) {
    var comparison = data[k],
        matches = _.where(v, function(obj) {
          return Condition.satisfied(comparison, obj.comparator, obj.value);
        });

    // special news is non-repeatable
    player.specialNews[k] = _.difference(player.specialNews[k], matches);

    return _.map(matches, function(article) {
      var article = _.clone(article);
      article.title = renderTemplate(article.title, data);
      article.body = renderTemplate(article.body, data);
      return article;
    });
  })));

  var news = _.shuffle(_.compact(_.mapObject(player.news, function(v, k) {
    var comparison = data[k],
        passed = _.find(v, function(obj) {
          return Condition.satisfied(comparison, obj.comparator, obj.value);
        });
    if (!passed) {
      return false;
    }
    var article = _.clone(_.sample(passed.articles));
    article.title = renderTemplate(article.title, data);
    article.body = renderTemplate(article.body, data);
    return article;
  })));

  news = specialNews.concat(news);
  player.current.news = {
    mainArticle: news.pop(),
    topArticles: _.compact([news.pop(), news.pop()]),
    articles: news
  };

  var emails = _.compact(_.flatten(_.mapObject(player.emails, function(v, k) {
    var comparison = data[k],
        matches = _.where(v, function(obj) {
          return Condition.satisfied(comparison, obj.comparator, obj.value);
        });

    // emails are non-repeatable
    player.emails[k] = _.difference(player.emails[k], matches);
    return matches;
  })));

  // apply email effects
  _.each(emails, function(email) {
    Effect.applies(email.effects, player);
  });
  this.player.current.emails.concat(emails);
}

export default Clock;
