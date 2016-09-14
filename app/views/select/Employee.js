import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import templ from '../Common';
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
    ${templ.skills(data)}
    ${templ.attributes(data)}
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
  constructor(company) {
    super({
      template: template,
    });
    this.company = company;
  }

  render(obj) {
    super.render(obj);
    this.statsView = new View({
      parent: '.selection-stats',
      template: statsTemplate
    });
    this.statsView.render(obj);
    this.el.find('.selection-info').append(`<h5 class="employee-burnout">Burnt Out</h5>`);
    this.el.find('.selection-info').append(`<h5 class="employee-current-task"></h5>`);
    this.updateBurnout(obj);
    this.updateTask(obj);
    this.updateLastTweet(obj);
  }

  updateBurnout(obj) {
    var el = this.el.find('.selection-info .employee-burnout');
    if (obj.burnout > 0) {
      el.show();
    } else {
      el.hide();
    }
  }

  updateTask(obj) {
    var el = this.el.find('.selection-info .employee-current-task');
    if (!obj.task) {
      el.html('Idle');
    } else {
      var task = this.company.task(obj.task),
          name = task.obj.name;
      if (!_.isUndefined(task.obj.combo)) {
        name = task.obj.combo;
      }
      el.html(`Working on ${name}`);
    }
  }

  updateLastTweet(obj) {
    this.el.find('.tweet').text(obj.lastTweet);
  }

  update(obj) {
    this.updateBurnout(obj);
    this.updateTask(obj);
    this.statsView.render(obj);
  }
}

export default EmployeeView;
