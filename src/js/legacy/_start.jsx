cyScript.logger.moduleLog('LEGACY', 'Started.');

// -- Channel Namespace --
// if (!window[CHANNEL.name]) {
//   window[CHANNEL.name] = {};
// }

// // -- Channel Favicon --
// if (!window[CHANNEL.name].favicon) {
// window[CHANNEL.name].favicon = $('<link/>')
//   .prop('id', 'favicon')
//   .attr('rel', 'shortcut icon')
//   .attr('type', 'image/png')
//   .attr('sizes', '64x64')
//   .attr('href', '')
//   .appendTo('head');
// }

let leftControls = document.querySelector('#leftcontrols');
if (leftControls) {
  leftControls.classList.add('btn-group');
}