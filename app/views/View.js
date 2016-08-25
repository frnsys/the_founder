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
      tag: 'div',
      template: undefined,
      data: {},
      handlers: {},
      attrs: {},
      method: 'replace', // or append
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

    this.preRender();
    this.parent.show();
    data = _.extend(_.clone(this.data), data);

    // it must be wrapped so we can replace it on re-render
    html = $(`<${this.tag}>`+this.template(data)+`</${this.tag}>`);
    _.each(this.handlers, function(handler, selector) {
      html.on('click', selector, _.bind(handler, self));
    });
    _.each(this.attrs, function(v,k) {
      html.attr(k, v);
    });
    if (this._rendered) {
      this._rendered.replaceWith(html);
    } else {
      if (this.method === 'append') {
        this.el.append(html);
      } else {
        this.el.html(html);
      }
    }
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
