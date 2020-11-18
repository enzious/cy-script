/*
**
**  Banners
**
*/

// -- Channel Namespace --

if (!window[CHANNEL.name]) {
  window[CHANNEL.name] = {};
}

var banners = {};

banners['channelName'] = [
  //"https://<>/0.png",
];

// -- Banners Object
let initializeBanners = () => {
  window[CHANNEL.name].banners = ({
    target: $("div#pollwrap"),
    timeout: 60 * 1000,
    banners: banners[CHANNEL.name] || [],
    currentBanner: null,
    deployBanner: function() {
      this.target.css({ "background-image": String().concat('url(',this.currentBanner,')') });
    },
    chooseBanner: function() {
      var newBanner = this.banners.splice( Math.floor( Math.random() * this.banners.length ), 1 ).shift();
      this.banners.unshift(this.currentBanner);
      this.currentBanner = newBanner;
    },
    nextTick: null,
    cycle: function(){
      this.chooseBanner();
      this.deployBanner();
      this.nextTick = setTimeout(this.cycle.bind(this), this.timeout)
    },
    init: function(){
      this.currentBanner = this.banners.pop();
      this.cycle();
      return this;
    }
  }).init();
}

export { initializeBanners, };