import Logger from 'js/util/logger';

import { initializeChat, } from 'js/gui/chat';
import { initializeHeader, } from 'js/gui/header';
import { initializeBanners, } from 'js/gui/banners';
import { initializePlaylist, } from 'js/gui/playlist';
import { initializeVidResize, } from 'js/gui/video';
import { initializePoll, } from 'js/gui/poll';

const CyScript = Backbone.Model.extend({
  initialize: function(options) {
    this.options = Object.assign({
      defaultExample: true,
    }, options || {});

    window.cyScript = this;
    this.logger = new Logger();
    this.on('legacy-loaded', () => {
      let init = () => {
        window.cyScript.init();
      }
      if (documentReady) {
        init();
      } else {
        $(document).ready(init);
      }
    });
  },

  init: function() {
    initializeHeader(this);
    initializeChat(this);
    initializeBanners(this);
    initializePlaylist(this);
    initializePoll(this);
    initializeVidResize(this);

    this.trigger('initialized');
  },

  getUsername: function() {
    return CLIENT.name !== "" ? CLIENT.name : null;
  },
  getAfk: function() {
    let username = this.getUsername();
    if (username === null) {
      return null;
    }
    return $(`.userlist-${username}`).parent().hasClass('userlist_afk');
  },
  setAfk: function(afk) {
   
    let isAfk = this.getAfk();
    if (isAfk === null) {
      return null;
    }
    if (afk !== isAfk) {
      socket.emit('chatMsg', {msg: '/afk'});
    }
  },
  smartAfk: function(afk) {
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
  },
});

window.CyScript = CyScript;
export default CyScript;
