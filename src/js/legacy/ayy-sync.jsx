(function (cyScript) {

  'use strict';

  // prevent overload

  if (window.AyySync) return;
  window.AyySync = {
    options: {
      startFullscreened: false,
    }
  };
  //console.log("AyySync started");

  var body = jQuery(document.body);
  var vidCon = body.find(".embed-responsive");
  var vidElement;

  // fix

  $('.plcontrol-collapse > .input-group').addClass('input-group-sm');

  // left floating panel

  var fwChatPanel = $("<div class=\"fw-chat-panel\"><div class=\"inner\"></div></div>");
  fwChatPanel.appendTo($(".embed-responsive"));

  // left floating controls

  var fwChatControls = $(
    <div class="fw-chat-controls">
      <a class="button chat">
        <i class="glyphicon glyphicon-comment"></i>
        <span class="button-label">Toggle&nbsp;Chat</span>
      </a>
      <a class="button fw-overlay-toggle">
        <i class="glyphicon glyphicon-pause"></i>
        <span class="button-label">Toggle&nbsp;FW&nbsp;Overlay</span>
      </a>
      <a class="button fw-chat-right-toggle">
        <i class="glyphicon glyphicon-resize-horizontal"></i>
        <span class="button-label">Change&nbsp;Chat&nbsp;Side</span>
      </a>
      <a class="button fw-close">
        <i class="glyphicon glyphicon-remove"></i>
        <span class="button-label">Exit&nbsp;Full&nbsp;Window</span>
      </a>
    </div>
  );
  fwChatControls.appendTo($(".embed-responsive"));

  // add left control actions

  fwChatControls.find("a.chat").on("click", function () {
    body.toggleClass("fw-chat-open");
    localStorage.setItem('showFullscreenChat',
      localStorage.getItem('showFullscreenChat') === 'false' ? 'true' : 'false');
  });
  fwChatControls.find("a.fw-close").on("click", function () {
    toggleFw();
    localStorage.setItem('enableFullscreen',
      localStorage.getItem('enableFullscreen') === 'false' ? 'true' : 'false');
  });
  fwChatControls.find("a.fw-overlay-toggle").on("click", function () {
    toggleFwOverlay();
    localStorage.setItem('enableFullscreenOverlay',
      localStorage.getItem('enableFullscreenOverlay') === 'false' ? 'true' : 'false');
  });
  fwChatControls.find("a.fw-chat-right-toggle").on("click", function () {
    toggleFwChatRight();
    localStorage.setItem('fullscreenChatRight',
      localStorage.getItem('fullscreenChatRight') === 'false' ? 'true' : 'false');
  });
  $(
    <button id="fw-leftcontrols-toggle" title="Toggle Cinema Mode"
      class="btn btn-default btn-sm">
      <i class="fa fa-toggle-off"></i>
            Cinema
            <i class="fa fa-ticket"></i>
    </button>
  )
    .on('click', () => {
      toggleFw();
      localStorage.setItem('enableFullscreen',
        localStorage.getItem('enableFullscreen') === 'false' ? 'true' : 'false');
    })
    .appendTo($("#leftcontrols"));


  /*$(document).keydown(function(e) {
      if (e.which === 32 && e.shiftKey) {
          body.toggleClass("fw-chat-open");
          $("#chatline").focus();
          e.stopPropagation();
          e.preventDefault();
      }
  });*/

  // right floating controls

  var fwAuxControls = $("\
            <div class=\"fw-aux-controls\">\
                <a class=\"button kill\">\
                    <i class=\"glyphicon glyphicon-trash\"></i>\
                    <span class=\"button-label\">Local&nbsp;Skip&nbsp;Video</span>\
                </a>\
                <a class=\"button skip display-none fw-showOn\">\
                    <i class=\"glyphicon glyphicon-step-forward\"></i>\
                    <span class=\"button-label\">Vote&nbsp;Skip</span>\
                </a>\
            </div>");

  // add right control actions

  fwAuxControls.find(".kill").on("click", function () {
    if (vidCon.find("object, embed, iframe, video").length === 0) {
      reloadMedia();
    } else {
      getVidElement().remove();
      killScreen.appendTo(vidCon);
      checkKillScreen();
    }
  });
  var checkKillScreen = function () {
    if (vidCon.find(".killScreen").length) {
      fwAuxControls.find(".kill").addClass("selected");
    } else {
      fwAuxControls.find(".kill").removeClass("selected");
    }
  };
  var voteSkip = fwAuxControls.find(".skip").detach();
  $("#voteskip").click(function () {
    voteSkip.detach();
  });
  voteSkip.click(function () {
    socket.emit("voteskip");
    voteSkip.detach();
    $("#voteskip").attr("disabled", true);
  });

  var channelOpts = CHANNEL ? CHANNEL.opts : null;

  fwAuxControls.appendTo($(".embed-responsive"));

  // full window button in header

  var fullWindowBtn = jQuery("<li>", {
    "class": "fw-start",
    css: {
      cursor: "pointer"
    }
  });
  fullWindowBtn
    .on("click", function () {
      toggleFw();
      localStorage.setItem('enableFullscreen',
        localStorage.getItem('enableFullscreen') === 'false' ? 'true' : 'false');
    })
    .append(jQuery("<a>", { "class": "glyphicon glyphicon-fullscreen" }));
  cyScript.on('initialize', () => {
    fullWindowBtn
      .appendTo(body.find("#nav-collapsible .nav.navbar-nav.navbar-left"))
  });

  // full window toggle function

  var appendTo = $($("#main > div")[0]).attr("id") === "videowrap";
  var toggleFw = function () {
    vidCon.find(".videochatContainer").empty();
    if (body.hasClass("fw")) {
      if (CLIENT._hideNav) $('.navbar').hide();
      body.removeClass("fw");
      jQuery("#guestlogin, #chatline")
        .detach().insertAfter($("#messagebuffer"));
      $(cyScript.header).prependTo($('#wrap'));
      $("#controlsrow").insertAfter($("#main"));
      appendTo ? $("#chatwrap").appendTo($("#main")) : $("#chatwrap").prependTo($("#main"));
      handleVideoResize();
      $('#fw-leftcontrols-toggle').find('i.fa').first().attr('class', 'fa fa-toggle-off');
      $('.fw-start').removeClass('active');
      SCROLLCHAT = true;
    } else {
      if (CLIENT._hideNav) $('.navbar').show();
      body.addClass("fw");
      jQuery("#guestlogin, #chatline")
        .detach().appendTo(document.body);
      $(cyScript.header).prependTo(body);
      $("#controlsrow").insertAfter(cyScript.header);
      $(window).scrollTop(0);
      $("#chatwrap").appendTo($(".fw-chat-panel > .inner"));
      $('#fw-leftcontrols-toggle').find('i.fa').first().attr('class', 'fa fa-toggle-on text-success');
      $('.fw-start').addClass('active');
      SCROLLCHAT = true;
    }
    setTimeout(function () {
      window.handleVideoResize();
      scrollChat();
    }, 50);
  };
  var toggleFwOverlay = function () {
    if (body.hasClass("fw-overlay")) {
      body.removeClass("fw-overlay");
    } else {
      body.addClass("fw-overlay");
    }
    setTimeout(function () {
      window.handleVideoResize();
      scrollChat();
    }, 50);
  };
  var toggleFwChatRight = function () {
    if (body.hasClass("fw-chat-right")) {
      body.removeClass("fw-chat-right");
    } else {
      body.addClass("fw-chat-right");
    }
    scrollChat();
    setTimeout(function () {
      window.handleVideoResize();
      scrollChat();
    }, 50);
  };

  // kill screen for when video is local skipped

  var killScreen = $(
    <div class="killScreen">
      <br /><br /><br />
         Video Locally Skipped
         <br /><br />
         Waiting for next video to start...
      </div>
  );

  // revive the video on change of media

  function getVidElement() {
    return vidCon.find("object, embed, iframe, video");
  }

  // hook channelCSSJS

  var oldChannelCSSJS = Callbacks.channelCSSJS;
  Callbacks.channelCSSJS = function (data) {
    if (!channelOpts) socket.on("channelOpts", function (opts) {
      channelOpts = opts;
    });
    if (data && data.js && data.js.indexOf("AyySync.onXaekaiLoaded();") === -1) {
      data.js = data.js.replace("console.info(\"Xaekai's Script Sequencer: Loading Complete.\")",
        "console.info(\"Xaekai's Script Sequencer: Loading Complete.\");AyySync.onXaekaiLoaded(null);");
    }
    oldChannelCSSJS(data);
  };

  // hook changeMedia

  var currentVideoData, oldChangeMedia;
  var newChangeMedia = function (data, options) {
    if (channelOpts) {
      if (channelOpts.allow_voteskip) {
        voteSkip.appendTo(fwAuxControls);
      } else {
        voteSkip.detach();
      }
    }

    options = options || {};

    currentVideoData = data || currentVideoData;

    reloadMedia();
  };
  var reloadMedia = function (options) {
    options = options || {};

    var reattachVidElement = function () {
      if (vidCon.find(".killScreen").length && options.preserveKillScreen !== true) {
        killScreen.detach();
      }
      if (vidCon.find("object, embed, iframe, video").length === 0) {
        $("<iframe>", { id: "ytapiplayer", "class": "embed-responsive-item display-none" })
          .appendTo(vidCon);
      }
    };

    //console.log("currentVideoData", new Date(), currentVideoData);

    reattachVidElement();
    if (PLAYER && PLAYER.mediaType)
      PLAYER.mediaType = null;
    oldChangeMedia(currentVideoData);
    checkKillScreen();
  };
  var assertDominance = function () {
    if (window.Callbacks.changeMedia !== newChangeMedia) {
      oldChangeMedia = window.Callbacks.changeMedia;
      window.Callbacks.changeMedia = newChangeMedia;
    }
  };
  assertDominance();

  var mousemoveTimeout = null;
  function active() {
    clearTimeout(mousemoveTimeout);
    mousemoveTimeout = null;
    body.removeClass("inactive");
  }
  function inactive() {
    body.addClass("inactive");
  }
  $(body).on("mousemove", function () {
    if (mousemoveTimeout === null) {
      active();
    }
    clearTimeout(mousemoveTimeout);
    mousemoveTimeout = null;
    mousemoveTimeout = setTimeout(function () {
      inactive();
    }, 10000);
  });

  // prune navbar

  var navbarItems = $(body).find(".navbar .nav > li");
  $.each(navbarItems, function (i, e) {
    /*if ($(e).html().indexOf("Layout") !== -1) {
        $(e).remove();
    }*/
  });

  //$('#modflair, .msgsecbutton, #AudioNoticeSqueeToggle, #topbutton, #animationbutton').detach();
  $('#chatheader').css('overflow', 'visible');

  // hooking for xaekai

  window.cyScript.on('legacy-loaded', function () {
    //$('#modflair, .msgsecbutton, #AudioNoticeSqueeToggle, #topbutton, #animationbutton').detach();

    //console.log('AyySync legacy-loaded triggered.');

    assertDominance();

    // fix
    $("#pad_notes_wrap").addClass("well");
    $("#emote_suggest").addClass("well");
    $("#colorFilters").remove();
    $("#cinematoggle").remove();

    $('.plcontrol-collapse > .input-group').addClass('input-group-sm');
    $("#plcontrol button").button();
    $("#plcontrol button").button("hide");
    $(".plcontrol-collapse").collapse({ toggle: false });

    $('#customSettingsModalTrigger').html('\
          Channel <span class="fa fa-cog"></span>\
        ').attr('title', 'Channel preferences');
    $('#emotelistbtn').html('\
          <i class="fa fa-puzzle-piece"></i> Emotes\
        ').attr('title', 'Browse emotes');
    $('#newpollbtn').html('\
          <i class="fa fa-bar-chart"></i> Poll\
        ').attr('title', 'Create new poll');

    // Add self clear
    $('#leftcontrols').append(
      <button title="Client chat clear" id="selfClearbtn" className="btn btn-default btn-sm">
        <i className="fa fa-times"></i>
                Self Clear
            </button>
    );
    $('#selfClearbtn').on("click", function () {
      $("#messagebuffer").html("");
    });

    /*$('.navbar-nav li').each(function(i, e) {
      var text = $($(e).find('a')[0]);
      if (text.length > 0) {
        switch (/^[/w]*([a-zA-Z]*)/.exec($(text).html().trim().toLowerCase())[0]) {
          case 'mention':
            $(text).html('<strong>@</strong> Mentions');
            break;
        }
      }
    });*/
    fullWindowBtn.appendTo(body.find("#nav-collapsible .nav.navbar-nav.navbar-left"));

    $("#videowrap-header").addClass('clearfix');
    (() => {
      var ytapiplayer;
      window.handleVideoResize = function () {
        ytapiplayer = $("#ytapiplayer");
        if (ytapiplayer.length === 0) return;

        var intv, ticks = 0, height;
        var resize = function () {
          if (++ticks > 10) clearInterval(intv);
          if (ytapiplayer.parent().outerHeight() <= 0) return;
          clearInterval(intv);

          var responsiveFrame = $(ytapiplayer).parent();
          if ($(document.body).hasClass('fw')) {
            if ($(document.body).hasClass('fw-overlay')) {
              height = responsiveFrame.outerHeight() - $("#chatline").outerHeight() - 45 - $('#chatheader').outerHeight();
            } else {
              height = responsiveFrame.outerHeight() - $("#chatline").outerHeight() - $('#chatheader').outerHeight();
            }
          } else {
            height = responsiveFrame.outerHeight() - $("#chatline").outerHeight() - 1
              + $("#videowrap-header").outerHeight() - $('#chatheader').outerHeight();
          }
          $("#messagebuffer").css({ height: height });
          $("#userlist").css({ height: height });

          ytapiplayer
            .attr("height", VHEIGHT = responsiveFrame.outerHeight())
            .attr("width", VWIDTH = responsiveFrame.outerWidth());
        };

        if (ytapiplayer.height() > 0) resize();
        else intv = setInterval(resize, 500);
      };
      window.handleVideoResize();
      setInterval(() => { window.handleVideoResize(); }, 1500);
    })();

  });

  $(window).on('resize', function () {
    SCROLLCHAT = true;
    scrollChat();
  });

  /*if (localStorage.getItem('enableFullscreen') === 'true') {
      toggleFw();
  }*/
  if (localStorage.getItem('showFullscreenChat') === 'true' || localStorage.getItem('showFullscreenChat') === null) {
    body.toggleClass("fw-chat-open");
  }
  if (localStorage.getItem('enableFullscreenOverlay') === 'true') {
    toggleFwOverlay();
  }
  if (localStorage.getItem('fullscreenChatRight') === 'true' || localStorage.getItem('fullscreenChatRight') === null) {
    toggleFwChatRight();
  }

})(window.cyScript);
