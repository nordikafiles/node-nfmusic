var SoundCloud,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

SoundCloud = (function() {
  function SoundCloud() {
    this.init = bind(this.init, this);
  }

  SoundCloud.prototype.volume = 0.1;

  SoundCloud.prototype.ready = false;

  SoundCloud.prototype.widget = null;

  SoundCloud.prototype.currentTime = 0;

  SoundCloud.prototype.paused = true;

  SoundCloud.prototype.duration = 0;

  SoundCloud.prototype.init = function(PLAYER, iframe_obj) {
    this.widget = new SC.Widget(iframe_obj);
    this.reset = (function(_this) {
      return function() {
        return document.getElementById(iframe_obj).src = "https://w.soundcloud.com/player/?url=";
      };
    })(this);
    this.ready = true;
    this.widget.bind(SC.Widget.Events.READY, (function(_this) {
      return function() {
        _this.widget.getDuration(function(e) {
          return _this.duration = e / 1000;
        });
        return _this.widget.getCurrentSound(function(e) {
          if (e) {
            if (!PLAYER.TRACK.title) {
              PLAYER.TRACK.title = e.title.split(" - ").slice(1, e.title.split(" - ").length).join(" - ");
            }
            if (!PLAYER.TRACK.artist) {
              PLAYER.TRACK.artist = e.title.split(" - ")[0];
            }
            if (!PLAYER.TRACK.coverArt) {
              PLAYER.TRACK.coverArt = e.artwork_url;
            } else {

            }
          }
          return PLAYER.trigger("trackinfo", PLAYER.TRACK, _this);
        });
      };
    })(this));
    this.widget.bind(SC.Widget.Events.PLAY, (function(_this) {
      return function(e) {
        _this.widget.setVolume(_this.volume);
        _this.currentTime = e.currentPosition / 1000;
        _this.paused = false;
        PLAYER.trigger("play", {}, PLAYER);
        return PLAYER.trigger("trackinfo", PLAYER.TRACK, _this);
      };
    })(this));
    this.widget.bind(SC.Widget.Events.PLAY_PROGRESS, (function(_this) {
      return function(e) {
        _this.currentTime = e.currentPosition / 1000;
        return PLAYER.trigger("timeupdate", {}, PLAYER);
      };
    })(this));
    this.widget.bind(SC.Widget.Events.PAUSE, (function(_this) {
      return function(e) {
        _this.currentTime = e.currentPosition / 1000;
        _this.paused = true;
        return PLAYER.trigger("pause", {}, PLAYER);
      };
    })(this));
    return this.widget.bind(SC.Widget.Events.FINISH, (function(_this) {
      return function(e) {
        _this.currentTime = e.currentPosition / 1000;
        _this.paused = true;
        return PLAYER.trigger("ended", {}, PLAYER);
      };
    })(this));
  };

  return SoundCloud;

})();

window.SoundCloud = SoundCloud;
