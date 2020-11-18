let ChatOptions = Backbone.View.extend({
  initialize: function() {
    this.options = {};

    this.setElement(
      <div className="ChatOptions dropdown pull-right" style="padding-right: 0 !important;">
        <button className="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown"
            aria-haspopup="true"
            style="padding: 2px 5px 2px 5px; font-size: 11px; height: 20px; display: block;">
          &nbsp;<i className="fa fa-cog"></i>&nbsp;Options&nbsp;<span className="caret"></span>&nbsp;
        </button>
        <ul class="dropdown-menu">
        </ul>
      </div>
    );
  },

  addOption: function(key, label, onClick) {
    this.options[key] = {
      onClick: onClick,
      element: $(
        <li>
          <a href="#"></a>
        </li>
      ).appendTo(this.$el.find('.dropdown-menu')),
    };
    this.options[key].element.on('click', () => {
      this.options[key].onClick();
      e.preventDefault();
      e.stopImmediatePropagation();
      this.options[key].element.find('a').blur();
    })
    this.options[key].element.find('a').html(label);
  },

  addToggleOption: function(key, label, onToggle, defaultValue, trigger) {
    this.options[key] = {
      value: defaultValue,
      onToggle: onToggle,
      element: $(
        <li>
          <a href="#"></a>
        </li>
      ).appendTo(this.$el.find('.dropdown-menu')),
    };
    this.options[key].element.on('click', (e) => {
      this.toggleOption(key);
      e.preventDefault();
      e.stopImmediatePropagation();
      this.options[key].element.find('a').blur();
    })
    this.options[key].element.find('a').html('&nbsp;' + label)
      .prepend($(<i className="fa toggle-state"></i>)
          .addClass('fa-toggle-' + (defaultValue ? 'on text-success' : 'off')));
    this.setToggleOption(key, defaultValue, trigger);
  },

  toggleOption: function(key, trigger) {
    this.setToggleOption(key, !this.options[key].value, trigger);
  },

  setToggleOption: function(key, value, trigger) {
    this.options[key].value = value;
    this.options[key].element.find('.toggle-state')
      .removeClass('fa-toggle-on fa-toggle-off text-success')
      .addClass('fa-toggle-' + (value ? 'on text-success' : 'off'));
    if (trigger !== false)
      this.options[key].onToggle({value: value,});
  },
});

let initializeChat = (cyScript) => {
  $('#usercount').after(
    <span id="afkCount">
      <span class="activeusercount"></span>
      <span class="afkusercount"></span>
    </span>
  );

  window.userCountLimit = (totalUsers) => {
    var bd = calcUserBreakdown();
    var AFK = bd["AFK"], anon = bd["Anonymous"];
    $('#afkCount .activeusercount').text((totalUsers - AFK - anon) + ' active');
    $('#afkCount .afkusercount').text(AFK + ' afk');

    $('#usercount').removeClass('highcount highb highc highd highe');
    if (totalUsers >= 125 && totalUsers < 200) {
      $('#usercount').addClass('highcount');
    } else if (totalUsers >= 200 && totalUsers < 300) {
      $('#usercount').addClass('highb');
    } else if (totalUsers >= 300 && totalUsers < 400) {
      $('#usercount').addClass('highc');
    } else if (totalUsers >= 400 && totalUsers < 500) {
      $('#usercount').addClass('highd');
    } else if (totalUsers >= 500) {
      $('#usercount').addClass('highe');
    }
  }

  cyScript.chatOptions = new ChatOptions();
  $(cyScript.chatOptions).insertAfter($('#afkCount'));

  var oldModFlair = $('#modflair');
  if (oldModFlair.length && CLIENT && CLIENT.rank > 1) {
    cyScript.chatOptions.addToggleOption('modFlair', 'Mod Flair', function(e) {
      if (e.value) {
        USEROPTS.modhat = true;
      } else {
        USEROPTS.modhat = false;
      }
      setOpt('modhat', USEROPTS.modhat);
    }, USEROPTS.modhat);
    oldModFlair.detach();
  }

  cyScript.chatOptions.addToggleOption('anim', 'Animation', function(e) {
    if (e.value) {
      $('#messagebuffer').removeClass('notransition');
    } else {
      $('#messagebuffer').addClass('notransition');
    }
  }, true);

  var hideNav = JSON.parse(localStorage.getItem(CHANNEL.name + "_hideNav"));
  cyScript.on('initialized', () => {
    cyScript.chatOptions.addToggleOption('top', 'Top', function(e) {
      if ($('body').hasClass('fw')) {
        CLIENT._hideNav = false;
        e.value = false;
        this.element.find('.toggle-state')
        .removeClass('fa-toggle-on fa-toggle-off text-success')
        .addClass('fa-toggle-off');
        $('#utcClock').appendTo('#nav-collapsible');
        $('#mainpage').css('padding-top', '0');
        return;
      } else if (e.value) {
        CLIENT._hideNav = true;
        localStorage.setItem(CHANNEL.name + '_hideNav', JSON.stringify(true));
        $('.navbar').hide();
        $('#mainpage').css('padding-top', '15px');
      } else {
        CLIENT._hideNav = false;
        localStorage.setItem(CHANNEL.name + '_hideNav', JSON.stringify(false));
        $(".navbar").show();
        $('#mainpage').css('padding-top', '0');
      }
      if ($('#utcClock').length) {
        if (e.value) {
          $('#utcClock').appendTo('#leftcontrols');
        } else {
          $('#utcClock').appendTo('#nav-collapsible');
        }
      }
    }, hideNav);
  });

  var smallEmotes = JSON.parse(localStorage.getItem(CHANNEL.name + "_smallEmotes"));
  cyScript.chatOptions.addToggleOption('smallEmotes', 'Small Emotes', function(e) {
    if (e.value) {
      $('body').addClass('small-emotes');
    } else {
      $('body').removeClass('small-emotes');
    }
    localStorage.setItem(CHANNEL.name + '_smallEmotes', JSON.stringify(e.value));
  }, smallEmotes);
};

export { initializeChat, };
