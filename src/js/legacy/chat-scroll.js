window.MAXMESSAGE = 100;

$("#messagebuffer").unbind('scroll');
$("#messagebuffer").scroll(function (ev) {
  if (IGNORE_SCROLL_EVENT) {
    // Skip event, this was triggered by scrollChat() and not by a user action.
    // Reset for next event.
    IGNORE_SCROLL_EVENT = false;
    return;
  }

  var m = $("#messagebuffer");
  var lastChildHeight = 0;
  var messages = m.children();
  if (messages.length > 0) {
    lastChildHeight = $(messages[messages.length - 1]).outerHeight() || 0;
  }

  var isCaughtUp = m.height() + m.scrollTop() >= m.prop("scrollHeight") - lastChildHeight;
  if (isCaughtUp) {
    SCROLLCHAT = true;
    window.MAXMESSAGES = 100;
    $("#newmessages-indicator").remove();
  } else {
    SCROLLCHAT = false;
  }
});

var lastUserMessage = {}
window.addChatMessage = function (data) {
  window.MAXMESSAGES = window.MAXMESSAGES !== undefined ? window.MAXMESSAGES : 100;
  if (IGNORED.indexOf(data.username) !== -1) {
    return;
  }
  if (data.meta.shadow && !USEROPTS.show_shadowchat) {
    return;
  }

  var msgBuf = $("#messagebuffer");
  var div = formatChatMessage(data, LASTCHAT);

  // Incoming: a bunch of crap for the feature where if you hover over
  // a message, it highlights messages from that user
  var safeUsername = data.username.replace(/[^\w-]/g, '\\$');
  div.addClass("chat-msg-" + safeUsername);
  div.appendTo(msgBuf);
  div.mouseover(function () {
    $(".chat-msg-" + safeUsername).addClass("nick-hover");
  });
  div.mouseleave(function () {
    $(".nick-hover").removeClass("nick-hover");
  });
  var oldHeight = msgBuf.prop("scrollHeight");
  //var numRemoved = trimChatBuffer();
  if (SCROLLCHAT) {
    scrollChat();
    trimChatBuffer();
  } else {
    if (MAXMESSAGES < 10000) { ++MAXMESSAGES; }
    var newMessageDiv = $("#newmessages-indicator");
    if (!newMessageDiv.length) {
      newMessageDiv = $("<div/>").attr("id", "newmessages-indicator")
        .appendTo($("#chatwrap"));
      var bgHack = $("<span/>").attr("id", "newmessages-indicator-bghack")
        .appendTo(newMessageDiv);
      $("<span/>").addClass("glyphicon glyphicon-chevron-down")
        .appendTo(bgHack);
      $("<span/>").text("New Messages Below").appendTo(bgHack);
      $("<span/>").addClass("glyphicon glyphicon-chevron-down")
        .appendTo(bgHack);
      newMessageDiv.click(function () {
        SCROLLCHAT = true;
        scrollChat();
        trimChatBuffer();
      });
    }

    // if (numRemoved > 0) {
    //     IGNORE_SCROLL_EVENT = true;
    //     var diff = oldHeight - msgBuf.prop("scrollHeight");
    //     scrollAndIgnoreEvent(msgBuf.scrollTop() - diff);
    // }
  }

  div.find("img").load(function () {
    if (SCROLLCHAT) {
      IGNORE_SCROLL_EVENT = true;
      scrollChat();
    } else if (SCROLLCHAT && $(this).position().top < 0) {
      scrollAndIgnoreEvent(msgBuf.scrollTop() + $(this).height());
    }
  });

  var isHighlight = false;
  if (CLIENT.name && data.username != CLIENT.name) {
    if (data.msg.toLowerCase().indexOf(CLIENT.name.toLowerCase()) != -1) {
      div.addClass("nick-highlight");
      isHighlight = true;
    }
  }

  pingMessage(isHighlight);
};

scrollChat();
