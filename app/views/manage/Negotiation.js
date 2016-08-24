import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import Worker from 'game/Worker';
import Hiring from 'game/Hiring';
import Popup from 'views/Popup';
import negotiations from 'data/negotiations.json';

const attributeTemplate = item => `
  <h5>Attributes</h5>
  <ul>
    ${item.attributes.map(i => `
      <li data-tip="<ul>${Worker.attributeToStrings(i).map(s => `<li>${s}</li>`).join('')}</ul>">${i}</li>
    `).join('')}
  </ul>
`;

const template = function(data) {
  var result;
  if (data.result) {
    result = `
      <h1>${data.result}</h1>
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
      <input type="number" value="${data.offer}" class="offer">
      <button class="make-offer">Make Offer (${(data.offerProb * 100).toFixed(0)}%)</button>
    </div>`;
  }
  return `
  <div class="popup-body">
    <div class="negotiation-employee">
      <img src="/assets/workers/gifs/${data.avatar}.gif">
      <div class="title">
        <h1>${data.name}</h1>
        <p class="subtitle">${data.title}</p>
      </div>
      <ul>
        <li>Productivity: ${Math.round(data.productivity)}</li>
        <li>Design: ${Math.round(data.design)}</li>
        <li>Engineering: ${Math.round(data.engineering)}</li>
        <li>Marketing: ${Math.round(data.marketing)}</li>
      </ul>
      ${data.attributes.length > 0 ? attributeTemplate(data) : ''}
    </div>
    <div class="negotiation-dialogue">
      ${result}
    </div>
  </div>`;
}


class View extends Popup {
  constructor(player, office, worker, hiringView) {
    super({
      title: 'Negotiation',
      background: 'rgb(45, 89, 214)',
      template: template
    });
    var self = this;
    this.player = player;
    this.worker = worker;
    this.hiringView = hiringView;
    this.negotiations = _.map(_.filter(negotiations, function(n) {
      return !n.requiresPerk || util.containsByName(player.company.perks, n.requiresPerk);
    }), n => _.clone(n));
    this.salaryMods = [];
    this.sampleOptions();
    this.offer = 50000;
    this.registerHandlers({
      '.negotiation-option': function(ev) {
        var idx = parseInt($(ev.target).data('id')),
            choice = self.options[idx];
        self.salaryMods.push(Hiring.negotiationEffect(self.worker, choice));
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
      $('.make-offer').text(`Make Offer (${(offerProb * 100).toFixed(0)}%)`);
    });
  }

  postRemove() {
    super.postRemove();
    // if you close out of negotiations,
    // the worker goes off the market
    if (_.isUndefined(this.accepted)) {
      this.worker.offMarketTime = _.random(6,12);
    }
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
    super.render(_.extend({
      offer: this.offer,
      offerProb: Hiring.acceptOfferProb(this.minSalary, this.offer),
      options: this.options,
      result: this.result,
      workerInsight: this.player.specialEffects['Worker Insight'],
      economicPressure: this.player.economicStability,
      wagePressure: this.player.wageMultiplier
    }, this.worker));
  }
}

export default View;


