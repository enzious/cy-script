/*!
 **|  CyTube PM Enhancements
 **|  Copyright Xaekai 2014 - 2016
 **|  Version 2016.06.05.0011
 **|
 **@preserve
 */
if (!window[CHANNEL.name]) window[CHANNEL.name] = {};
(function (CyTube_Better_PM) {
  return CyTube_Better_PM(window, document, window.jQuery)
})(function (window, document, $, undefined) {
  if (typeof Storage === "undefined") {
    //console.info("[XaeTube: Better PMs] localStorage not supported. Aborting load.");
    return
  } else {
    //console.info("[XaeTube: Better PMs] Loading Module.");
    if (localStorage[CHANNEL.name + "_BetterPM_PrevOpen"] == undefined) {
      localStorage[CHANNEL.name + "_BetterPM_PrevOpen"] = JSON.stringify([])
    }
    try {
      var data = JSON.parse(localStorage[CHANNEL.name + "_BetterPM_PrevOpen"]);
      if (!Array.isArray(data)) {
        throw null;
      }
    } catch (ex) {
      localStorage[CHANNEL.name + "_BetterPM_PrevOpen"] = JSON.stringify([])
    }
  }
  var BetterPMs = window[CHANNEL.name]["BetterPMs"] = {
    previouslyOpen: JSON.parse(localStorage[CHANNEL.name + "_BetterPM_PrevOpen"] || "[]"),
    openCache: {},
    flushCache: function () {
      Object.keys(this.openCache).forEach(function (coresp) {
        localStorage[CHANNEL.name + "_BetterPM_History_" + coresp] = JSON.stringify(this["openCache"][coresp])
      }.bind(this));
      return true
    },
    deployCache: function (coresp) {
      if (localStorage[CHANNEL.name + "_BetterPM_History_" + coresp] == undefined) {
        return
      }
      this.initCache(coresp);
      this["openCache"][coresp].slice(this["openCache"][coresp].length > 50 ? this["openCache"][coresp].length - 50 : 0).forEach((i => {
        Callbacks.pm(i, true)
      }));
      return true
    },
    scheduleFlush: function () {
      this.flushCache();
      return true
    },
    initCache: function (coresp) {
      if (typeof this.openCache[coresp] === "undefined") {
        this.openCache[coresp] = JSON.parse(localStorage[CHANNEL.name + "_BetterPM_History_" + coresp])
      }
      return true
    },
    saveOpen: function () {
      var currOpen = [];
      $("#pmbar > div[id^=pm]:not(.pm-panel-placeholder)").each(function () {
        currOpen.push($(this).attr("id").replace(/^pm-/, ""))
      });
      localStorage[CHANNEL.name + "_BetterPM_PrevOpen"] = JSON.stringify(currOpen);
      return true
    },
    pushNewPrivMsg: function (coresp, msg) {
      if (localStorage[CHANNEL.name + "_BetterPM_History_" + coresp] == undefined) {
        localStorage[CHANNEL.name + "_BetterPM_History_" + coresp] = JSON.stringify([])
      }
      this.initCache(coresp);
      this.openCache[coresp].push(msg);
      this.scheduleFlush();
      return true
    }
  };
  window.initPm = function (user) {
    if ($("#pm-" + user).length > 0) {
      return $("#pm-" + user)
    }
    var pm = $("<div/>").addClass("panel panel-default pm-panel").appendTo($("#pmbar")).data("last", {
      name: ""
    }).attr("id", "pm-" + user);
    var title = $("<div/>").addClass("panel-heading").text(user).appendTo(pm);
    var close = $("<button/>").addClass("close pull-right").html("&times;").appendTo(title).click(function () {
      pm.remove();
      $("#pm-placeholder-" + user).remove()
    });
    var body = $("<div/>").addClass("panel-body").appendTo(pm).hide();
    var placeholder;
    title.click(function () {
      body.toggle();
      pm.removeClass("panel-primary").addClass("panel-default");
      if (!body.is(":hidden")) {
        placeholder = $("<div/>").addClass("pm-panel-placeholder").attr("id", "pm-placeholder-" + user).insertAfter(pm);
        var left = pm.position().left;
        pm.css("position", "absolute").css("bottom", "0px").css("left", left)
      } else {
        pm.css("position", "");
        $("#pm-placeholder-" + user).remove()
      }
    });
    var buffer = $("<div/>").addClass("pm-buffer linewrap").appendTo(body);
    $("<hr/>").appendTo(body);
    var input = $("<input/>").addClass("form-control pm-input").attr("type", "text").attr("maxlength", 240).appendTo(body);
    input.keydown(function (ev) {
      if (ev.keyCode === 13) {
        if (CHATTHROTTLE) {
          return
        }
        var meta = {};
        var msg = input.val();
        if (msg.trim() === "") {
          return
        }
        if (USEROPTS.modhat && CLIENT.rank >= Rank.Moderator) {
          meta.modflair = CLIENT.rank
        }
        if (CLIENT.rank >= 2 && msg.indexOf("/m ") === 0) {
          meta.modflair = CLIENT.rank;
          msg = msg.substring(3)
        }
        socket.emit("pm", {
          to: user,
          msg: msg,
          meta: meta
        });
        input.val("")
      }
    });
    BetterPMs.deployCache(user);
    ({
      startCheck: function (user) {
        if (!$("#pm-" + user).length) {
          return
        }
        var buffer = initPm(user).find(".pm-buffer");
        if (buffer.children().last().length) {
          buffer.children().last()[0].scrollIntoView()
        }
        buffer[0].scrollTop = buffer[0].scrollHeight;
        if (buffer[0].scrollHeight == this.scrollHeight && this.scrollHeight !== 0) {
          return
        } else {
          this.scrollHeight = buffer[0].scrollHeight;
          setTimeout(this.startCheck.bind(this), this.timeout, user)
        }
      },
      scrollHeight: -1,
      timeout: 250
    }).startCheck(user);
    return pm
  };
  window.Callbacks.pm = function (data, backlog) {
    var name = data.username;
    if (IGNORED.indexOf(name) !== -1) {
      return
    }
    if (name == CHANNEL.bot && CLIENT.name !== "Kamikze") {
      return window[CHANNEL.name].VirtualWhisper(name + ": " + data.msg)
    }
    if (data.username === CLIENT.name) {
      name = data.to
    } else {
      pingMessage(true)
    }
    var pm = initPm(name);
    var buffer = pm.find(".pm-buffer");
    var msg = formatChatMessage(data, pm.data("last"));
    msg.appendTo(buffer);
    buffer.scrollTop(buffer.prop("scrollHeight"));
    if (pm.find(".panel-body").is(":hidden")) {
      pm.removeClass("panel-default").addClass("panel-primary")
    }
    if (!backlog) {
      var coresp = CLIENT.name !== data.username ? data.username : data.to;
      BetterPMs.pushNewPrivMsg(coresp, data)
    }
  };
  $("#pmbar > div[id^=pm]:not(.pm-panel-placeholder)").each(function () {
    var currentUser = $(this).attr("id").replace(/^pm-/, "");
    BetterPMs.previouslyOpen.push(currentUser);
    $(this).find("div.pm-buffer").each(function () {
      return
    })
  });
  localStorage[CHANNEL.name + "_BetterPM_PrevOpen"] == JSON.stringify([]);
  BetterPMs.previouslyOpen.forEach((user => {
    initPm(user)
  }));
  $(window).on("unload.openprivs", function () {
    BetterPMs.saveOpen();
    BetterPMs.flushCache()
  })
});