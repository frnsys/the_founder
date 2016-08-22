import Alert from './Alert';

const template = data => `
<img src="assets/workers/gifs/0.gif" class="mentor">
<div class="alert-message mentor-message">
  ${data.message}
</div>
<div class="alert-actions mentor-actions">
  <button class="prev" ${data.prev ? '': 'disabled'}><-</button>
  <button class="next">-></button>
</div>
`

class MentorView extends Alert {
  constructor(messages) {
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
    this.messages = messages;
  }

  render() {
    super.render({
      prev: this.idx > 0,
      message: this.messages[this.idx]
    });
  }
}

export default MentorView;
