import steamIcon from 'img/steam-icon.png';
const uuidv5 = require('uuid/v5');


let Header = Backbone.View.extend({

  initialize: function(cyScript) {

    this.options = {};

    function adjustDocumentTitle() {
      window.document.title = window.PAGETITLE.replace('🔴 ', '');
      window.PAGETITLE = window.document.title;
    }
    window.socket.on('channelOpts', () => {
      adjustDocumentTitle();
    });
    adjustDocumentTitle();

    $("#nav-collapsible .nav.navbar-nav").addClass('navbar-left');
    if ($('#logoutform').length) {
      $('#logoutform').css({display: 'none'});
      var navRight = $(
        <ul class="nav navbar-nav navbar-right">
        </ul>
      ).appendTo($('#nav-collapsible'));
    } else {

    }

    this.setElement($('#wrap > .navbar[role="navigation"]'));

    this.upperNavLeft = this.$el.find('.navbar-collapse > .navbar-left');

    this.lowerNavLeft = $(
      <div className="navbar lower">
        <ul className="nav navbar-nav navbar-left">
        </ul>
      </div>
    ).appendTo(this.$el.addClass('enhanced upper')).find('.navbar-left');
    // <li>
    //   <a href="" target="_blank">
    //     <img className="icon" src="https://resources.pink.horse/images/icon.discord.256.png" />
    //     &nbsp;Discord
    //   </a>
    // </li>
    // <li>
    //   <a class="" href="" target="_blank">
    //     <img className="icon" />
    //     &nbsp;Steam
    //   </a>
    // </li>

    this.lowerNavLeft.find('.steamIcon .icon').attr('src', steamIcon);

    $(
      <li>
        <a href="#">
          <span class="glyphicon glyphicon-info-sign"></span> Channel Info
        </a>
      </li>
    ).prependTo(this.lowerNavLeft).on('click', (e) => {
      e.preventDefault();
      var dlg = BootstrapDialog.show();
      dlg.setTitle('<span class="glyphicon glyphicon-info-sign"></span> Channel Info');
      dlg.getModalBody().empty().append(savedMotd);
      dlg.setButtons([
          {
              label: 'Ok',
              action: (dlg) => {
                  dlg.close();
              }
          }
      ]);
    });

    var headerButtons = {};
    this.upperNavLeft.children().each(function(i, e) {
      var text = $($(e).find('a')[0]);
      if (text.length > 0) {
        switch (/^[/w]*([a-zA-Z]*)/.exec($(text).html().trim().toLowerCase())[0]) {
          case 'account':
            headerButtons.accountSettings = $(e);
            if ($('#logoutform').length) {
              var userlistItem = findUserlistItem(CLIENT.name);
              if (userlistItem.length && userlistItem.data()["profile"]["image"] !== null && userlistItem.data()["profile"]["image"].length > 0) {
                $(text).html(`<img style="display:inline-block;height:32px;" />&nbsp;&nbsp;${CLIENT.name} <b class="caret"></b>`)
                  .find("img").attr('src', userlistItem.data()["profile"]["image"]);
                $(e).addClass('profile-button')
              } else {
                $(text).html(`<span class="glyphicon glyphicon-user"></span>&nbsp;&nbsp;${CLIENT.name} <b class="caret"></b>`);
              }
              headerButtons.accountSettings.appendTo(navRight);
            } else {
              $(text).html(`<span class="glyphicon glyphicon-user"></span>&nbsp;&nbsp;Account <b class="caret"></b>`);
            }
            break;
          case 'options':
            headerButtons.clientSettings = $(e).detach();
            break;
          case 'channel':
            headerButtons.channelSettings = $(e).detach();
            if (text.css('display') === 'none') {
                delete headerButtons.channelSettings;
            }
            break;
          case 'layout':
            headerButtons.layoutSettings = $(e);
            $(text).html('<span class="glyphicon glyphicon-th-large"></span> Layout <b class="caret"></b>');
            break;
        }
      }
    });
    /*headerButtons.showRules = $(
        <li>
            <a href="#">
                Channel <span class="glyphicon glyphicon-info-sign"></span>
            </a>
        </li>
    );
    headerButtons.showRules.appendTo(this.upperNavLeft);
    headerButtons.showRules.find('a').on('click', function(e) {
    });*/

    let savedMotd = $('#motdrow').detach();

    $(".navbar .navbar-header > .navbar-brand").remove();
    var homeButton = $($(".navbar .navbar-nav li")[0]);
    homeButton.find("a").html('<span class="glyphicon glyphicon-home"></span>');

    var associatedChannels = {
      'channelname': {
        label: 'channel',
        headerLogo: '',
        id: 'channel'
      },
    };

    var headerLogo = associatedChannels[CHANNEL.name.toLowerCase()];
    if (!headerLogo || !headerLogo.headerLogo) {
      headerLogo = Object.entries(associatedChannels).find(() => true)[1];
    }

    var channelList = $(
      <li id="ChannelList" class="dropdown">
        <a class="dropdown-toggle" href="#" data-toggle="dropdown" style="padding: 4px 8px 4px 6px; height: 50px;">
          <img style="height: 100%;" />
          <b class="caret"></b>
        </a>
        <ul class="dropdown-menu"></ul>
      </li>
    );
    channelList.insertAfter(homeButton).find("img").attr('src', headerLogo.headerLogo);
    homeButton.remove();

    var channelBadge = channelList.find('.badge')
    channelList = channelList.find(".dropdown-menu");
    Object.keys(associatedChannels).forEach(function(e) {
      var channel = $(
        <li className={`channel-${e}`}><a></a></li>
      ).appendTo(channelList);
      $(channel.find('a'))
        .attr('href', 'https://cytu.be/r/' + associatedChannels[e].id)
        .html(associatedChannels[e].label + ' (../r/' + associatedChannels[e].id + ')');
    });
    $(<li class="divider"></li>).appendTo(channelList);
    $(
        <li>
            <a href="https://cytu.be/">
                <span class="fa fa-align-justify" style="width: 24px; text-align: center;"></span>
                Channel Directory
            </a>
        </li>
    )
        .appendTo(channelList);

    var channelData = {};
    var channelQueue = [];
    var reloadChannelList = function() {

      if (channelQueue.length > 0) {

        channelQueue.forEach((channel) => {
          let badge = channelList.find(`.channel-${channel} .badge`);
          if (badge.length === 0) {
            badge = $(<span><span className="badge"></span>&nbsp;</span>);
            badge = badge.prependTo(channelList.find(`.channel-${channel} a`)).find('.badge');
          }
          badge.html(channelData[channel].viewers);
        });

        let totalViewers = 0;
        Object.keys(channelData).forEach((room) => {
          totalViewers += channelData[room].viewers + 0;
        });
  
        channelBadge.html(
            (
                channelData[CHANNEL.name] !== undefined
                    ? channelData[CHANNEL.name].viewers + 0
                    : '?'
            ) + ' / ' + totalViewers
        );
        channelQueue = [];

      }

    };
    reloadChannelList();

    var settingsList = $(
      <li class="dropdown" style="">
        <a class="dropdown-toggle" href="#" data-toggle="dropdown">
          <span class="glyphicon glyphicon-cog"></span> <b class="caret"></b>
        </a>
        <ul class="dropdown-menu settings-dropdown"></ul>
      </li>
    );
    settingsList.insertAfter($(headerButtons.layoutSettings));
    settingsList = settingsList.find(".dropdown-menu");

    $(
        <li>
            <a href="javascript:showUserOptions();">
                Client Settings
            </a>
        </li>
    )
        .appendTo(settingsList);

    if (headerButtons.channelSettings) {
        $(
            <li>
                <a href="javascript:showChannelSettings();">
                    Channel Settings
                </a>
            </li>
        )
            .appendTo(settingsList);
    }

    this.$el.removeClass("navbar-fixed-top");
  },

  setMotd: function(motd) {
    var newMotd = $('#new-motd');
    var closeBtn = $(
      <div id="closeBtn">
        <button className="close pull-right">×</button>
      </div>
    );
    //Random v4 uuid
    const motdRandId = '2eba18e7-32af-452a-9a39-8860f14a006f';
    const motdString = motd.toString();
    const motdId = uuidv5(motdString, motdRandId);
    const storageId = localStorage.getItem(`${CHANNEL.name}_currentMotd`);

    if (storageId !== motdId) {
      localStorage.setItem('autoMotdClose', false);
    }

    if (newMotd.length === 0 && JSON.parse(localStorage.getItem('autoMotdClose')) === false) {
      newMotd = $(
        <div id="new-motd" className="form-group well">
        </div>
      ).prependTo($('#main'));
    }
    localStorage.setItem(`${CHANNEL.name}_currentMotd`, motdId);
    newMotd.html(motd);

   if (JSON.parse(localStorage.getItem('autoMotdClose')) === true && storageId === motdId) {
      this.removeMotd();
    }

    newMotd.find('a').each((i, e) => {
      e = $(e);
      if (e.attr('target') === undefined) {
        e.attr('target', '_blank');
      }
    });
    closeBtn.insertBefore($("#new-motd > p"));
    closeBtn.on('click', () => {
      localStorage.setItem('autoMotdClose', true);
      this.removeMotd();
    })
  },

  removeMotd: function() {
    $('#new-motd').remove();
  }

});

let initializeHeader = (cyScript) => {
  cyScript.header = new Header(cyScript);
};

export { initializeHeader, };
