import $ from 'jquery';
import util from 'util';
import View from 'views/View';

const template = data => `
<div class="site-header">
  <h1>cMail</h1>
  <ul class="mail-nav">
    <li>thefounder@${util.slugify(data.name)}.com</li>
    <li>Settings</li>
  </ul>
</div>
<div class="site-body">
  <div class="mail-menu">
    <ul class="mail-boxes">
      <li class="show-inbox">Inbox</li>
      <li>Starred</li>
      <li>Important</li>
      <li>Sent</li>
      <li>Outbox</li>
    </ul>
    <ul class="mail-chat">
      <li>Chat</li>
      <li><span class="mail-chat-offline">●</span> ${util.slugify(data.cofounder.name)}</li>
      <li><span class="mail-chat-offline">●</span> investors</li>
    </ul>
  </div>
  <ul class="inbox">
    ${data.emails.reverse().map(i => `
      <li data-mail="${util.slugify(i.subject)}">
        <span class="mail-subject">${i.subject}</span>
        <span class="mail-sender">${i.from}</span>
      </li>
    `).join('')}
  </ul>
  <div class="email">
    <ul class="email-menu">
      <li>Archive</li>
      <li>Report Spam</li>
      <li>Delete</li>
      <li>Reply</li>
    </ul>
    ${data.emails.reverse().map(i => `
      <div class="email-content" data-mail="${util.slugify(i.subject)}">
        <ul class="email-meta">
          <li>${i.subject}</li>
          <li>From: ${i.from}</li>
          <li>To: thefounder@${util.slugify(data.name)}.com</li>
        </ul>
        <div class="email-body">${i.body}</div>
      </div>
    `).join('')}
  </div>
</div>`;


class CMail extends View {
  constructor() {
    super({
      parent: '.mail',
      template: template
    })
    this.registerHandlers({
      '.inbox li': function(ev) {
        var $el = $(ev.target),
            mail = $el.closest('li').data('mail');
        $('.inbox').hide()
        $('.email, .email-content[data-mail="'+mail+'"]').show();
      },
      '.show-inbox': function() {
        $('.inbox').show()
        $('.email, .email-content').hide();
      }
    });
  }

  render(data) {
    this.nEmails = data.emails.length;
    super.render(data);
  }

  update(data) {
    // re-render on new emails
    if ($('.inbox').is(':visible') && data.emails.length > this.nEmails) {
      this.render(data);
    }
  }
}

export default CMail;
