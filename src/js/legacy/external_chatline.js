(function (CyTube_ChatLine) {
  return CyTube_ChatLine(window, document, window.jQuery, String);
})(function (window, document, $, String, undefined) {
  if (!window[CHANNEL.name]) {
    window[CHANNEL.name] = {};
  }
  const extraCommands = Object.assign(
    {},
    {
      selfclear: function (msg) {
        Callbacks.clearchat();
      },
      sclear: function (msg) {
        Callbacks.clearchat();
      },
      spoiler: function (msg) {
        $("#messagebuffer").data(
          "spoilertype",
          $("#messagebuffer").data("spoilertype") === "hover" ? "click" : "hover"
        );
        $(".image-spoiler").each(function () {
          $(this)
            .attr("src", $(this).data()["spoiler"])
            .attr("data-spoiled", "false");
        });
        $("#messagebuffer").trigger(
          "whisper",
          String().concat(
            "[System] ","Your spoiler setting is now: ",
            $("#messagebuffer").data("spoilertype"),"."
          )
        );
      },
      wipesettings: function (msg) {
        Object.keys(localStorage)
          .filter((i) => {
            return i.match(new RegExp(`^${CHANNEL.name}`));
          })
          .each((i) => localStorage.removeItem(i));
        $("#messagebuffer").trigger(
          "whisper",
          String().concat("[System] ", "Your channel settings have been wiped.")
        );
      },
      smartpurge: function (msg) {
        if (CLIENT.rank >= CHANNEL.perms.playlistdelete) {
          playlist()
            .filter((i) => {
              return !(userlist(true).indexOf(i.addedby) > -1);
            })
            .each((i) => {
              socket.emit("delete", i.uid);
            });
          socket.emit("chatMsg", {
            msg: String().concat("/me ", "smartpurged the playlist."),
            meta: {},
          });
        } else {
          $("#messagebuffer").trigger("whisper",
            String().concat(
              "[System] ","You have insufficient permissions to use this."
            )
          );
        }
      },
    }
  );
  const preHooks = Object.assign(
    {},
    {
      example: function (msg) {
        return msg;
      },
    }
  );
  $("#chatline").on("registerCommand", (ev, cmd, fn) => {
    console.info("[Chatline]", "Registering command", cmd, fn);
    extraCommands[cmd] = fn;
  });
  $("#chatline").on("registerPreHook", (ev, hook, fn) => {
    console.info("[Chatline]", "Registering hook", hook, fn);
    preHooks[hook] = fn;
  });
  $("#chatline").unbind("keyup.enterHold");
  $("#chatline").on("keyup.enterHold", function (ev) {
    if (ev.keyCode === 13) {
      CLIENT.enterHold = false;
    }
  });
  $("#chatline").unbind("keydown");
  $("#chatline").keydown(function (ev) {
    if (ev.keyCode == 13) {
      if (CHATTHROTTLE) {
        return;
      }
      var msg = $("#chatline").val();
      var splitmsg = msg.trim().split(/\s+/);
      if (/^!|^\//.test(splitmsg[0])) {
        var command = splitmsg[0].substring(1);
        if (typeof extraCommands[command] === "function") {
          $("#chatline").val("");
          return extraCommands[command](msg, this);
        }
      }
      if (splitmsg[0] == "/pm") {
        splitmsg.shift();
        var user = splitmsg.shift();
        msg = splitmsg.join(" ").trim();
        if (userlist(true).indexOf(user) == -1) {
          window[CHANNEL.name].VirtualWhisper(
            String().concat("[System] User not found.")
          );
          return;
        }
        if (!$("#pm-" + user).length) {
          initPm(user).find(".panel-heading").click();
        } else {
          if (!msg.length) {
            window[CHANNEL.name].VirtualWhisper(
              String().concat(
                "[System] ","The PM window is already open retard."
              )
            );
          }
        }
        if (msg.length) {
          socket.emit("pm", { to: user, msg: msg, meta: {} });
        }
        $("#chatline").val("");
        return;
      }
      if (
        CLIENT.rank >= CHANNEL.perms.playlistmove &&
        splitmsg.length == 3 &&
        splitmsg[0] == "/move"
      ) {
        if (
          !isNaN(parseInt(splitmsg[1])) &&
          parseInt(splitmsg[1]) > 0 &&
          parseInt(splitmsg[1]) <= $("#queue li").length
        ) {
          if (
            !isNaN(parseInt(splitmsg[2])) &&
            parseInt(splitmsg[2]) > 0 &&
            parseInt(splitmsg[2]) <= $("#queue li").length
          ) {
            if (parseInt(splitmsg[2]) > parseInt(splitmsg[1])) {
              socket.emit("chatMsg", { msg: "/me moves a video.", meta: {} });
              socket.emit("moveMedia", {
                from: $("#queue li")
                  .eq(parseInt(splitmsg[1]) - 1)
                  .data("uid"),
                after: $("#queue li")
                  .eq(parseInt(splitmsg[2]) - 1)
                  .data("uid"),
              });
            } else {
              socket.emit("chatMsg", { msg: "/me moves a video.", meta: {} });
              socket.emit("moveMedia", {
                from: $("#queue li")
                  .eq(parseInt(splitmsg[1]) - 1)
                  .data("uid"),
                after: $("#queue li")
                  .eq(parseInt(splitmsg[2]) - 2)
                  .data("uid"),
              });
            }
          }
        }
        $("#chatline").val("");
        return;
      }
      if (
        splitmsg[0] == "/bump" &&
        CLIENT.rank >= CHANNEL.perms.playlistmove &&
        splitmsg.length >= 2
      ) {
        splitmsg.shift();
        var user = splitmsg.shift();
        var pos = splitmsg.length ? parseInt(splitmsg.shift()) : -1;
        var dest;
        console.log(user, pos);
        var bumped = $("#queue li")
          .filter(function (v, i) {
            return $(i).data()["blame"].toLowerCase() == user.toLowerCase();
          })
          .last();
        if (!bumped.length) {
          window[CHANNEL.name].VirtualWhisper(
            String().concat(
              "[MoveMedia] ","Video by user ",user," not found."
            )
          );
          $("#chatline").val("");
          return;
        }
        if (!(!isNaN(pos) && pos > 0 && pos <= $("#queue li").length)) {
          if (pos !== -1) {
            window[CHANNEL.name].VirtualWhisper(
              String().concat("[MoveMedia] ", "Destination doesn't exist.")
            );
            $("#chatline").val("");
            return;
          } else {
            dest = PL_CURRENT;
          }
        } else {
          dest = $("#queue li").eq(pos - 1).data("uid");
        }
        socket.emit("chatMsg", { msg: "/me moves a video.", meta: {} });
        socket.emit("moveMedia", { from: bumped.data("uid"), after: dest });
        $("#chatline").val("");
        return;
      }
      if (msg.trim()) {
        var meta = {};
        if (USEROPTS.adminhat && CLIENT.rank >= 255) {
          msg = "/a " + msg;
        } else if (USEROPTS.modhat && CLIENT.rank >= Rank.Moderator) {
          meta.modflair = CLIENT.rank;
        }
        if (CLIENT.rank >= 2 && msg.indexOf("/m ") === 0) {
          meta.modflair = CLIENT.rank;
          msg = msg.substring(3);
        }
        Object.keys(preHooks).forEach((hook) => {
          if (typeof preHooks[hook] === "function") {
            msg = preHooks[hook](msg);
          }
        });
        socket.emit("chatMsg", { msg: msg, meta: meta });
        CHATHIST.push($("#chatline").val());
        CHATHISTIDX = CHATHIST.length;
        $("#chatline").val("");
      } else {
        if (ev.ctrlKey && CHATHIST.length) {
          if (CLIENT.enterHold) {
            return;
          }
          CLIENT.enterHold = true;
          var msg = CHATHIST[CHATHIST.length - 1];
          var meta = {};
          if (USEROPTS.modhat && CLIENT.rank >= Rank.Moderator) {
            meta.modflair = CLIENT.rank;
          }
          Object.keys(preHooks).forEach((hook) => {
            if (typeof preHooks[hook] === "function") {
              msg = preHooks[hook](msg);
            }
          });
          socket.emit("chatMsg", { msg: msg, meta: meta });
        }
      }
      return false;
    } else if (ev.keyCode == 9) {
      chatTabComplete();
      ev.preventDefault();
      return false;
    } else if (ev.keyCode == 38) {
      if (CHATHISTIDX == CHATHIST.length) {
        CHATHIST.push($("#chatline").val());
      }
      if (CHATHISTIDX > 0) {
        CHATHISTIDX--;
        $("#chatline").val(CHATHIST[CHATHISTIDX]);
      }
      ev.preventDefault();
      return false;
    } else if (ev.keyCode == 40) {
      if (CHATHISTIDX < CHATHIST.length - 1) {
        CHATHISTIDX++;
        $("#chatline").val(CHATHIST[CHATHISTIDX]);
      }
      ev.preventDefault();
      return false;
    }
  });
  if (!$("#emote_suggest").length) {
    $("#chatwrap").append(
      '<div style="white-space: pre;" id="emote_suggest"></div>'
    );
  }
  function emoteSuggest(targets) {
    console.log("emoteSuggest");
    var possibles = "";
    for (var i = 0; i < Math.min(10, targets.length); i++) {
      possibles += targets[i] + "   ";
    }
    possibles.trim();
    $("#emote_suggest").stop(true, true);
    $("#emote_suggest")
      .html(possibles)
      .fadeIn(0, function () {
        $(this).delay(3e3).fadeOut(1e3);
      });
  }
  function doTabCompletion(words, current, rawTargets, targets, restline) {
    emoteSuggest(targets);
    var min = Math.min.apply(
      Math,
      targets.map(function (name) {
        return name.length;
      })
    );
    targets = targets.map(function (name) {
      return name.substring(0, min);
    });
    var changed = true;
    var iter = 21;
    while (changed) {
      changed = false;
      var first = targets[0];
      for (var i = 1; i < targets.length; i++) {
        if (targets[i] !== first) {
          changed = true;
          break;
        }
      }
      if (changed) {
        targets = targets.map(function (name) {
          return name.substring(0, name.length - 1);
        });
      }
      if (--iter < 0) {
        break;
      }
    }
    current = targets[0].substring(0, min);
    for (var i = 0; i < rawTargets.length; i++) {
      if (rawTargets[i].toLowerCase() === current) {
        current = rawTargets[i];
        break;
      }
    }
    if (targets.length === 1) {
      if (words.length === 1 && current[0].match(/[\w]/)) {
        current += ":";
      }
      current += " ";
    }
    words[words.length - 1] = current;
    var finishline = words.join(" ") + restline;
    if (finishline == $("#chatline")[0].value) {
      return;
    }
    $("#chatline").val(finishline);
    $("#chatline")[0].selectionStart =
      $("#chatline")[0].value.length - restline.length;
    $("#chatline")[0].selectionEnd =
      $("#chatline")[0].value.length - restline.length;
  }
  function chatTabComplete() {
    var midline = $("#chatline")[0].value;
    var restline = "";
    if ($("#chatline")[0].selectionStart == $("#chatline")[0].selectionEnd) {
      midline = $("#chatline")[0].value.slice(
        0,
        $("#chatline")[0].selectionStart
      );
      restline = $("#chatline")[0].value.slice(
        $("#chatline")[0].selectionStart
      );
    }
    var words = midline.split(/\s/);
    var current = words[words.length - 1].toLowerCase();
    if (!current.match(/^[\w-]{1,20}$/)) {
      return emoteTabComplete(words, current, restline);
    }
    var __slice = Array.prototype.slice;
    var usersWithCap = __slice
      .call($("#userlist").children())
      .map(function (elem) {
        return elem.children[1].innerHTML;
      });
    var users = __slice
      .call(usersWithCap)
      .map(function (user) {
        return user.toLowerCase();
      })
      .filter(function (name) {
        return name.indexOf(current) === 0;
      });
    if (users.length === 0) {
      return;
    }
    return doTabCompletion(words, current, usersWithCap, users, restline);
  }
  function emoteTabComplete(words, current, restline) {
    console.log(current);
    if (!CHANNEL.emotes || CHANNEL.emotes.length == 0) return;
    var emotesMaster = [];
    for (var i = 0; i < CHANNEL.emotes.length; i++) {
      if (CHANNEL.emotes[i].name[0].match(/^[^\w]/)) {
        emotesMaster.push(CHANNEL.emotes[i].name);
      }
    }
    var __slice = Array.prototype.slice;
    var emotes = __slice
      .call(emotesMaster)
      .map(function (emote) {
        return emote.toLowerCase();
      })
      .filter(function (emote) {
        return emote.indexOf(current) === 0;
      });
    if (emotes.length === 0) {
      return;
    }
    return doTabCompletion(words, current, emotesMaster, emotes, restline);
  }
  $("#chatline").data("advanced", true);
});
