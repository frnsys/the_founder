import _ from 'underscore';
import util from 'util';
import Effect from 'game/Effect';
import Alert from './Alert';

const mailTemplate = `
`;

function template(data) {
  var button = '<button>OK</button>';
  if (data.n_messages > 1) {
    button = `
      <button class="prev" ${data.prev ? '': 'disabled'}>Previous Message</button>
      <button class="next">Next Message</button>`;
  }
  return `
    <div class="alert-message">
      <div class="email-content">
        <ul class="email-meta">
          <li>${data.subject}</li>
          <li>From: ${data.sender}</li>
          <li>To: thefounder@${util.slugify(data.company)}.com</li>
        </ul>
        </ul>
        <div class="email-body">
          ${data.body}
        </div>
        ${data.effects ? `<ul class="email-effects">${data.effects.map(i => `<li>${Effect.toString(i)}</li>`).join('')}</ul>` : ''}
        ${data.actions ? `<ul class="email-actions">${data.actions.map(i => `<li>${i.name}</li>`).join('')}</ul>` : ''}
      </div>
      <div class="alert-actions">
        ${button}
      </div>
    </div>`;
}

class EmailsView extends Alert {
  constructor(messages, company) {
    super({
      template: template,
      handlers: {
        '.next': function() {
          if (this.idx < this.messages.length - 1) {
            this.idx++;
            this.render();
          } else {
            this.remove();
          }
        },
        '.prev': function() {
          if (this.idx > 0) {
            this.idx--;
            this.render();
          }
        }
      }
    });
    this.idx = 0;
    this.messages = _.map(messages, function(m) {
      return _.extend({company: company}, m);
    });
  }

  render() {
    super.render(_.extend({
      prev: this.idx > 0,
      n_messages: this.messages.length
    }, this.messages[this.idx]));
  }
}


export default EmailsView;
