import Alert from './Alert';

const template = data => `
<div class="alert-message alert-confirm alert-pop">
  <img src="assets/company/confirm.png" class="alert-icon">
  <p>${data.message}</p>
  <div class="alert-actions">
    <button class="no">${data.no}</button>
    <button class="yes">${data.yes}</button>
  </div>
  <div class="paused-notice">Paused</div>
</div>
`

class Confirm extends Alert {
  constructor(onYes, onNo) {
    super({
      template: template,
      handlers: {
        '.yes': function() {
          if (onYes) { onYes(); }
          this.remove();
        },
        '.no': function() {
          if (onNo) { onNo(); }
          this.remove();
        }
      }
    });
  }

  render(message, yes, no) {
    super.render({
      message: message,
      yes: yes || 'Yes',
      no: no || 'No'
    });
  }
}

export default Confirm;
