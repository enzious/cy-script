namespace JSX {
  interface String { }
  interface IntrinsicElements {
    [tagName: string]: any;
  }
}

interface Window {
  fuzionElectron: any;
  i18next: any;
  gateKeeper: any;
  gateKeeperError: any;
  globalStylesheets: string;
  globalStylesheetsAsLitHtml: any[];
}

interface JQuery {
  routerLink(): JQuery;
  inject(...args): any;
  select2(...args): any;
}

var html: (strings: TemplateStringsArray, ...values: unknown[]) => TemplateResult;

var globalStylesheets: any[];
var globalStylesheetsAsLitHtml: any[];

declare var Backbone: Backbone;
declare type TemplateResult = any;
