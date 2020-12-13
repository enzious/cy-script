var initializePlaylist = () => {

  /*
   * experimental playlist filter script
   * things will break (especially when playlist updates)
   * v0.3
   * zeratul
   */

  window.markPlaylistVideos = (name) => {

    clearPlaylistMarks();
    $('#pfinput').val(name);

    var wasActive = $('#showuserfilter').hasClass('active');
    if (!wasActive) {
      $('.plcontrol-collapse').collapse('hide');
      $('#plcontrol button.active').button('toggle');
      $('#showuserfilter').click();
    }

    $('#filterplaylistcontrol .alert').remove();

    var i = 0, pl = $('#queue li'), name = name.toLowerCase();
    if (!pl) return;
    for (;i < pl.length; i++) {
      var via = pl[i].title;
      if (via) via = via.substr(10).toLowerCase();
      else continue;
      if (via !== name) {
        $(pl[i]).addClass('pl-noheight');
      } else {
        $(pl[i]).addClass('pl-highlight');
      }
    }
    $('#filterlabel').text('Showing ' + $('.pl-highlight').length + ' videos added by ' + name + '.').show();

  };

  function clearPlaylistMarks() {
    $('#pfinput').val('');
    $('#filterlabel').text('').hide();
    $('#queue li').removeClass('pl-noheight').removeClass('pl-highlight');
  }

  $(function() {
    $('.plfilter-css').remove();

    $('head').append(`
      <style class="plfilter-css">
        .pl-highlight.queue_active {
          background: #335375;
        }
        .queue_entry.pl-highlight {
          border-color: #63c3ff!important;
          background: #122735!important;
        }
        .pl-noheight {
          height: 0!important;
          padding: 0!important;
          margin: 0!important;
          border: 0!important;
          overflow: hidden!important;
        }
        #filterlabel {
          color: #63c3ff;
          border: 1px solid #63c3ff;
          border-bottom: 0;
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
          background: #122735;
          padding: 2px 6px;
        }
      </style>
    `);

    $(<div id="filterlabel" style="display: none;"></div>).insertBefore('#queue');

    $('#plcontrol').append(
      $(
        <button class="btn btn-sm btn-default collapsed" id="showuserfilter"
            title="Filter playlist for videos added by a specific user"
            data-target="#filterplaylistcontrol" data-toggle="collapse">
          <span class="glyphicon glyphicon-filter"></span>
        </button>
      )
        .on('click', function() {
          var wasActive = $(this).hasClass('active');
          $('.plcontrol-collapse').collapse('hide');
          $('#plcontrol button.active').button('toggle');
          if (!wasActive) {
            $(this).button('toggle');
          }
        })
    );

    $(
      <div class="plcontrol-collapse col-lg-12 col-md-12 collapse" id="filterplaylistcontrol"
          style="padding-bottom: 15px; height: 0px;">
        <div class="vertical-spacer"></div>
        <div class="input-group input-group-sm">
          <input class="form-control" id="pfinput" type="text"
              maxlength="100" placeholder="Username" />
          <span class="input-group-btn">
            <button class="btn btn-default" id="pfcancel">Clear</button>
            <button class="btn btn-default" id="pffilter">Filter</button>
          </span>
        </div>
      </div>
    )
      .css({
        height: 0,
      })
      .insertAfter('#addfromurl');

    $('#pffilter').on('click', function() {
      var name = $('#pfinput').val().trim().toLowerCase().substr(0,100);
      clearPlaylistMarks();
      $('#filterlabel').text('').hide();
      if (!name || name === "") {
        makeAlert("Invalid Input", "No username specified to search for.", "alert-danger").appendTo($("#filterplaylistcontrol"));
      } else {
        markPlaylistVideos(name);
      }
    });

    $('#pfcancel').on('click', clearPlaylistMarks);

    $('#pfinput').on('keypress', function(e) {
      if (e.which === 13) {
        $('#pffilter').click();
      }
    });

  });

};

export { initializePlaylist, };