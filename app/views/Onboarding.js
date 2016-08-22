import $ from 'jquery';
import util from 'util';
import View from 'views/View';
import Effect from 'game/Effect';
import productTypes from 'data/productTypes.json';

function template(data) {
  var body;
  if (data.options) {
    var options = data.options.map(function(i) {
      var image;
      if (i.market) {
        image = `<img src="assets/locations/${util.slugify(data.name)}.jpg" class="onboarding-location">`;
      } else if (i.avatar) {
        image = `<img src="assets/workers/gifs/${data.avatar}.gif">`;
      } else {
        image = `<img src="assets/verticals/${util.slugify(data.name)}.gif">`;
      }
      return `
        <li data-name="${item.name}">
          ${image}
          <div class="onboarding-option-info">
            <h3>${data.name}</h3>
            <p>${data.description}</p>
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
  } else {
    body = `
      <input type="text" value="${data.selected ? data.selected : 'Happy Corp'}">
      <div class="actions">
        <button class="select">Sounds Good</button>
      </div>`;
  }
  return `
    <div class="onboarding">
      <h1>${data.name}</h1>
      <h4>${data.description}</h4>
      ${body};
    </div>`;
}



class Onboarding extends View {
  constructor(player, stages, onFinish) {
    super({
      template: template,
    });
    this.registerHandlers({
      'li': this.selectOption,
      '.select': this.confirmSelect,
      '.back': function() {
        this.stage--;
        this.render(stages[this.stage]);
      }
    });
    this.stage = 0;
    this.stages = stages;
    this.player = player;
    this.onFinish = onFinish;
  }

  postRender() {
    var el = this.el;
    if (this.stage === 0) {
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
    } else if (this.stages[stage].selected) {
      $('[data-name="'+stages[stage].selected+'"]').click();
    }
  }

  selectOption(ev) {
    if (this.stage < 4) {
      var $el = $(ev.target),
          idx = $el.closest('li').index();
      selected = this.stages[this.stage].options[idx];
      this.el.find('.selected').removeClass('selected');
      $el.closest('li').addClass('selected');
      this.el.find('.select').prop('disabled', false);
    }
  }

  confirmSelect(ev) {
    var stages = this.stages,
        player = this.player;
    switch (this.stage) {
      case 0:
        var name = this.el.find('input').val();
        stages[stage].selected = name;
        player.company.name = name;
        break;
      case 1:
        stages[stage].selected = selected.name;
        player.company.locations = [selected];
        stages[4].options[0] = selected;
        break;
      case 2:
        stages[stage].selected = selected.name;
        player.company.verticals = [selected];
        player.company.productTypes = util.byNames(productTypes, stages[stage]['startingProductTypes'][selected.name]);
        stages[4].options[1] = selected;
        break;
      case 3:
        stages[stage].selected = selected.name;
        self.player.company.cofounder = selected;
        stages[4].options[2] = selected;
        break;
      case 4:
        Effect.applies(self.player.company.locations[0].effects, self.player);
        Effect.applies(self.player.company.cofounder.effects, self.player);
        this.remove();
        this.onFinish();
        return;
    }
    stage++;
    this.render(stages[stage]);
  }
}

export default Onboarding;
