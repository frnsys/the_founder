import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import templ from '../Common';
import Worker from 'game/Worker';
import Hiring from 'game/Hiring';
import Popup from 'views/Popup';

const template = function(data) {
  var result, negotiationCls,
      negotiationEffect = '';
  if (data.result) {
    result = `
      <h1 class='offer-result'>${data.result}</h1>
      <button class="return-hiring">Back to candidates</button>`;
  } else {
    var options;
    if (data.options.length > 0) {
      options = `
        ${data.workerInsight ? `<div class="worker-insight">From social media we've learned this candidate's personality: <b>${data.personality}</b></div>` : ''}
        <ul class="negotiation-options">
          ${data.options.map((i, idx) => `
            <li class="negotiation-option" data-id="${idx}">${i.text}</li>
          `).join('')}
        </ul>`;
    } else {
      options = '<h1 class="require-offer">Time to make an offer</h1>';
    }
    result = `
    ${options}
    <div class="negotitation-offer">
      <input type="number" value="${data.offer}" class="offer" step="100">
      <button class="make-offer">Make Offer (Likelihood they'll accept: ${(data.offerProb * 100).toFixed(0)}%)</button>
      <div class="negotiation-wage-factors">
        Minimum salary modifiers:
        ${data.perkMultiplier ? data.perkMultiplier : ''}
        ${data.economicPressure ? data.economicPressure : ''}
        ${data.wagePressure ? data.wagePressure : ''}
      </div>
    </div>`;
  }

  if (data.lastNegotiationEffect < 1) {
    negotiationEffect = 'Nice! Their salary expectation went down';
    negotiationCls = 'negotiation-good';
  } else if (data.lastNegotiationEffect > 1) {
    negotiationEffect = 'Argh! Their salary expectation went up';
    negotiationCls = 'negotiation-bad';
  }

  return `
    <div class="current-cash">
      <div class="current-cash-value"></div>
    </div>
    <div class="negotiation-employee">
      <img src="assets/workers/gifs/${data.avatar}.gif">
      <div class="title">
        <h1>${data.name}</h1>
        <p class="subtitle">${data.title}</p>
      </div>
      ${templ.skills(data)}
      ${data.attributes.length > 0 ? templ.attributes(data) : ''}
    </div>
    <div class="negotiation-dialogue-wrapper">
      ${negotiationEffect ? `
      <div class="negotiation-result">
        <div class="negotiation-result-text ${negotiationCls}">${negotiationEffect}</div>
      </div>` : ''}
      <div class="negotiation-dialogue">
        ${result}
      </div>
    </div>`;
};


class View extends Popup {
  constructor(player, office, worker, hiringView) {
    super({
      title: 'Negotiation',
      template: template
    });
    var self = this;
    this.player = player;
    this.worker = worker;
    this.hiringView = hiringView;
    this.negotiations = Hiring.negotiationOptions(player.company);
    this.salaryMods = [];
    this.sampleOptions();
    this.offer = 50000;
    this.lastNegotiationEffect;
    this.noResetScroll = true;
    this.registerHandlers({
      '.negotiation-option': function(ev) {
        var idx = parseInt($(ev.target).data('id')),
            choice = self.options[idx],
            effect = Hiring.negotiationEffect(self.worker, choice);
        this.lastNegotiationEffect = effect;
        self.salaryMods.push(effect);
        self.sampleOptions();
        self.render();
      },
      '.make-offer': function() {
        self.accepted = Hiring.acceptOffer(self.minSalary, self.offer);
        if (self.accepted) {
          player.company.hireEmployee(worker, self.offer);
          office.addEmployee(worker);
          self.result = `I'm so excited to start at ${player.company.name}!`;
        } else {
          worker.offMarketTime = _.random(6,12);
          self.result = `Sorry, I've accepted an offer elsewhere. Thanks though!`;
        }
        self.render();
      },
      '.return-hiring': function() {
        this.remove();
      }
    });
  }

  postRender() {
    super.postRender();
    var self = this;
    $('.offer').on('keyup input', function() {
      self.offer = parseInt($(this).val());
      var offerProb = Hiring.acceptOfferProb(self.minSalary, self.offer);
      $('.make-offer').text(`Make Offer (Likelihood they'll accept: ${(offerProb * 100).toFixed(0)}%)`);
    });
  }

  postRemove() {
    super.postRemove();
    // if you close out of negotiations,
    // the worker goes off the market
    if (_.isUndefined(this.accepted)) {
      this.worker.offMarketTime = _.random(6,12);
    }
    this.hiringView.el = undefined; // hacky
    this.hiringView.render();
  }

  sampleOptions() {
    if (this.negotiations.length >= 3) {
      this.options = _.sample(this.negotiations, 3);
      this.negotiations = _.difference(this.negotiations, this.options);
    } else {
      this.options = [];
    }
  }

  get minSalary() {
    return Worker.minSalary(this.worker, this.player, this.salaryMods);
  }

  render() {
    var wagePressure, economicPressure, perkEffect;
    switch (this.player.economy) {
        case 0:
          economicPressure = 'The economic depression is decreasing the minimum salary';
          break;
        case 1:
          economicPressure = 'The economic recession, decreasing the minimum salary';
          break;
        case 3:
          economicPressure = 'The economic boom, is increasing the minimum salary';
    }
    if (this.player.wageMultiplier < 1) {
      wagePressure = 'Other factors are decreasing the minimum salary';
    } else if (this.player.wageMultiplier > 1) {
      wagePressure = 'Other factors are increasing the minimum salary';
    }

    var perkMultiplier = Worker.perkSalaryMultiplier(this.player.company);
    perkEffect = `-${((1-perkMultiplier)*100).toFixed(0)}% from perks`;

    super.render(_.extend({
      offer: this.offer,
      offerProb: Hiring.acceptOfferProb(this.minSalary, this.offer),
      options: this.options,
      result: this.result,
      workerInsight: this.player.specialEffects['Worker Insight'],
      economicPressure: economicPressure,
      wagePressure: wagePressure,
      perkMultiplier: perkEffect,
      lastNegotiationEffect: this.lastNegotiationEffect
    }, this.worker));
  }

  update() {
    this.el.find('.current-cash-value').text(
      `Cash: ${util.formatCurrency(this.player.company.cash)}`
    );
  }
}

export default View;


