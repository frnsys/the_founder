import $ from 'jquery';
import _ from 'underscore';

class View {
  constructor(params) {
    var self = this,
        handlers = this.handlers || {};

    // params
    // parent: selector of element to render inside
    // template: the ES6 template to render
    // data: default data passed to the template on render
    // handlers: on click handlers for the rendered element
    // tag: tag to wrap contents with
    // attrs: arbitrary attributes to be added to the wrapping element
    params = _.defaults(params, {
      parent: 'body',
      tag: 'div',
      template: undefined,
      data: {},
      handlers: {},
      attrs: {},
      method: 'replace' // or append
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

    this.preRender();
    data = _.extend(_.clone(this.data), data);

    // it must be wrapped so we can replace it on re-render
    html = $(`<${this.tag}>`+this.template(data)+`</${this.tag}>`);
    _.each(this.handlers, function(handler, selector) {
      html.on('click', selector, function(ev) {
        handler.bind(self)(ev);
      });
    });
    _.each(this.attrs, function(v,k) {
      html.attr(k, v);
    });
    if (this.el) {
      this.el.replaceWith(html);
    } else {
      if (this.method === 'append') {
        $(this.parent).append(html);
      } else {
        $(this.parent).html(html);
      }
    }
    this.el = html;
    this.postRender();
    return this;
  }

  remove() {
    this.preRemove();
    this.el.remove();
    this.postRemove();
  }

  preRender() {}
  preRemove() {}
  postRender() {}
  postRemove() {}
}

export default View;
