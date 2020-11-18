var Backbone = require('../../../node_modules/backbone/backbone.js');

(function(jQuery, Backbone) {

  var View = Backbone.View.extend;
  Backbone.View.extend = function() {
    var out = View.apply(this, arguments);
    out.prototype.inject = function(el) {
      this.$el.appendTo(el);
      if (jQuery.type(this) === "object" && "trigger" in this) {
        this.trigger("injected");
      }
    };
    return out;
  }

})(jQuery, Backbone);

module.exports = Backbone;