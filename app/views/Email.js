import _ from 'underscore';
import util from 'util';
import templ from './Common';
import Alert from './Alert';
import Task from 'game/Task';
import Tasks from './task/Tasks';

function taskTemplate(data) {
  var task = Task.init('Event', data.action);
  task = _.extend({
    workers: [],
    locations: [],
    hideActions: true,
    preview: true
  }, task);
  return `
    <div class="tasks">
      <ul class="cards">
        <li class="task-event">${Tasks.Email(task)}</li>
      </ul>
    </div>`;
}

function template(data) {
  var button = '<button class="dismiss-alert">OK</button>';
  if (data.action) {
    button = `
      <button class="assign-email">Assign</button>
      <button class="dismiss-alert">Dismiss</button>
    `;
  }
  return `
    <div class="alert-message alert-email">
      <img src="assets/company/mail.png" class="email-icon">
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
  constructor(messages, company) {
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
          // TODO assign
        }
      }
    });
    this.idx = 0;
    this.messages = _.map(messages, function(m) {
      return _.extend({company: company}, m);
    });
  }

  render() {
    super.render(this.messages[this.idx]);
  }
}


export default EmailsView;
