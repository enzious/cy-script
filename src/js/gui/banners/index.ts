export const initializeBanners = () => {
  new ChannelBanners();
};

const banners = window.cyScriptConfigs.config?.banners || [];

class ChannelBanners extends PlainComponent {
  timeout: number = 60 * 1000;
  banners: string[] = banners;
  currentBanner: string | null = null;

  constructor() {
    super();
    this.setElement(document.querySelector('div#pollwrap'));
    this.currentBanner = this.banners.pop();
    this.cycle();
  }

  deployBanner() {
    this.el.style.backgroundImage = `url('${this.currentBanner}')`;
  }

  chooseBanner() {
    if (this.banners.length) {
      var newBanner = this.banners.splice(Math.floor(Math.random() * this.banners.length), 1).shift();
      this.banners.unshift(this.currentBanner);
      this.currentBanner = newBanner;
    }
  }

  cycle() {
    this.chooseBanner();
    this.deployBanner();
    setTimeout(() => this.cycle(), this.timeout)
  }
}
