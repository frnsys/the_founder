import _ from 'underscore';

const util = {
  setAudio: function(track) {
    var audio = document.getElementById('music');
    var audio_src = document.getElementById('music-source');
    audio_src.src = `assets/music/${track}`;
    audio.load();
    audio.addEventListener('canplaythrough', function() {
      var muted = localStorage.getItem('muted');
      muted = muted ? JSON.parse(muted) : true; // mute by default
      audio.muted = muted;
      audio.play();
    }, false);
  },

  enumName: function(value, enums) {
    return _.invert(enums)[value.toString()];
  },

  byName: function(list, name) {
    return _.findWhere(list, {name: name});
  },

  byNames: function(list, names) {
    return _.filter(list, function(obj) {
      return _.contains(names, obj.name);
    });
  },

  nameMap: function(list) {
    var map = {};
    _.each(list, function(obj) {
      map[obj.name] = obj;
    });
    return map;
  },

  // so that objects don't have to exactly match, just by name
  contains: function(list, obj) {
    return util.containsByName(list, obj.name);
  },
  containsByName: function(list, name) {
    return util.byName(list, name) !== undefined;
  },

  slugify: function(str) {
    // this is so hacky, but ad blockers block the ad product type gif otherwise
    if (str == 'Ad') {
      return 'floop';
    }
    return str.toLowerCase()
      .replace(/\s+/g, '_')           // replace spaces with _
      .replace(/[^\w\-]+/g, '')       // remove all non-word chars
      .replace(/\-+/g, '_');          // replace - with single _
  },

  // http://stackoverflow.com/a/2686098/1097920
  abbreviateNumber: function(number, decPlaces) {
      // 2 decimal places => 100, 3 => 1000, etc
      decPlaces = Math.pow(10,decPlaces);

      // Enumerate number abbreviations
      var abbrev = [ "k", "m", "b", "t" ];

      // Go through the array backwards, so we do the largest first
      for (var i=abbrev.length-1; i>=0; i--) {

          // Convert array index to "1000", "1000000", etc
          var size = Math.pow(10,(i+1)*3);

          // If the number is bigger or equal do the abbreviation
          if(size <= number) {
               // Here, we multiply by decPlaces, round, and then divide by decPlaces.
               // This gives us nice rounding to a particular decimal place.
               number = Math.round(number*decPlaces/size)/decPlaces;

               // Handle special case where we round up to the next abbreviation
               if((number == 1000) && (i < abbrev.length - 1)) {
                   number = 1;
                   i++;
               }

               // Add the letter for the abbreviation
               number += abbrev[i];

               // We are done... stop
               break;
          }
      }

      return number;
  },

  satisfied: function(comparison, comparator, value) {
    switch(comparator) {
      case "==":
        return comparison == value;
      case ">":
        return comparison > value;
      case "<":
        return comparison < value;
      case "contains":
        return _.some(comparison, function(obj) {
          obj.name == value;
        });
      default:
        return false;
    }
  },

  formatCurrency: function(value) {
    return '$' + value.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  },

  formatCurrencyAbbrev: function(value) {
    return '$' + util.abbreviateNumber(value, 2).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  }
};
export default util;
