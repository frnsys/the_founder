import $ from 'jquery';
import Alert from './Alert';

const template = data => `
<div class="alert-message alert-mentor ${data.popped ? '' : 'alert-pop'}">
  <div class="alert-mentor-message">
    <img src="assets/workers/gifs/0.gif" class="mentor-avatar">
    ${data.message}
  </div>
  <div class="alert-actions mentor-actions">
    <button class="prev" ${data.prev ? '': 'disabled'}><-</button>
    <button class="next">-></button>
  </div>
</div>
`

class MentorView extends Alert {
  constructor(messages) {
    super({
      template: template,
      handlers: {
        '.next': function() {
          this.next();
        },
        '.prev': function() {
          this.prev();
        }
      }
    });
    this.idx = 0;
    this.popped = false;
    this.messages = messages;
  }

  next() {
    if (this.idx < this.messages.length - 1) {
      this.idx++;
      this.render();
    } else {
      this.remove();
    }
  }

  prev() {
    if (this.idx > 0) {
      this.idx--;
      this.render();
    }
  }

  render() {
    super.render({
      prev: this.idx > 0,
      message: this.messages[this.idx],
      popped: this.popped
    });
    this.popped = true;
  }

  postRender() {
    var self = this;
    super.postRender();
    MentorView.exists = true;

    // hacky
    $(document).off('keydown');
    $(document).on('keydown', function(e) {
      switch(e.which) {
        case 37: // left
          self.prev();
          break;

        case 39: // right
          self.next();
          break;

        default: return;
      }
      e.preventDefault(); // prevent the default action (scroll / move caret)
    });
  }

  postRemove() {
    super.postRemove();
    MentorView.exists = false;
    $(document).off('keydown');
  }
}

MentorView.exists = false;
export default MentorView;
