declare module '*.scss';
declare module '*.gif';
declare module '*.png';
declare module '*.mp3';
declare module '*.scss?lit';

declare module 'worker-loader!*' {
  // You need to change `Worker`, if you specified a different value for the `workerType` option
  class WebpackWorker extends Worker {
    constructor();
  }

  // Uncomment this if you set the `esModule` option to `false`
  // export = WebpackWorker;
  export default WebpackWorker;
}

declare module '!!raw-loader!*';