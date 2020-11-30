namespace JSX {
  interface String { }
  interface IntrinsicElements {
    [tagName: string]: any;
  }
}

interface Window {
  PAGETITLE: string;
  socket: any;
  BootstrapDialog: any;
}

interface CHANNEL {
  name: string;
}

interface CLIENT {
  name: string;
}

interface JQuery {
  routerLink(): JQuery;
  inject(...args): any;
  select2(...args): any;
}

declare var Backbone: Backbone;
declare var BootstrapDialog: any;
declare var CHANNEL: CHANNEL;
declare var CLIENT: CLIENT;
declare var findUserlistItem: function (string): any;
