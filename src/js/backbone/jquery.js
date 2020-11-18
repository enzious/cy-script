//var jQuery = require('../../../node_modules/jquery/src/jquery.js');

(function(jQuery) {

  var initJQuery = jQuery.fn.init;
  jQuery.fn.init = function(s, c, r) {
    if (jQuery.type(s) === "object" && "$el" in s) {
      return s.$el;
    } else {
      return new initJQuery(s,c,r);
    }
  };

  return

})(window.jQuery);

module.exports = jQuery;