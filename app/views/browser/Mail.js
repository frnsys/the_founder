import util from 'util';
import Effect from 'game/Effect';

const template = data => `
<div class="site-header">
  <h1>cMail</h1>
  <ul class="mail-nav">
    <li>thefounder@${util.slugify(data.name)}.com</li>
    li>Settings</li>
  </ul>
</div>
<div class="site-body">
  <div class="mail-menu">
    <button>Compose</button>
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
    <li data-mail="annual_report">
      <span class="mail-subject">${data.prevYear} Annual Report</span>
      <span class="mail-sender">investors@${util.slugify(data.name)}.com</span>
    </li>
    ${data.emails.map(i => `
      <li data-mail="${util.slugify(i.subject)}">
        <span class="mail-subject">${i.subject}</span>
        <span class="mail-sender">${i.sender}</span>
      </li>
    `).join('')};
  </ul>
  <div class="email">
    <ul class="email-menu">
      <li>Archive</li>
      <li>Report Spam</li>
      <li>Delete</li>
      <li>Reply</li>
    </ul>
    <div class="email-content" data-mail="annual_report">
      <ul class="email-meta">
        <li>${data.prevYear} Annual Report</li>
        <li>From: investors@${util.slugify(data.name)}.com</li>
        <li>To: thefounder@${util.slugify(data.name)}.com</li>
      </ul>
      <div class="email-body">
        <p>This year you made ${util.formatCurrency(data.ytdProfit)} in profit, which is ${data.growth}% growth from last year's profit of ${util.formatCurrency(data.lastProfit)}. We were looking for a profit of at least ${util.formatCurrency(data.lastProfitTarget)}. The Board of Investors are ${data.boardStatus}. This year we want to see profit of at least ${util.formatCurrency(data.profitTarget)}.</p>
      </div>
    </div>
    ${data.emails.map(i => `
      <div class="email-content" data-mail="${util.slugify(i.subject)}">
        <ul class="email-meta">
          <li>${i.subject}</li>
          <li>From: ${i.sender}</li>
          <li>To: thefounder@${util.slugify(data.name)}.com</li>
        </ul>
        <div class="email-body">${i.body}</div>
        ${i.effects ? `<ul class="email-effects">${i.effects.map(j => `<li>${Effect.toString(j)}</li>`).join('')}</ul>` : ''}
        ${i.actions ? `<ul class="email-actions">${i.actions.map(j => `<li>${j.name}</li>`).join('')}</ul>` : ''}
        {{/if}}
      </div>
    `).join('')}
  </div>
</div>
`

export default template;
