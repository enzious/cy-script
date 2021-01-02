/*!
 **|   CyTube Common Hotkeys
 **|   Copyright Xaekai 2014 - 2016
 **|   Version 2016.10.04.0100
 **|
 **@requires userlist
 **@optional whispers
 **@preserve
 */
if (!window[CHANNEL.name]) window[CHANNEL.name] = {};
(function (CyTube_HotKeys) {
  return CyTube_HotKeys(window, document, window.jQuery);
})(function (window, document, $, String, undefined) {
  const options = Object.assign(
    {},
    { boldtag: "**", italics: "__", spoiler: "spoiler" }
  );
  const KEYCODE = {
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    BACKSPACE: 8,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    ESC: 27,
  };
  var backspaceKey = false,
    shiftKey = false,
    ctrlKey = false,
    altKey = false,
    escCode = false;
  $(document).off("keydown.keytracker keyup.keytracker");
  $(document).on("keydown.keytracker", function (event) {
    switch (event.which) {
      case KEYCODE.BACKSPACE:
        backspaceKey = true;
        return;
      case KEYCODE.SHIFT:
        shiftKey = true;
        return;
      case KEYCODE.CTRL:
        ctrlKey = true;
        return;
      case KEYCODE.ALT:
        altKey = true;
        return;
    }
  });
  $(document).on("keyup.keytracker", function (event) {
    escCode = false;
    switch (event.which) {
      case KEYCODE.BACKSPACE:
        backspaceKey = false;
        return;
      case KEYCODE.SHIFT:
        shiftKey = false;
        return;
      case KEYCODE.CTRL:
        ctrlKey = false;
        return;
      case KEYCODE.ALT:
        altKey = false;
        return;
      case KEYCODE.ESC:
        escCode = true;
        return;
    }
  });
  $(window).off("beforeunload.backspacekiller");
  $(window).on("beforeunload.backspacekiller", function () {
    if (backspaceKey) {
      backspaceKey = false;
      return "Accidental pageback prevention:";
    }
  });
  $(document).off("keydown.hotkeys");
  $(document).on("keydown.hotkeys", function (event) {
    if (!event.shiftKey && !event.ctrlKey && event.altKey) {
      if (
        event.which === KEYCODE.W &&
        $("#fw-leftcontrols-toggle").length &&
        !(localStorage.getItem(`BrazilianKeyboard`) === "true")
      ) {
        $("#fw-leftcontrols-toggle").click();
        event.preventDefault();
        return false;
      }
      if (event.which === KEYCODE.S) {
        $("#messagebuffer").data(
          "spoilertype",
          $("#messagebuffer").data("spoilertype") === "hover"
            ? "click"
            : "hover"
        );
        $(".image-spoiler").each(function () {
          $(this)
            .attr("src", $(this).data()["spoiler"])
            .attr("data-spoiled", "false");
        });
        $("#messagebuffer").trigger(
          "whisper",
          `[System] Your spoiler setting is now: ${$("#messagebuffer").data(
            "spoilertype"
          )}.`
        );
        event.preventDefault();
        return false;
      }
    }
    if (!event.ctrlKey) return true;
    if (
      typeof event.target.selectionStart == "undefined" ||
      event.target.selectionStart == null
    )
      return true;
    var tag = { wrap: false, braced: false };
    var success = true;
    if (event.shiftKey) {
      switch (event.which) {
        case KEYCODE.B:
          tag.code = "blur";
          tag.wrap = true;
          tag.braced = true;
          break;
        case KEYCODE.S:
          tag.code = "shake";
          tag.wrap = true;
          tag.braced = true;
          break;
        default:
          success = false;
      }
    } else {
      switch (event.which) {
        case KEYCODE.W:
          if ($("#skinnytoggle").length) {
            $("#skinnytoggle").click();
            event.preventDefault();
          }
          return false;
        case KEYCODE.S:
          tag.code = "spoiler";
          tag.wrap = true;
          tag.braced = true;
          break;
        case KEYCODE.B:
          tag.code = "**";
          tag.wrap = true;
          break;
        case KEYCODE.I:
          tag.code = "__";
          tag.wrap = true;
          break;
        case KEYCODE.M:
          tag.code = "flop";
          tag.wrap = true;
          tag.braced = true;
          break;
        case KEYCODE.F:
          tag.code = "flip";
          tag.wrap = true;
          tag.braced = true;
          break;
        case 191:
          tag.code = "tilt-forward";
          tag.wrap = true;
          tag.braced = true;
          break;
        case 220:
          tag.code = "tilt-reverse";
          tag.wrap = true;
          tag.braced = true;
          break;
        case 192:
          tag.code = "~~";
          tag.wrap = true;
          break;
        case KEYCODE.P:
          tag.code = ".pic";
          break;
        default:
          success = false;
      }
    }
    if (!success) {
      return true;
    }
    if (!$(event.target).is("#chatline") && !$(event.target).is(".pm-input")) {
      return true;
    }
    var text = $(event.target).val();
    var start = event.target.selectionStart;
    var end = event.target.selectionEnd;
    var caret = text.length;
    var zero = start == end;
    var sell = end - start;
    if (tag.wrap && tag.braced) {
      text =
        text.slice(0, start) +
        "[" +
        tag.code +
        "]" +
        text.slice(start, end) +
        "[/" +
        tag.code +
        "]" +
        text.slice(end);
    } else if (tag.wrap) {
      text =
        text.slice(0, start) +
        tag.code +
        text.slice(start, end) +
        tag.code +
        text.slice(end);
    } else {
      text =
        text.slice(0, start) +
        text.slice(start, end) +
        tag.code +
        text.slice(end);
    }
    $(event.target).val(text);
    if (zero) {
      caret =
        end +
        tag.code.length +
        (function () {
          if (tag.braced) return 2;
          return 0;
        })();
      event.target.setSelectionRange(caret, caret);
    } else {
      end = $(event.target).val().length - caret + sell + start;
      event.target.setSelectionRange(start, end);
    }
    return false;
  });
  $("#messagebuffer").off("click.quickact");
  $("#messagebuffer").on("click.quickact", "strong.username", function (e) {
    var user = $(this)
      .parent()
      .parent()
      .attr("class")
      .match(/chat-msg-(\w+)/)[1];
    if (e.altKey && e.shiftKey && CLIENT.rank > 2) {
      if (userlist()[user]) {
        if (CLIENT.rank > userlist()[user].rank) {
          socket.emit("chatMsg", { msg: "/kick " + user + " Quick Kick" });
        }
      }
    }
    if (e.altKey) {
      return;
    }
    if (e.shiftKey) {
      return;
    }
    if (!e.ctrlKey) {
      return;
    }
    if (user) {
      initPm(user).find(".panel-heading").click();
    }
  });
  $("#chatline").off("paste.enhanced");
  $("#chatline").on("paste.enhanced", function (ev) {
    var text = (ev.originalEvent || ev).clipboardData.getData("text/plain");
    text =
      shiftKey &&
      /^https?:\/\/(?:\w+\.)*(?:\w+\.)(?:\w+)\/(?:\w+\/)*(?:[^ ]+)(?:png|gif|jpe?g)(?:[^ ]+)?$/.test(
        text
      )
        ? text + ".pic"
        : text;
    var success = document.execCommand("insertText", false, text);
    if (success) {
      ev.preventDefault();
    }
    if (escCode) {
      $("#chatline").trigger(
        (function () {
          var ev = jQuery.Event("keydown");
          ev.which = ev.keyCode = 13;
          escCode = false;
          return ev;
        })()
      );
    }
  });
});
