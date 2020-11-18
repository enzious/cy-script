/*!  
 **|  Enhanced Tab Completion by Xaekai
 **|  Original function by Cyzon
 **|
 **@preserve
 */
if (!$("#emote_suggest").length) {
 $("#chatwrap").append('<div style="white-space: pre;" id="emote_suggest"></div>')
}

window.emoteSuggest = function(targets) {
 console.log("emoteSuggest");
 var possibles = "";
 for (i = 0; i < Math.min(10, targets.length); i++) {
  possibles += targets[i] + "   "
 }
 possibles.trim();
 $("#emote_suggest").stop(true, true);
 $("#emote_suggest").html(possibles).fadeIn(0, function() {
  $(this).delay(3e3).fadeOut(1e3)
 })
}

window.doTabCompletion = function(words, current, rawTargets, targets, restline) {
 emoteSuggest(targets);
 var min = Math.min.apply(Math, targets.map(function(name) {
  return name.length
 }));
 targets = targets.map(function(name) {
  return name.substring(0, min)
 });
 var changed = true;
 var iter = 21;
 while (changed) {
  changed = false;
  var first = targets[0];
  for (var i = 1; i < targets.length; i++) {
   if (targets[i] !== first) {
    changed = true;
    break
   }
  }
  if (changed) {
   targets = targets.map(function(name) {
    return name.substring(0, name.length - 1)
   })
  }
  if (--iter < 0) {
   break
  }
 }
 current = targets[0].substring(0, min);
 for (var i = 0; i < rawTargets.length; i++) {
  if (rawTargets[i].toLowerCase() === current) {
   current = rawTargets[i];
   break
  }
 }
 if (targets.length === 1) {
  if (words.length === 1 && current[0].match(/[\w]/)) {
   current += ":"
  }
  current += " "
 }
 words[words.length - 1] = current;
 var finishline = words.join(" ") + restline;
 if (finishline == $("#chatline")[0].value) {
  return
 }
 $("#chatline").val(finishline);
 $("#chatline")[0].selectionStart = $("#chatline")[0].value.length - restline.length;
 $("#chatline")[0].selectionEnd = $("#chatline")[0].value.length - restline.length
}

window.chatTabComplete = function() {
 var midline = $("#chatline")[0].value;
 var restline = "";
 if ($("#chatline")[0].selectionStart == $("#chatline")[0].selectionEnd) {
  midline = $("#chatline")[0].value.slice(0, $("#chatline")[0].selectionStart);
  restline = $("#chatline")[0].value.slice($("#chatline")[0].selectionStart)
 }
 var words = midline.split(/\s/);
 var current = words[words.length - 1].toLowerCase();
 if (!current.match(/^[\w-]{1,20}$/)) {
  return emoteTabComplete(words, current, restline)
 }
 var __slice = Array.prototype.slice;
 var usersWithCap = __slice.call($("#userlist").children()).map(function(elem) {
  return elem.children[1].innerHTML
 });
 var users = __slice.call(usersWithCap).map(function(user) {
  return user.toLowerCase()
 }).filter(function(name) {
  return name.indexOf(current) === 0
 });
 if (users.length === 0) {
  return
 }
 return doTabCompletion(words, current, usersWithCap, users, restline)
}

window.emoteTabComplete = function(words, current, restline) {
 console.log(current);
 if (!CHANNEL.emotes || CHANNEL.emotes.length == 0) return;
 var emotesMaster = [];
 for (i = 0; i < CHANNEL.emotes.length; i++) {
  if (CHANNEL.emotes[i].name[0].match(/^[^\w]/)) {
   emotesMaster.push(CHANNEL.emotes[i].name)
  }
 }
 var __slice = Array.prototype.slice;
 var emotes = __slice.call(emotesMaster).map(function(emote) {
  return emote.toLowerCase()
 }).filter(function(emote) {
  return emote.indexOf(current) === 0
 });
 if (emotes.length === 0) {
  return
 }
 return doTabCompletion(words, current, emotesMaster, emotes, restline)
}