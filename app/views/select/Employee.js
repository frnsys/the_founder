import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import Worker from 'game/Worker';
import View from 'views/View';
import SelectView from './Select';

const template = data => `
<header class="selection-header">
  <img class="selection-avatar" src="assets/workers/gifs/${data.avatar}.gif">
  <div class="selection-name">
    <h2>${data.name}</h2>
    <h4>${data.title}</h4>
  </div>
</header>
<div class="selection-body">
  <div class="last-thought">
    <h6>Last Tweet</h6>
    <div class="tweet">${data.lastTweet}</div>
  </div>
  <div class="selection-info">
    <ul class="selection-stats">
    </ul>
    <div class="employee-attributes">
      <h5>Attributes</h5>
      <ul>
        ${data.attributes.map(i => `
          <li data-tip="<ul>${Worker.attributeToStrings(i).map(s => `<li>${s}</li>`).join('')}</ul>">${i}</li>
        `).join('')}
      </ul>
    </div>
  </div>
</div>
`

const statsTemplate = data => `
  <li><span class="selection-stat-name">Design</span> <span class="selection-stat-value">${Worker.design(data)}</span></li>
  <li><span class="selection-stat-name">Engineering</span> <span class="selection-stat-value">${Worker.engineering(data)}</span></li>
  <li><span class="selection-stat-name">Marketing</span> <span class="selection-stat-value">${Worker.marketing(data)}</span></li>
  <li><span class="selection-stat-name">Productivity</span> <span class="selection-stat-value">${Worker.productivity(data)}</span></li>
  <li><span class="selection-stat-name">Happiness</span> <span class="selection-stat-value">${Worker.happiness(data)}</span></li>
  <li><span class="selection-stat-name">Salary</span> <span class="selection-stat-value">${data.salary}</span></li>
`;

class EmployeeView extends SelectView {
  constructor() {
    super({
      template: template,
    });
  }

  render(obj) {
    super.render(obj);
    this.statsView = new View({
      el: $('.selection-stats'),
      template: statsTemplate
    });
    this.statsView.render(obj);
    this.el.find('.employee-attributes').append(`<h5 class="employee-burnout"></h5>`);
    this.updateBurnout(obj);
    this.updateLastTweet(obj);
  }

  updateBurnout(obj) {
    this.el.find('.employee-attributes .employee-burnout').html(`${obj.burnout > 0 ? 'BURNT OUT' : `Exhaustion: ${Math.round(obj.burnoutRisk * 100)}%`}`);
  }

  updateLastTweet(obj) {
    this.el.find('.tweet').text(obj.lastTweet);
  }

  update(obj) {
    this.updateBurnout(obj);
    this.statsView.render(obj);
  }
}

export default EmployeeView;
