import _ from 'underscore';
import util from 'util';
import templ from '../Common';
import Alert from './Alert';
import Task from 'game/Task';
import Tasks from '../task/Tasks';
import TaskAssignmentView from '../task/Assignment';

function taskTemplate(data) {
  var task = _.extend({
    workers: _.filter(data.company.workers, w => w.task == data.task.id),
    locations: _.filter(data.company.locations, l => l.task == data.task.id),
    hideActions: true,
    preview: true
  }, data.task);
  return `
    <div class="tasks">
      <ul class="cards">
        <li class="task-event">${Tasks.Event(task)}</li>
      </ul>
    </div>`;
}

function template(data) {
  var button = '<button class="dismiss-alert">OK</button>';
  if (data.action) {
    var assigned = _.some(data.company.workers, w => w.task == data.task.id) || _.some(data.company.locations, l => l.task == data.task.id);
    button = `
      <button class="assign-email">Assign</button>
      <button class="dismiss-alert">${assigned ? 'OK' : 'Dismiss'}</button>
    `;
  }
  return `
    <div class="alert-message alert-email">
      <img src="assets/company/mail.png" class="alert-icon">
      <div class="email-content">
        <h3>${data.subject}</h3>
        <div class="email-from">From: <span class="email-sender">${data.from}</span></div>
        <div class="email-to">To: <span class="email-recipient">thefounder@${util.slugify(data.company.name)}.com</span></div>
        <div class="email-body">
          ${data.body}
        </div>
        ${data.effects.length > 0 ? templ.effects(data) : ''}
      </div>
      <div class="alert-actions ${data.action ? 'has-task' : ''}">
        ${button}
      </div>
    </div>
    ${data.action ? taskTemplate(data) : ''}`;
}

class EmailsView extends Alert {
  constructor(messages, player) {
    super({
      template: template,
      handlers: {
        '.dismiss-alert': function() {
          if (this.idx < this.messages.length - 1) {
            this.idx++;
            this.render();
          } else {
            this.remove();
          }
        },
        '.assign-email': function() {
          var task = this.messages[this.idx].task,
              view = new TaskAssignmentView(player, task),
              postRemove = view.postRemove,
              self = this;
          self.el.parent().hide();
          view.postRemove = function() {
            postRemove.bind(view)();
            self.el.parent().show();
            self.render();
          }
          view.render()
        }
      }
    });
    this.idx = 0;
    this.messages = _.map(messages, function(m) {
      if (m.action) {
        m.task = Task.init('Event', m.action);
        m.task.obj.skillVal = 0;
        m.task.requiredProgress = m.action.due;
      }
      return _.extend({
        company: player.company
      }, m);
    });
  }

  render() {
    super.render(this.messages[this.idx]);
  }
}


export default EmailsView;
