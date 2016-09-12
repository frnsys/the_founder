import _ from 'underscore';
import $ from 'jquery';
import util from 'util';
import Enums from 'app/Enums';
import View from 'views/View';
import Task from 'game/Task';
import Tooltip from 'views/Tooltip';
import NewTaskView from 'views/task/New';
import ActiveTasksView from 'views/task/Active';

const template = data => `
<div class="hud-left">
  <h4 class="hud-date"></h4>
  <div class="hud-cash"></div>
  <div class="hud-active-products"></div>
</div>
<div class="hud-center">
  <div class="hud-center-board"></div>
  <ul class="hud-tasks"></ul>
</div>
<div class="hud-right">
  <div class="hud-stats"></div>
  <ul class="hud-actions">
    <li class="start-new-task">New Task</li>
    <li class="view-tasks">View Tasks</li>
  </ul>
</div>
`

function hudTaskTemplate(task) {
  var progress = Math.floor((task.progress/task.requiredProgress) * 100),
      tip = task.type == Task.Type.Product ? task.obj.combo : task.obj.name;
  return `
    <div class="hud-task" data-tip="${tip}">
      <div class="progress-radial progress-${progress}">
        <div class="overlay"></div>
      </div>
    </div>`;
}

const activeProductTemplate = function(data) {
  var products = data.activeProducts;
  if (products) {
    return `
      <ul class="active-products">
        ${products.map(i => `
          <li><span class="active-product-name">${i.name}</span> <span class="cash">${util.formatCurrencyAbbrev(i.earnedRevenue)}</span></li>
        `).join('')}
      </ul>
    `;
  } else {
    return '';
  }
};

const statsTemplate = data => `
${data.onboarding.hype ? `<li data-tip="Hype"><img src="/assets/company/hype.png"> <span class="hype-stat">${util.abbreviateNumber(Math.floor(data.hype), 0)}</span></li>` : ''}
${data.onboarding.outrage ? `<li data-tip="Outrage"><img src="/assets/company/outrage.png"> <span class="outrage-stat">${util.abbreviateNumber(data.outrage, 0)}</span></li>` : ''}
<li data-tip="Design"><img src="/assets/company/design.png"> <span class="design-stat">${util.abbreviateNumber(data.design, 0)}</span></li>
<li data-tip="Marketing"><img src="/assets/company/marketing.png"> <span class="marketing-stat">${util.abbreviateNumber(data.marketing, 0)}</span></li>
<li data-tip="Engineering"><img src="/assets/company/engineering.png"> <span class="engineering-stat">${util.abbreviateNumber(data.engineering, 0)}</span></li>
<li data-tip="Productivity"><img src="/assets/company/productivity.png"> <span class="productivity-stat">${util.abbreviateNumber(data.productivity, 0)}</span></li>
`;

const timeTemplate = data => `
<span>${util.enumName(data.month, Enums.Month)}, ${data.year}</span>
<ul class="weeks">
  ${_.times(data.week + 1, i => `
    <li class="week-on"></li>
  `).join('')}
  ${_.times(4 - (data.week+1), i => `
    <li class="week-off"></li>
  `).join('')}
</ul>
`;

const boardTemplate = data => `
<h3>The Board is ${data.boardStatus}.</h3>
<div class="hud-profit-progress">
  <div class="progress-bar-outer">
    <div class="progress-bar-inner" style="width:${data.profitTargetProgressPercent}%"></div>
    <div class="hud-profit-progress-ytd cash">${util.formatCurrency(Math.floor(data.ytdProfit))}</div>
    <div class="hud-profit-progress-target cash">${util.formatCurrency(data.profitTarget)}</div>
  </div>
</div>
`;

const cashTemplate = data => `
<h2 class="cash">${util.formatCurrency(Math.floor(data.cash))}</h2>
`;


class HUD extends View {
  constructor(player) {
    super({
      parent: '.hud',
      template: template
    });
    this.player = player;
    this.registerHandlers({
      '.start-new-task': function() {
        var view = new NewTaskView(player);
        view.render();
      },
      '.view-tasks': function() {
        var view = new ActiveTasksView(player);
        view.render();
      }
    });
  }

  render() {
    super.render(this.player.snapshot);
  }

  postRender() {
    super.postRender();
    var data = this.player.snapshot;
    if (!this.subviews) {
      this.statsView = new View({
        tag: 'ul',
        parent: '.hud-stats',
        template: statsTemplate,
        attrs: {
          class: 'grid'
        }
      });
      this.subviews = [
        new View({
          parent: '.hud-date',
          template: timeTemplate
        }),
        new View({
          parent: '.hud-center-board',
          template: boardTemplate
        }),
        new View({
          parent: '.hud-cash',
          template: cashTemplate
        }),
        new View({
          parent: '.hud-active-products',
          template: activeProductTemplate
        })
      ];
      this.taskViews = {};
      _.each(this.player.company.tasks, this.createTaskView.bind(this));
    }
    _.each(this.subviews, view => view.render(data));
    this.statsView.render(data);

    if (!this.player.snapshot.onboarding['intro']) {
      $('.start-new-task').hide();
    }
  }

  createTaskView(task) {
    var view = new View({
      tag: 'li',
      parent: '.hud-tasks',
      template: hudTaskTemplate,
      method: 'append'
    });
    view.render(task);
    this.taskViews[task.id] = view;
  }

  update() {
    var data = this.player.snapshot;
    _.each(this.subviews, view => view.render(data));
    this.statsView.el.find('.hype-stat').text(util.abbreviateNumber(Math.floor(data.hype), 0));
    this.statsView.el.find('.outrage-stat').text(util.abbreviateNumber(Math.floor(data.outrage), 0));
    this.statsView.el.find('.design-stat').text(util.abbreviateNumber(Math.floor(data.design)));
    this.statsView.el.find('.marketing-stat').text(util.abbreviateNumber(Math.floor(data.marketing)));
    this.statsView.el.find('.engineering-stat').text(util.abbreviateNumber(Math.floor(data.engineering)));
    this.statsView.el.find('.productivity-stat').text(util.abbreviateNumber(Math.floor(data.productivity)));

    // remove old task views and add new ones
    var self = this,
        tasks = _.reduce(this.player.company.tasks, function(m, t) {
          m[t.id] = t;
          return m;
        }, {});
    _.each(this.player.company.tasks, function(t) {
      if (!(t.id in self.taskViews)) {
        self.createTaskView(t);
      }
    });
    this.taskViews = _.pick(this.taskViews, function(v, id) {
      var exists = _.contains(_.keys(tasks), id);
      if (!exists) {
        v.remove();
      } else {
        var task = tasks[id],
            progress = Math.floor((task.progress/task.requiredProgress) * 100);
        v.el.find('.progress-radial').attr('class', `progress-radial progress-${progress}`);
      }
      return exists;
    });

    if (this.player.snapshot.onboarding['intro']) {
      $('.start-new-task').show();
    }
  }
}

export default HUD;
