import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import templ from './Common';
import View from 'views/View';
import Effect from 'game/Effect';
import Product from 'game/Product';
import verticals from 'data/verticals.json';
import productTypes from 'data/productTypes.json';

function template(data) {
  var body;
  if (data.options) {
    var options = data.options.map(function(i) {
      var image;
      if (i.market) {
        image = `<img src="assets/locations/${util.slugify(i.name)}.jpg" class="onboarding-location">`;
      } else if (i.avatar) {
        image = `<img src="assets/workers/gifs/${i.avatar}.gif">`;
      } else {
        image = `<img src="assets/verticals/${util.slugify(i.name)}.gif">`;
      }
      return `
        <li data-name="${i.name}">
          ${image}
          <div class="onboarding-option-info">
            <h3>${i.name}</h3>
            <p>${i.description}</p>
            ${i.effects && i.effects.length > 0 ? templ.effects(i) : ''}
          </div>
        </li>`;
    }).join('');
    body = `
      <ul class="onboarding-options">
        ${options}
      </ul>
      <div class="actions">
          <button class="back">Back</button>
          <button class="select" disabled>OK</button>
      </div>`;
  } else if (data.intro) {
    body = `
      <div class="onboarding-intro">
        ${data.intro}
      </div>
      <div class="actions">
        <button class="select">Got it</button>
      </div>`;
  } else {
    body = `
      <div class="onboarding-name">
        <input type="text" value="${data.selected ? data.selected : 'Happy Corp'}">
      </div>
      <div class="actions">
        <button class="select">Sounds Good</button>
      </div>`;
  }
  return `
      <h1>${data.name}</h1>
      <h4>${data.description}</h4>
      ${body}`;
}

class Onboarding extends View {
  constructor(player, stages, onFinish) {
    super({
      template: template,
      parent: '.ui',
      attrs: {class: 'onboarding'}
    });
    this.registerHandlers({
      '.onboarding-options > li': this.selectOption,
      '.select': this.confirmSelect,
      '.back': function() {
        this.stage--;
        this.render();
      }
    });
    this.stage = -1;
    this.stages = stages;
    this.player = player;
    this.onFinish = onFinish;
  }

  render() {
    if (this.stage < 0) {
      super.render({
        name: 'Welcome!',
        description: 'A note from your Mentor',
        intro: '<p>Welcome to The Founder! In a moment we\'ll incorporate your new company, but because so few companies succeed (and even fewer make it big) I want to let you know what you\'re getting yourself into.</p><p>I\'ve raised a bit of capital for you to start with, and your investors - a shrewd, wrathful bunch - expect <em>annual profit growth of 12%</em>. Just try to keep them happy ;)</p>'
      });
    } else {
      super.render(this.stages[this.stage]);
    }
  }

  postRender() {
    super.postRender();
    $('.ui').show();
    var el = this.el;
    if (this.stage < 0) {
      el.find('.select').prop('disabled', false).text('Got it');
    } else if (this.stage === 0) {
      // enable next button only if a company name is specified
      el.find('input').keypress(function() {
        if ($(this).val() !== '') {
          el.find('.select').prop('disabled', false);
        } else {
          el.find('.select').prop('disabled', true);
        }
      });
    } else if (this.stage === 4) {
      // enable confirmation on last stage
      el.find('.select').prop('disabled', false).text('Found ' + this.player.company.name);
      el.find('.onboarding-options').addClass('onboarding-options-confirm');
    } else if (this.stages[this.stage].selected) {
      $('[data-name="'+this.stages[this.stage].selected+'"]').click();
    }
  }

  selectOption(ev) {
    if (this.stage < 4 && this.stage > 0) {
      var $el = $(ev.target),
          idx = $el.closest('.onboarding-options > li').index();
      this.stages[this.stage].selected = this.stages[this.stage].options[idx];
      this.el.find('.selected').removeClass('selected');
      $el.closest('.onboarding-options > li').addClass('selected');
      this.el.find('.select').prop('disabled', false);
    }
  }

  confirmSelect(ev) {
    var stage = this.stage,
        stages = this.stages,
        player = this.player,
        selected = stage >= 0 ? stages[stage].selected : null;
    switch (stage) {
      case 0:
        var name = this.el.find('input').val();
        stages[stage].selected = name;
        player.company.name = name;
        stages[4].description = name;
        break;
      case 1:
        stages[stage].selected = selected.name;
        player.company.locations = [selected];
        stages[4].options[0] = selected;
        break;
      case 2:
        stages[stage].selected = selected.name;
        player.company.verticals = util.byNames(verticals, [selected.name]);
        player.company.productTypes = _.map(
          util.byNames(productTypes, stages[stage]['startingProductTypes'][selected.name]),
          pt => Product.initType(pt)
        );
        stages[4].options[1] = selected;
        break;
      case 3:
        stages[stage].selected = selected.name;
        player.company.cofounder = selected;
        stages[4].options[2] = selected;
        break;
      case 4:
        Effect.applies(player.company.locations[0].effects, player);
        Effect.applies(player.company.cofounder.effects, player);
        player.company.markets = [player.company.locations[0].market];

        // starting location has no skills since your employees represent it
        player.company.locations[0].skills = {
          "productivity": 0,
          "happiness": 0,
          "design": 0,
          "marketing": 0,
          "engineering": 0
        };

        this.remove();
        this.onFinish();
        return;
    }
    this.stage++;
    this.render();
  }

  postRemove() {
    super.postRemove();
    $('.ui').hide();
  }
}

export default Onboarding;
