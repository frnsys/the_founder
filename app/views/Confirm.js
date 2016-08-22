import Alert from './Alert';

const template = data => `
<div class="alert-message">
  ${ message }
</div>
<div class="alert-actions confirm-actions">
  <button class="no">No</button>
  <button class="yes">Yes</button>
</div>
`

class Confirm extends Alert {
  constructor(onYes, onNo) {
    super({
      template: template,
      handlers: {
        handlers: {
          '.yes': function() {
            if (onYes) {
              onYes();
            }
            this.remove();
          },
          '.no': function() {
            if (onNo) {
              onNo();
            }
            this.remove();
          }
        }
      }
    });
  }

  render(message) {
    super.render({message: message});
  }
}

export default Confirm;
