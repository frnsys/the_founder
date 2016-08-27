import _ from 'underscore';
import util from 'util';
import templ from '../Common';
import CardsList from 'views/CardsList';
import TaskAssignmentView from './Assignment';
import technologies from 'data/technologies.json';


function button(item) {
  if (item.in_progress) {
    button = '<button disabled>In Progress</button>';
  } else if (item.owned) {
    return '<button disabled>Completed</button>';
  } else if (item.not_available) {
    return '<button disabled>Missing prerequisites</button>';
  } else if (item.afford) {
    return '<button class="buy">Start</button>';
  } else {
    return '<button disabled>Not enough cash</button>';
  }
}

const detailTemplate = item => `
  <div class="title">
    <h1>${item.name}</h1>
    <h4 class="cash">${util.formatCurrency(item.cost)}</h4>
  </div>
  <img src="assets/techs/${util.slugify(item.name)}.png">
  <h5>Requires the ${item.requiredVertical} vertical</h5>
  ${item.prereqs.length > 0 ? templ.prereqs(item) : ''}
  ${templ.effects(item)}
  ${button(item)}
`;

class ResearchView extends CardsList {
  constructor(player) {
    super({
      title: 'Research',
      detailTemplate: detailTemplate,
      handlers: {
        '.buy': function(ev) {
          var idx = this.itemIndex(ev.target),
              sel = technologies[idx],
              task = player.company.startResearch(sel);
          if (task) {
            var view = new TaskAssignmentView(player, task);
            this.remove();
            view.render();
          };
        }
      }
    });
    this.player = player;
  }

  render() {
    super.render({
      items: _.map(technologies, this.processItem.bind(this))
    });
  }

  update() {
    var self = this;
    _.each(_.zip(technologies, this.subviews), function(v) {
      v[1].el.find('button').replaceWith(button(self.processItem(v[0])));
    });
  }

  processItem(item) {
    var player = this.player;
    return _.extend({
      owned: util.contains(this.player.company.technologies, item),
      afford: player.company.cash >= item.cost,
      not_available: !player.company.researchIsAvailable(item),
      in_progress: _.some(player.company.tasks, function(t) {
        return t.obj.name == item.name;
      }),
      prereqs: _.map(item.requiredTechs, function(t) {
        return {
          name: t,
          ok: util.containsByName(player.company.technologies, t)
        }
      })
    }, item);
  }
}

export default ResearchView;
