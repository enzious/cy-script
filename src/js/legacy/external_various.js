/*!
**|   Cytube Various Enhancements
**|   Copyright Xaekai 2014 - 2016
**|   Version 2017.12.23.1942
**|
**@requires md5
**@preserve
*/
(function (CyTube_Various) {
  return CyTube_Various(window, document, window.jQuery, Callbacks);
})(function (window, document, $, Callbacks, undefined) {
  if (typeof Storage === "undefined") {
    //console.error("[XaeTube: Various]", "localStorage not supported. Aborting load.");
    return;
  } else if (typeof window.md5 === "undefined") {
    //console.error("[XaeTube: Various]", "MD5 module not loaded. Aborting load.");
    return;
  }
  const options = Object.assign(
    {},
    {
      bodyClass: true,
      betterPolls: true,
      imagePolls: false,
      drinkbar: false,
      exports: true,
      hashedJS: true,
      navbar: false,
      notepad: false,
      regexlib: false,
      stylepad: false,
      emoteToggle: false,
    },
    window[CHANNEL.name].modulesOptions ? window[CHANNEL.name].modulesOptions.various : undefined
  );
  void (() => {
    if (!options.bodyClass) {
      return;
    }
    if (CLIENT.rank < 1) {
      return;
    }
    //console.info("[XaeTube: Various]", "Classing body.");
    const safeUsername = CLIENT.name.replace(/[^\w-]/g, "\\$");
    $("body").addClass(`user-${safeUsername}`);
  })();
  void (() => {
    if (!options.betterPolls) {
      return;
    }
    CHANNEL.imagePolls = options.imagePolls ? true : false;
    Callbacks.newPoll = function (data) {
      Callbacks.closePoll();
      var pollMsg = $("<div/>")
        .addClass("poll-notify")
        .html(data.initiator + ' opened a poll: "' + execEmotes(data.title) + '"')
        .appendTo($("#messagebuffer"));
      scrollChat();
      var poll = $("<div/>")
        .data("title", data.title)
        .data("options", JSON.stringify(data.options))
        .addClass("well active")
        .prependTo($("#pollwrap"));
      $("<button/>")
        .addClass("close pull-right")
        .html("&times;")
        .appendTo(poll)
        .click(function (ev) {
          if (hasPermission("pollctl") && ev.ctrlKey) {
            var parent = $(this).parent();
            var title = $("<span>").html(parent.data()["title"]).text();
            var polloptions = JSON.parse(parent.data()["options"]);
            polloptions.forEach((item, index, array) => {
              array[index] = $("<span>").html(item).text();
            });
            $("#pollwrap .poll-menu > .btn-danger").click();
            $("#newpollbtn").click();
            var menu = $("#pollwrap .poll-menu");
            var addbtn = menu.find("button:contains(Add Option)");
            menu.find("strong:contains(Title)").next("input").val(title);
            menu.find(".poll-menu-option").remove();
            for (var i = 0; i < polloptions.length; i++) {
              $("<input/>")
                .addClass("form-control")
                .attr("type", "text")
                .addClass("poll-menu-option")
                .val(polloptions[i])
                .insertBefore(addbtn);
            }
          }
          poll.remove();
        });
      $("<button/>")
        .addClass("btn btn-warning btn-sm pull-right dismiss")
        .html("Dismiss Poll")
        .appendTo(poll)
        .click(function () {
          poll.addClass("dismissed");
          $(this).remove();
        });
      if (hasPermission("pollctl")) {
        $("<button/>")
          .addClass("btn btn-danger btn-sm pull-right")
          .text("End Poll")
          .appendTo(poll)
          .click(function (ev) {
            if (ev.ctrlKey) {
              var parent = $(this).parent();
              var title = $("<span>").html(parent.data()["title"]).text();
              var polloptions = JSON.parse(parent.data()["options"]);
              polloptions.forEach((item, index, array) => {
                array[index] = $("<span>").html(item).text();
              });
              $("#pollwrap .poll-menu > .btn-danger").click();
              $("#newpollbtn").click();
              var menu = $("#pollwrap .poll-menu");
              var addbtn = menu.find("button:contains(Add Option)");
              menu.find("strong:contains(Title)").next("input").val(title);
              menu.find(".poll-menu-option").remove();
              for (var i = 0; i < polloptions.length; i++) {
                $("<input/>")
                  .addClass("form-control")
                  .attr("type", "text")
                  .addClass("poll-menu-option")
                  .val(polloptions[i])
                  .insertBefore(addbtn);
              }
              if (ev.shiftKey || ev.altKey) {
                return;
              }
            }
            socket.emit("closePoll");
  });
      }
      if (hasPermission("pollctl")) {
        $("<button/>")
              .addClass("btn btn-warning btn-sm pull-left")
              .html("Copy Poll")
              .appendTo(poll)
              .click(function () {
                var parent = $(this).parent();
                var title = $("<span>").html(parent.data()["title"]).text();
                var polloptions = JSON.parse(parent.data()["options"]);
                polloptions.forEach((item, index, array) => {
                  array[index] = $("<span>").html(item).text();
                });
                $("#pollwrap .poll-menu > .btn-danger").click();
                $("#newpollbtn").click();
                var menu = $("#pollwrap .poll-menu");
                var addbtn = menu.find("button:contains(Add Option)");
                menu.find("strong:contains(Title)").next("input").val(title);
                menu.find(".poll-menu-option").remove();
                for (var i = 0; i < polloptions.length; i++) {
                  $("<input/>")
                    .addClass("form-control")
                    .attr("type", "text")
                    .addClass("poll-menu-option")
                    .val(polloptions[i])
                    .insertBefore(addbtn);
                }
              });
      }
      $("<h3/>").html(execEmotes(data.title)).appendTo(poll);
      function decorate(text) {
        if (CHANNEL.imagePolls) {
          const regex = /<a href="([^"]+)" target/;
          if (regex.test(text)) {
            const [, url] = text.match(regex);
            if (url.match(/png|gif|jpe?g/i)) {
              text = `<img class="poll-image" src="${url}" />`;
            }
          }
        }
        return execEmotes(text);
      }
      let opti = 0;
      while (data.options.length) {
        const option = data.options.shift();
        (function (option, opti) {
          const callback = function () {
            socket.emit("vote", { option: opti });
            poll.find(".option button").each(function () {
              $(this).attr("disabled", "disabled");
            });
            $(this).parent().addClass("option-selected");
          };
          $("<button/>")
            .addClass("btn btn-default btn-sm")
            .text(data.counts[opti])
            .prependTo($("<div/>").addClass("option").html(decorate(option)).appendTo(poll))
            .click(callback);
        })(option, opti++);
      }
      let timestamp;
      if (data.timestamp) {
        timestamp = $("<span/>")
          .addClass("label label-default pull-right")
          .data("timestamp", data.timestamp)
          .text(new Date(data.timestamp).toTimeString().split(" ")[0])
          .appendTo(poll);
      }
      if (data.initiator) {
        timestamp.attr("title", "Poll opened by " + data.initiator).data("initiator", data.initiator);
      }
      poll.find(".btn").attr("disabled", !hasPermission("pollvote"));
    };
    if ($("#pollwrap .active").length && $(".poll-notify").length) {
      var poll = $("#pollwrap .active");
      var title = poll
        .find("h3")
        .text()
        .replace(/(https?:\/\/\w+\.\w+[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
      var timestamp = poll.find("span.label").data("timestamp");
      var choices = [],
        votes = [];
      poll.find("div.option > button").each(function () {
        votes.push($(this).text());
        $(this).remove();
      });
      poll.find("div.option").each(function () {
        choices.push($(this).text());
        $(this).remove();
      });
      poll.remove();
      choices.forEach((item, index, array) => {
        if (item.match(/https?:\/\/\w+\.\w+/)) {
          array[index] = item.replace(/(https?:\/\/\w+\.\w+[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        }
      });
      var blame = $(".poll-notify").first().text().split(" ").shift();
      $(".poll-notify").remove();
      Callbacks.newPoll({ title: title, options: choices, initiator: blame, counts: votes, timestamp: timestamp });
    }
  })();
  void (() => {
    if (!options.hashedJS) {
      return;
    }
    Callbacks.channelCSSJS = function (data) {
      $("#chancss").remove();
      CHANNEL.css = data.css;
      $("#cs-csstext").val(data.css);
      if (data.css && !USEROPTS.ignore_channelcss) {
        $("<style/>").attr("type", "text/css").attr("id", "chancss").text(data.css).appendTo($("head"));
      }
      $("#chanjs").remove();
      $("#cs-jstext").val(data.js);
      if (data.js && !USEROPTS.ignore_channeljs && md5(data.js) !== md5(CHANNEL.js)) {
        var src = data.js
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br>")
          .replace(/\t/g, "    ")
          .replace(/ /g, "&nbsp;");
        src = encodeURIComponent(src);
        var viewsource =
          "data:text/html, <body style='font: 9pt monospace;" +
          "max-width:60rem;margin:0 auto;padding:4rem;'>" +
          src +
          "</body>";
        checkScriptAccess(viewsource, "embedded", function (pref) {
          if (pref === "ALLOW") {
            $("<script/>").attr("type", "text/javascript").attr("id", "chanjs").text(data.js).appendTo($("body"));
          }
        });
      }
      CHANNEL.js = data.js;
    };
  })();
  ({
    toggleState: true,
    toggleButton: $("<span/>")
      .html('D<span class="toggle-label">rink</span>b<span class="toggle-label">ar</span>')
      .prop("id", "drinkbarToggle")
      .attr("title", "Toggle visibility of drinkbar")
      .addClass("pointer label label-info pull-right"),
    start: function () {
      if (!options.drinkbar) {
        return;
      }
      if (CLIENT.drinkbar) {
        return;
      } else {
        CLIENT.drinkbar = this;
      }
      $("#drinkbarwrap").show();
      if (!localStorage.getItem(`${CHANNEL.name}_drinkbarToggle`)) {
        localStorage.setItem(`${CHANNEL.name}_drinkbarToggle`, 1);
      } else {
        this.toggleState = parseInt(localStorage.getItem(`${CHANNEL.name}_drinkbarToggle`));
      }
      this.toggleButton.appendTo($("#chatheader"));
      this.toggleButton.on("click", this.toggle.bind(this));
      if (!this.toggleState) {
        this.toggleButton.removeClass("label-info").addClass("label-default");
        $("#drinkbarwrap").hide();
      }
    },
    toggle: function () {
      if (this.toggleState) {
        this.toggleState = false;
        this.toggleButton.addClass("label-default").removeClass("label-info");
        $("#drinkbarwrap").hide();
        localStorage.setItem(`${CHANNEL.name}_drinkbarToggle`, 0);
      } else {
        this.toggleState = true;
        this.toggleButton.removeClass("label-default").addClass("label-info");
        $("#drinkbarwrap").show();
        localStorage.setItem(`${CHANNEL.name}_drinkbarToggle`, 1);
      }
    },
  }.start());
  void (() => {
    if (!options.regexlib) {
      return;
    }
    $("#library_query").unbind("keydown");
    $("#library_query").on("keydown", function (ev) {
      if (ev.keyCode == 13) {
        if (!hasPermission("seeplaylist")) {
          $("#searchcontrol .alert").remove();
          var al = makeAlert(
            "Permission Denied",
            "This channel does not allow you to search its library",
            "alert-danger"
          );
          al.find(".alert").insertAfter($("#library_query").parent());
          return;
        }
        var query = $("#library_query").val();
        if (
          query
            .trim()
            .split(/\s+/)[0]
            .match(/^\/(.+)\/$/)
        ) {
          $(this).data(
            "regex",
            query
              .trim()
              .split(/\s+/)[0]
              .match(/^\/(.+)\/$/)[1]
          );
          socket.emit("searchMedia", { source: "library", query: "" });
          return;
        }
        socket.emit("searchMedia", { source: "library", query: query.toLowerCase() });
      }
    });
    Callbacks.searchResults = function (data) {
      $("#search_clear").remove();
      clearSearchResults();
      var regex = $("#library_query").data("regex");
      if (regex) {
        if (regex.toLowerCase() == regex) {
          regex = new RegExp(regex, "i");
        } else {
          regex = new RegExp(regex);
        }
        data.results = data.results
          .filter((i) => {
            return i.title.match(regex);
          })
          .sort((a, b) => {
            if (a.seconds < b.seconds) return -1;
            if (a.seconds > b.seconds) return 1;
            return 0;
          });
        $("#library").data("entries", data.results);
        $("#library_query").data("regex", null);
      } else {
        $("#library").data("entries", data.results);
      }
      $("<button/>")
        .addClass("btn btn-default btn-sm btn-block")
        .css("margin-left", "0")
        .attr("id", "search_clear")
        .text("Clear Results")
        .click(function () {
          clearSearchResults();
        })
        .insertBefore($("#library"));
      $("#search_pagination").remove();
      var opts = {
        preLoadPage: function () {
          $("#library").html("");
        },
        generator: function (item, page, index) {
          var li = makeSearchEntry(item, false);
          if (hasPermission("playlistadd")) {
            addLibraryButtons(li, item.id, data.source);
          }
          $(li).appendTo($("#library"));
        },
        itemsPerPage: 100,
      };
      var p = Paginate(data.results, opts);
      p.paginator.insertAfter($("#library")).addClass("pull-right").attr("id", "search_pagination");
      $("#library").data("paginator", p);
    };
  })();
  void (() => {
    if (!options.stylepad) {
      return;
    }
    if ($("#pad_css_wrap").length) {
      $("#pad_css_contents").remove();
      $("#pad_css_wrap").remove();
      $("#pad_css_sheet").remove();
    }
    $("<style>").prop("id", "pad_css_sheet").attr("type", "text/css").appendTo("head");
    $("<div>")
      .prop("id", "pad_css_wrap")
      .addClass("form-group")
      .append(
        $("<button>")
          .addClass("btn btn-info btn-xs pull-right")
          .text("Deploy")
          .click(function () {
            $("#pad_css_sheet").text($("#pad_css_contents").val());
          })
      )
      .append($("<label>").attr("for", "pad_css_container").text("CSS Pad"))
      .append(
        $("<span/>")
          .prop("id", "pad_css_container")
          .append(
            $("<textarea>")
              .prop("id", "pad_css_contents")
              .addClass("form-control")
              .attr("placeholder", "CSS Testing/Customization Box")
              .attr("rows", "10")
              .keyup(function () {
                var box = $(this);
                var value = box.val();
                var lastkey = Date.now();
                box.data("lastkey", lastkey);
                setTimeout(function () {
                  if (box.data("lastkey") !== lastkey || box.val() !== value) {
                    return;
                  }
                  localStorage.setItem(`${CHANNEL.name}_pad_css`, value);
                }, 1e3);
              })
          )
      )
      .appendTo("#leftpane");
    if (localStorage.getItem(`${CHANNEL.name}_pad_css`)) {
      $("#pad_css_contents").val(localStorage.getItem(`${CHANNEL.name}_pad_css`));
      $("#pad_css_sheet").text(localStorage.getItem(`${CHANNEL.name}_pad_css`));
    }
  })();
  void (() => {
    if (!options.notepad) {
      return;
    }
    if ($("#pad_notes_wrap").length) {
      $("#pad_notes_contents").remove();
      $("#pad_notes_wrap").remove();
    }
    $("<div>")
      .prop("id", "pad_notes_wrap")
      .addClass("form-group")
      .append(
        $("<button>")
          .addClass("close pull-right")
          .text("Ã—")
          .click(function () {
            return $(this).parent().remove();
          })
      )
      .append($("<label>").attr("for", "pad_notes_container").text("Scratch pad"))
      .append(
        $("<span/>")
          .prop("id", "pad_notes_container")
          .append(
            $("<textarea>")
              .prop("id", "pad_notes_contents")
              .addClass("form-control")
              .attr(
                "placeholder",
                "Page notes. You can store text here and it will persist between refreshes on the same browser. All data is stored client side."
              )
              .attr("rows", "10")
          )
      )
      .appendTo("#leftpane");
    if (!(localStorage[CHANNEL.name + "_scratchPad"] === undefined)) {
      $("#pad_notes_contents").val(localStorage[CHANNEL.name + "_scratchPad"]);
    }
    $("#pad_notes_contents").keyup(function () {
      var box = $(this);
      var value = box.val();
      var lastkey = Date.now();
      box.data("lastkey", lastkey);
      setTimeout(function () {
        if (box.data("lastkey") !== lastkey || box.val() !== value) {
          return;
        }
        localStorage[CHANNEL.name + "_scratchPad"] = value;
      }, 1e3);
    });
  })();
  void (() => {
    if (!options.exports) {
      return;
    }
    $("#cs-emotes-export").unbind("click");
    $("#cs-emotes-export").click(function () {
      var em = CHANNEL.emotes.map(function (f) {
        return { name: f.name, image: f.image };
      });
      $("#cs-emotes-exporttext").val(JSON.stringify(em).replace(/\},\{/g, "},\n{"));
    });
    $("#cs-chatfilters-export").unbind("click");
    $("#cs-chatfilters-export").click(function () {
      var callback = function (data) {
        socket.listeners("chatFilters").splice(socket.listeners("chatFilters").indexOf(callback));
        $("#cs-chatfilters-exporttext").val(JSON.stringify(data).replace(/\},\{/g, "},\n{"));
      };
      socket.on("chatFilters", callback);
      socket.emit("requestChatFilters");
    });
  })();
  void (() => {
    if (!options.navbar) {
      return;
    }
    $("<style>")
      .prop("id", "navbar-autohide")
      .attr("type", "text/css")
      .appendTo("head")
      .text(
        `\n@media screen and (min-width: 1024px){\n    nav.navbar:not(:hover) { opacity: 0.15; transition: opacity .5s ease-out;}\n    nav.navbar:hover { opacity: 1.00; transition: opacity .3s ease-out;}\n}\n`
      );
    function welcomeAvatar() {
      if (CLIENT && CLIENT.name && userlist()[CLIENT.name].profile.image && !CLIENT.welcomeAvatar) {
        CLIENT.welcomeAvatar = true;
        $("#logoutform").prepend(
          $("<img>").addClass("welcome-avatar").attr("src", userlist()[CLIENT.name].profile.image)
        );
      }
    }
    setTimeout(welcomeAvatar, 2e3);
  })();
  void (() => {
    if (!options.emoteToggle) {
      return;
    }
    $("<span/>")
      .html('Em<span class="toggle-label">otes</span>')
      .prop("id", "EmotesToggle")
      .attr("title", "Toggle Emotes")
      .addClass("pointer label pull-right")
      .addClass(!USEROPTS.no_emotes ? "label-info" : "label-default")
      .appendTo($("#chatheader"))
      .click(function () {
        var checkbox = $("#us-no-emotes");
        checkbox.prop("checked", !checkbox.prop("checked"));
        USEROPTS.no_emotes = checkbox.prop("checked");
        storeOpts();
        $(this).toggleClass("label-info label-default");
        if (USEROPTS.no_emotes) {
          $("#messagebuffer .channel-emote").each(function () {
            var emote = $(this);
            emote.replaceWith(
              '<span class="channel-emote-disabled" data-src="' +
                emote.attr("src") +
                '" data-emote="' +
                emote.attr("title") +
                '">' +
                emote.attr("title") +
                "</span>"
            );
          });
        } else {
          $("#messagebuffer .channel-emote-disabled").each(function () {
            var emote = $(this);
            emote.replaceWith(
              '<img class="channel-emote" src="' + emote.data().src + '" title="' + emote.data().emote + '">'
            );
          });
        }
        scrollChat();
      });
    window.execEmotes = function (msg) {
      if (USEROPTS.no_emotes) {
        CHANNEL.emotes.forEach(function (e) {
          msg = msg.replace(
            e.regex,
            '$1<span class="channel-emote-disabled" data-src="' +
              e.image +
              '" data-emote="' +
              e.name +
              '">' +
              e.name +
              "</span>"
          );
        });
        return msg;
      }
      CHANNEL.emotes.forEach(function (e) {
        msg = msg.replace(e.regex, '$1<img class="channel-emote" src="' + e.image + '" title="' + e.name + '">');
      });
      return msg;
    };
  })();
  void (() => {
    if (!options.NewBlock) {
      return;
    }
  })();
});
