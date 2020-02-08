// Helpers
function log(str) 
{
	if(ENABLE_CONSOLE_LOG) {
		console.log(str);
	}
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

$.arrayIntersect = function(a, b)
{
	var matches = [];
    $.each(a, function(i,ea) {
		$.each(b, function(j, eb) {
			if($(ea).attr("id") == $(eb).attr("id")) matches.push(a[i]);
		});
	});
	return matches;
};

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
Array.prototype.uniqify = function () 
{
	return this.filter( onlyUnique );
}

if (!String.prototype.repeat) {
  String.prototype.repeat = function(count) {
    'use strict';
    if (this == null) {
      throw new TypeError('can\'t convert ' + this + ' to object');
    }
    var str = '' + this;
    count = +count;
    if (count != count) {
      count = 0;
    }
    if (count < 0) {
      throw new RangeError('repeat count must be non-negative');
    }
    if (count == Infinity) {
      throw new RangeError('repeat count must be less than infinity');
    }
    count = Math.floor(count);
    if (str.length == 0 || count == 0) {
      return '';
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28) {
      throw new RangeError('repeat count must not overflow maximum string size');
    }
    var rpt = '';
    for (var i = 0; i < count; i++) {
      rpt += str;
    }
    return rpt;
  }
}


Array.prototype.toSimpleString = function()
{
	return "["+this.join(" ")+"]";
}

Array.prototype.sortOn = function(){ 
  var dup = this.slice();
  if(!arguments.length) return dup.sort();
  var args = Array.prototype.slice.call(arguments);
  return dup.sort(function(a,b){
    var props = args.slice();
    var prop = props.shift();
    while(a[prop] == b[prop] && props.length) prop = props.shift();
    return a[prop] == b[prop] ? 0 : a[prop] > b[prop] ? 1 : -1;
  });
};