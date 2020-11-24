import { EventHandler, EventMap } from "backbone";

interface _Component {
  on(eventName: string, callback: EventHandler, context?: any): this;
  on(eventMap: EventMap, context?: any): this;
  off(eventName?: string, callback?: EventHandler, context?: any): this;
  trigger(eventName: string, ...args: any[]): this;
  bind(eventName: string, callback: EventHandler, context?: any): this;
  bind(eventMap: EventMap, context?: any): this;
  unbind(eventName?: string, callback?: EventHandler, context?: any): this;

  once(events: string, callback: EventHandler, context?: any): this;
  once(eventMap: EventMap, context?: any): this;
  listenTo(object: any, events: string, callback: EventHandler): this;
  listenTo(object: any, eventMap: EventMap): this;
  listenToOnce(object: any, events: string, callback: EventHandler): this;
  listenToOnce(object: any, eventMap: EventMap): this;
  stopListening(object?: any, events?: string, callback?: EventHandler): this;
}

class _Component {
  el: HTMLElement | null = null;

  constructor() {
    Object.assign(this, Backbone.Events);
  }

  getElement(): HTMLElement {
    return this.el as HTMLElement;
  }

  setElement(el: HTMLElement) {
    this.el = el;
  }

  injected() {
    this.trigger('inject');
  }

  inject(target: Element, where?: string) {
    if (this.el) {
      switch (where) {
        case 'before':
          jQuery(this.el).insertBefore(target);
          break;
        case 'after':
          jQuery(this.el).insertAfter(target);
          break;
        case 'prepend':
          jQuery(this.el).prependTo(target);
          break;
        default:
        case 'append':
          jQuery(this.el).appendTo(target);
          break;
      }
    }

    this.injected();

    return this;
  }

  detach() {
    if (this.el) {
      this.el.remove();
    }
  }

  close() {
    if (this.el) {
      this.el.remove();
    }
  }
}

export default _Component;

declare global {
  const PlainComponent: typeof _Component;
}