import Logger from 'js/util/logger';

import { initializeChat, } from 'js/gui/chat';
import { initializeHeader, } from 'js/gui/header';
import { initializeBanners, } from 'js/gui/banners';
import { initializePlaylist, } from 'js/gui/playlist';
import { initializeVidResize, } from 'js/gui/video';
import { initializePoll, } from 'js/gui/poll';

class CyScript extends PlainComponent {
  options: any;
  logger: Logger;
  smartAfkActive: boolean = false;

  constructor(options: any) {
    super();
    this.options = Object.assign({
    }, options || {});

    (window as any).cyScript = this;

    this.logger = new Logger();

    this.on('legacy-loaded', () => {
      let init = () => {
        this.init();
      }
      if ((window as any).documentReady) {
        init();
      } else {
        $(() => init());
      }
    });
  }

  init() {
    initializeHeader(this);
    initializeChat(this);
    initializeBanners(this);
    initializePlaylist(this);
    initializePoll(this);
    initializeVidResize(this);

    this.trigger('initialized');
  }

  getClient(): any {
    let client = (window as any).CLIENT;
    return client;
  }

  getUsername() {
    let client = this.getClient();
    return client.name !== "" ? client.name : null;
  }

  getAfk() {
    let username = this.getUsername();
    if (username === null) {
      return null;
    }
    return $(`.userlist-${username}`).parent().hasClass('userlist_afk');
  }

  setAfk(afk: boolean) {
    let isAfk = this.getAfk();
    if (isAfk === null) {
      return null;
    }
    if (afk !== isAfk) {
      (window as any).socket.emit('chatMsg', {msg: '/afk'});
    }
  }

  smartAfk(afk: boolean) {
    let isAfk = this.getAfk();
    if (isAfk === null) {
      return;
    }
    if (this.smartAfkActive !== afk) {
      if (afk === true) {
        this.smartAfkActive = true;

        this.setAfk(true);
        $(window).one('mousemove', () => {
          this.smartAfkActive = false;
          this.setAfk(false);
        })
      }
    }
  }
}

(window as any).CyScript = CyScript;
export default CyScript;
