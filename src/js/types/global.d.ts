namespace JSX {
  interface String { }
  interface IntrinsicElements {
    [tagName: string]: any;
  }
}

interface JQuery {
  routerLink(): JQuery;
  inject(...args): any;
  select2(...args): any;
}

declare var Backbone: Backbone;
