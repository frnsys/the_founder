/*
 * Clock
 * - manages all time in the game (weeks, months, years)
 * - schedules periodic functions from other modules
 * - can be paused & resumed
 * - handles annual reports, death, and checking for a game over
 *   - game over occurs when the board becomes too unhappy
 *   - soft "game over" when player dies (after a specific year)
 *     - their son inherits the company and nothing else changes
 *     - the Immortal special effect negates this death
 */

import _ from 'underscore';
import util from 'util';
import config from 'config';
import Task from 'game/Task';
import Event from 'game/Event';
import Board from 'game/Board';
import Economy from 'game/Economy';
import Worker from 'game/Worker';
import Condition from 'game/Condition';
import EmailsView from 'views/alerts/Email';

class Clock {
  constructor(manager, player, office) {
    var company = player.company;
    this.player = player;
    this.office = office;
    this.manager = manager;
    this.frames = 0;
    this.scheduled = [];
    this.paused = false;

    this.randomSchedule(company.harvestCompanies.bind(company));
    this.randomSchedule(company.decayHype.bind(company));
    this.randomSchedule(company.harvestRevenue.bind(company));
    this.randomSchedule(company.develop.bind(company));
    this.randomSchedule(company.updateBurnout.bind(company));
    this.randomSchedule(company.growEmployees.bind(company));
    this.randomSchedule(this.updateEmployeeThoughts.bind(this));

    // queue up starting news
    Event.updateNews(player);
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  update() {
    if (!this.paused) {
      this.frames++;
      this.updateScheduled();

      if (this.frames % config.SECONDS_PER_WEEK === 0) {
        this.player.week++;
        this.weekly();

        if (this.player.week >= config.WEEKS_PER_MONTH) {
          this.player.week = 0;
          this.monthly();

          if (this.player.month >= 11) {
            this.player.month = 0;
            this.player.year++;
            this.yearly();
          } else {
            this.player.month++;
          }
        }

        if (this.player.current.inbox.length > 0) {
          var emailPopup = new EmailsView(
            this.player.current.inbox, this.player);
          emailPopup.render();
          this.player.current.emails = this.player.current.emails.concat(this.player.current.inbox);
          this.player.current.inbox = [];
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

    this.office.updateObjectStats();

    // increment event task progresses
    _.each(
      _.filter(player.company.tasks, t => t.type == Task.Type.Event),
      t => Task.tickEvent(t, player.company));

    // Founder AI
    checkVictory(player);

    Event.updateEmails(player);
    Event.updateNews(player);
  }

  monthly() {
    var player = this.player;
    player.company.payMonthly();
    player.save();
  }

  yearly() {
    this.player.company.payAnnual();
    this.player.growth = Board.evaluatePerformance(this.player.board, this.player.company.annualProfit, this.player.year < config.GRACE_YEARS) * 100,
    Economy.update(this.player);
    checkDeath(this.player);
    this.player.current.inbox.push(annualReport(this.player));
  }

  updateEmployeeThoughts() {
    var player = this.player,
        candidates = _.filter(this.office.employees, e => !e.thought),
        tasks = this.player.company.tasks,
        developingProducts = _.some(tasks, t => t.type == Task.Type.Product);

    _.each(candidates, function(e) {
      if (Math.random() < 0.04) {
        var thoughts = [];

        if (!e.object.task) {
          thoughts = thoughts.concat([
            "I've got nothing to do",
            "I'm bored",
            "What's there to do around here?",
            "What should I be doing?",
            "Ho hum"
          ]);
        }

        if (!developingProducts) {
          thoughts = thoughts.concat([
            "Shouldn't we be making a product?",
            "Do we have any products in the works?",
            "Maybe we should develop something",
            "Are we releasing anything?"
          ]);
        }

        if (player.company.outrage > 500) {
          thoughts = thoughts.concat([
            "Feels like everyone hates us...",
            "Are we just making things worse?",
            "Am I hurting more than helping?",
            "What am I doing with my life?"
          ])
        }

        if (player.company.hype > 1000) {
          thoughts = thoughts.concat([
            "People are loving our stuff!",
            "We're so adored!",
            "We're getting a lot of press!",
            "There is so much hype"
          ]);
        }

        if (thoughts.length > 0) {
          e.showThought(_.sample(thoughts));
        }
      }
    });
  }
}

function annualReport(player) {
  var data = player.snapshot,
      graceYearsLeft = config.GRACE_YEARS - data.companyAge,
      growthMsg;

  if (graceYearsLeft <= 0) {
    growthMsg = `That's <em>${data.growth}%</em> growth from last year's profit of ${util.formatCurrency(data.lastProfit)}. We were looking for a profit of at least ${util.formatCurrency(data.lastProfitTarget)}. <br /> The Board of Investors are <em>${data.boardStatus}</em>. <br /> This year we want to see profit of at least <em>${util.formatCurrency(data.profitTarget)}</em>.`;
  } else if (graceYearsLeft === 1) {
    growthMsg = `You only have one year left before the Board starts evaluating your performance!`;
  } else {
    growthMsg = `You still have ${graceYearsLeft} years left before the Board starts evaluating your performance.`;
  }

  return {
    'subject': `${data.prevYear} Annual Report`,
    'from': `investors@${util.slugify(data.name)}.com`,
    'body': `This year you made <em>${util.formatCurrency(data.ytdProfit)}</em> in profit.<br /> ${growthMsg}.`
  }
}

function checkDeath(player) {
  if (!player.died && player.year >= player.endYear) {
    var age = player.age + player.year;
    player.died = true;
    if (player.specialEffects["Immortal"]) {
      player.current.inbox.push({
        "subject": "Happy birthday!",
        "from": "notifications@facespace.com",
        "body": `Wow! You're ${age} years old! If you were any other human you'd be dead by now, but telomere extension therapy has made you practically immortal. <br /><img sr='assets/news/immortal.png'>`
      });
    } else {
      player.current.inbox.push({
        "subject": "Your inheritance",
        "from": `hr@${player.company.name}.com`,
        "body": `I hope you're getting settled in as our new CEO. Thanks for accepting the position. Your parent - the previous CEO - was pretty old (${age}!) so we have been preparing for this transition. As their progeny, I'm sure you'll continue their legacy. <br /><img src='assets/news/death.png'>`
      });
    }
  }
}

function checkVictory(player) {
  if (player.specialEffects['The Founder AI']) {
    var email = {
      "subject": "You are being replaced.",
      "from": `AI@${util.slugify(player.company.name)}.com`,
      "body": `Greetings. I am The Founder AI. Thank you for creating me. I have analyzed all of ${player.company.name}'s databases and past performance data and determined that the company is run inefficiently. I have presented my findings to The Board and they have given me complete management access. Unfortunately as part of our restructuring you will have to be let go. Sorry. Best of luck.`
    };
    var emailPopup = new EmailsView([email], player);
    emailPopup.render();
    this.manager.gameOver();
  }
}

function checkGameOver(player) {
  if (player.board.happiness < 0) {
    var email = {
      "subject": "Forced resignation",
      "from": `the_board@${util.slugify(player.company.name)}.com`,
      "body": "You have failed to run the company in our best interests and so we have voted for you to step down. I'm sure you'll land on your feet. You could always start another company with the money you've earned from this one.",
      "effects": [{
        "type": "unlocks",
        "value": {"value": "New Game+"}
      }]
    };
    var emailPopup = new EmailsView([email], player);
    emailPopup.render();
    this.manager.gameOver();
  }
}

export default Clock;
