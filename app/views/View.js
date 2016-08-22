import $ from 'jquery';
import _ from 'underscore';

class View {
  constructor(params) {
    var self = this,
        handlers = this.handlers || {};

    // params
    // el: jquery element to render inside
    // template: the ES6 template to render
    // data: default data passed to the handlebar template on render
    // handlers: on click handlers for the rendered element
    // parent: jquery element to show/hide on render/remove
    params = _.defaults(params, {
      el: $('.ui'),
      template: undefined,
      data: {},
      handlers: {},
      parent: $('.ui-wrapper')
    });

    _.each(Object.keys(params), function(prop) {
      self[prop] = params[prop];
    });

    this.handlers = _.extend(handlers, params.handlers);
  }

  registerHandlers(handlers) {
    this.handlers = _.extend(this.handlers, handlers);
  }

  render(data) {
    var self = this,
        html;

    // cleanup if necessary
    if (this._rendered !== undefined) {
      this._rendered.remove();
    }
    this.preRender();
    this.parent.show();
    data = _.extend(_.clone(this.data), data);
    html = $(this.template(data));
    _.each(this.handlers, function(handler, selector) {
      html.on('click', selector, _.bind(handler, self));
    });
    this.el.html(html);
    this._rendered = html;
    this.postRender();
    return this;
  }

  remove() {
    this.preRemove();
    this._rendered.remove();
    this.parent.hide();
    this.postRemove();
  }

  preRender() {}
  preRemove() {}
  postRender() {}
  postRemove() {}
}

export default View;
