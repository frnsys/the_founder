import _ from 'underscore';
import Event from 'game/Event';
import Board from 'game/Board';
import Economy from 'game/Economy';
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

        // if (this.player.current.emails.length > 0) {
        //   var emailPopup = new EmailsView(
        //     this.player.current.emails, this.player.company);
        //   emailPopup.render();
        // }
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
    player.company.payMonthly();
    // Event.updateEmails(player);
    // Event.updateNews(player);
  }

  yearly() {
    this.player.company.payAnnual();
    this.player.growth = Board.evaluatePerformance(this.player.board, this.player.company.annualProfit) * 100,
    Economy.update(this.player);
    checkDeath(this.player);
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

export default Clock;
