import Alert from './Alert';

const template = data => `
<div class="alert-message alert-confirm">
  <img src="assets/company/confirm.png" class="alert-icon">
  <p>${data.message}</p>
  <div class="alert-actions">
    <button class="no">No</button>
    <button class="yes">Yes</button>
  </div>
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

  render(message) {
    super.render({message: message});
  }
}

export default Confirm;
