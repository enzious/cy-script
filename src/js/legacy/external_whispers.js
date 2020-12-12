/*!
**|  CyTube Virtual Whispers and User Join/Leave messages for Everybody
**|  Written by Xaekai
**|  Copyright 2013-2016
**|
**@preserve
*/
(function (CyTube_Whispers) {
  return CyTube_Whispers(window, document, window.jQuery);
})(function (window, document, $, undefined) {
  const options = Object.assign(
    {},
    { joins: true, parts: true, cleanTick: 1e3, cleanMaxAge: 45 * 1e3 }
  );
  void {
    timeOffset: 0,
    cleanTick: options.cleanTick,
    cleanMaxAge: options.cleanMaxAge,
    reportJoins: options.joins,
    reportParts: options.parts,
    sync: function (data) {
      this.timeOffset = Date.now() - data.time;
    },
    start: function () {
      if (CLIENT.whispers) {
        return;
      } else {
        CLIENT.whispers = this;
      }
      setTimeout(() => {
        socket.once("chatMsg", this.sync);
      }, 2e3);
      setTimeout(() => {
        socket.once("chatMsg", this.sync);
      }, 3e4);
      setTimeout(() => {
        socket.once("chatMsg", this.sync);
      }, 12e4);
      $("#messagebuffer").on("whisper", (ev, msg) => {
        this.whisper(msg);
      });
      if (this.reportJoins) {
        socket.on("addUser", (data) => {
          this.userJoin(data);
        });
      }
      if (this.reportParts) {
        socket.on("userLeave", (data) => {
          this.userLeave(data);
        });
      }
      setInterval(
        (tickValue) => {
          this.cleanScan(tickValue);
        },
        this.cleanTick,
        this.cleanTick
      );
    },
    whisper: function (msg) {
      addChatMessage({
        time: Date.now() - this.timeOffset,
        username: "[server]",
        msg: msg,
        msgclass: "server-whisper",
        meta: { shadow: false, addClass: "server-whisper", addClassToNameAndTimestamp: true },
      });
    },
    userLeave: function (data) {
      this.checkOldLeaves(data.name);
      this.whisper(data.name + " disconnected");
    },
    userJoin: function (data) {
      this.checkOldJoins(data.name);
      if (2 > CLIENT.rank) {
        this.whisper(data.name + " joined");
      }
    },
    checkOldJoins: function (name) {
      const matches = $("div.chat-msg-\\\\\\$server\\\\\\$").filter((ind, cv) =>
        cv.innerText.match(`${name} joined`)
      );
      if (matches.length > 1) {
        matches.first().remove();
      }
    },
    checkOldLeaves: function (name) {
      const matches = $("div.chat-msg-\\\\\\$server\\\\\\$").filter((ind, cv) =>
        cv.innerText.match(`${name} disconnected`)
      );
      if (matches.length > 1) {
        matches.first().remove();
      }
    },
    cleanScan: function (tickValue) {
      var self = this;
      if (document.hidden) {
        $("div.chat-msg-\\\\\\$server\\\\\\$[data-expire]").each(function () {
          $(this).attr("data-expire", parseInt($(this).attr("data-expire")) + tickValue);
        });
        return;
      }
      $("div.chat-msg-\\\\\\$server\\\\\\$[data-expire]")
        .first()
        .each(function () {
          Date.now() > parseInt($(this).attr("data-expire")) && $(this).remove();
        });
      $("div.chat-msg-\\\\\\$server\\\\\\$:not([data-expire])").each(function () {
        $(this).attr("data-expire", Date.now() + self.cleanMaxAge);
      });
    },
  }.start();
});
