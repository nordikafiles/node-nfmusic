var Player,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Player = (function() {
  function Player() {
    this.init = bind(this.init, this);
    this.trigger = bind(this.trigger, this);
    this.on = bind(this.on, this);
    this.requestTrackInfo = bind(this.requestTrackInfo, this);
  }

  Player.prototype.core = new Audio();

  Player.prototype.currentCore = "html5";

  Player.prototype.events = [];

  Player.prototype.SoundCloud = null;

  Player.prototype.TRACK = {
    "default": true
  };

  Player.prototype.CURRENT_SONG = 0;

  Player.prototype.__volume = 0.7;

  Player.prototype.__pvolume = 0.7;

  Player.prototype.saveVolumeState = true;

  Player.prototype.savePlaylist = false;

  Player.prototype.saveCurrentSongPosition = false;

  Player.prototype.volumeInterval = null;

  Player.prototype.muted = false;

  Player.prototype.udp = true;

  Player.prototype.xbmcConnected = false;

  Player.prototype.xbmcCurrentTime = 0;

  Player.prototype.xbmcDuration = 0;

  Player.prototype.xbmcVolume = 1;

  Player.prototype.xbmcPaused = true;

  Player.prototype.__pxbmcVolume = 1;

  Player.prototype.requestTrackInfo = function() {
    return this.trigger("trackinfo", this.TRACK, this);
  };

  Player.prototype.on = function(eventNames, func) {
    var eventName, i, len, ref, results;
    ref = eventNames.split(",");
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      eventName = ref[i];
      if (this.events[eventName] === void 0) {
        this.events[eventName] = [];
      }
      results.push(this.events[eventName].push(func));
    }
    return results;
  };

  Player.prototype.trigger = function(eventName, args, th) {
    var func, i, len, ref, results;
    if (this.events[eventName] !== void 0) {
      ref = this.events[eventName];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        func = ref[i];
        if (th !== void 0) {
          results.push(func.call(th, args));
        } else {
          results.push(func.call(th, args));
        }
      }
      return results;
    }
  };

  Player.prototype.init = function() {
    var curr, lastSongChange;
    ce.init();
    window.addEventListener("load", (function(_this) {
      return function() {
        return ce.connect(CONFIG.xbmcip, CONFIG.xbmcport, function(result) {
          if (result && (new Date).getTime() - CONFIG.lastXbmcNotification > 600000) {
            _this.xbmcConnected = true;
            ce.sendNotification("nfmusic", "Successfully paired", function() {});
            CONFIG.lastXbmcNotification = (new Date).getTime();
          }
          _this.trigger("xbmcConnected", result, _this);
          return CONFIG.update();
        });
      };
    })(this));
    window.addEventListener("beforeunload", (function(_this) {
      return function() {
        if (_this.currentCore === "xbmc") {
          return ce.stop(function() {});
        }
      };
    })(this));
    ce.on("volume", (function(_this) {
      return function(volume) {
        _this.xbmcVolume = volume;
        if (_this.currentCore === "xbmc") {
          return _this.trigger("volumechange", _this.xbmcVolume, _this);
        }
      };
    })(this));
    ce.on("extensionReady", (function(_this) {
      return function() {
        return _this.trigger("extensionReady", true, _this);
      };
    })(this));
    this.core = new Audio();
    this.currentCore = "html5";
    this.core.addEventListener("timeupdate", (function(_this) {
      return function() {
        if (_this.currentCore === "html5") {
          _this.trigger("timeupdate", {}, _this);
          return _this.trigger("progress", _this.core.progress, _this);
        }
      };
    })(this));
    this.core.addEventListener("play", (function(_this) {
      return function() {
        if (_this.currentCore === "html5") {
          return _this.trigger("play", {}, _this);
        }
      };
    })(this));
    this.core.addEventListener("ended", (function(_this) {
      return function() {
        if (_this.currentCore === "html5") {
          _this.trigger("ended", {}, _this);
        }
        return console.log("ended");
      };
    })(this));
    this.core.addEventListener("pause", (function(_this) {
      return function() {
        if (_this.currentCore === "html5") {
          return _this.trigger("pause", {}, _this);
        }
      };
    })(this));
    this.core.addEventListener("progress", (function(_this) {
      return function() {
        if (_this.currentCore === "html5") {
          return _this.trigger("progress", _this.core.buffered.end(_this.core.buffered.length - 1) / _this.duration, _this);
        }
      };
    })(this));
    this.SoundCloud = new SoundCloud();
    this.SoundCloud.init(this, "sciframe");
    this.SoundCloud.volume = this.__volume;
    this.on("ended", (function(_this) {
      return function() {
        return _this.next();
      };
    })(this));
    this.on("timeupdate", (function(_this) {
      return function() {
        if (_this.saveCurrentSongPosition) {
          return localStorage.setItem("player_current_song", JSON.stringify({
            currentTime: _this.currentTime,
            currentSong: _this.CURRENT_SONG
          }));
        }
      };
    })(this));
    if (CONFIG.playerVolume.value && this.saveVolumeState) {
      this.__volume = CONFIG.playerVolume.value / 1;
      this.volume = this.__volume;
      this.trigger("volumechange", this.volume, this);
    }
    if (this.savePlaylist && localStorage.getItem("player_playlist")) {
      this.loadPlaylist(JSON.parse(localStorage.getItem("player_playlist")));
      if (this.saveCurrentSongPosition && localStorage.getItem("player_current_song")) {
        curr = localStorage.getItem("player_current_song");
        curr = JSON.parse(curr);
        this.play(curr.currentSong);
        this.CURRENT_SONG = curr.currentSong;
        this.pause();
        this.currentTime = curr.currentTime;
        this.TRACK = this.PLAYLIST[this.CURRENT_SONG];
        this.trigger("trackinfo", this.TRACK, this);
      }
    }
    lastSongChange = (new Date).getTime();
    ce.on("timeupdate", (function(_this) {
      return function(data) {
        var data2;
        if (_this.currentCore === "xbmc") {
          _this.xbmcCurrentTime = data.time;
          _this.xbmcDuration = data.duration;
          data2 = data;
          _this.xbmcPaused = data.paused;
          if (_this.xbmcPaused && !data2.paused) {
            _this.trigger("play", {}, _this);
          }
          if (!_this.xbmcPaused && data2.paused) {
            _this.trigger("pause", {}, _this);
          }
          _this.trigger("timeupdate", {}, _this);
          _this.trigger("progress", 0, _this);
        }
        if (_this.xbmcDuration - _this.xbmcCurrentTime < 1 && (new Date).getTime() - lastSongChange > 5000) {
          _this.trigger("ended", {}, _this);
          return lastSongChange = (new Date).getTime();
        }
      };
    })(this));
    return this.trigger("ready", {}, this);
  };

  return Player;

})();

Object.defineProperties(Player.prototype, {
  currentTime: {
    set: function(time) {
      switch (this.currentCore) {
        case "html5":
          try {
            this.core.currentTime = time;
          } catch (_error) {
            console.log("Error");
          }
          return this.trigger("currrenttimechanged", true, this);
        case "soundcloud":
          return this.SoundCloud.widget.seekTo(time * 1000);
        case "xbmc":
          return ce.seekTo(time, (function(_this) {
            return function() {
              return _this.trigger("currrenttimechanged", true, _this);
            };
          })(this));
      }
    },
    get: function() {
      switch (this.currentCore) {
        case "html5":
          return this.core.currentTime;
        case "soundcloud":
          return this.SoundCloud.currentTime;
        case "xbmc":
          return this.xbmcCurrentTime;
      }
      return 0;
    }
  },
  timeLeft: {
    get: function() {
      switch (this.currentCore) {
        case "html5":
          return this.core.duration - this.core.currentTime;
        case "xbmc":
          return this.xbmcDuration - this.xbmcCurrentTime;
      }
      return 0;
    }
  },
  seconds: {
    get: function() {
      if (this.currentTime % 60 < 10) {
        return "0" + Math.floor(this.currentTime % 60);
      } else {
        return "" + Math.floor(this.currentTime % 60);
      }
    }
  },
  duration: {
    get: function() {
      switch (this.currentCore) {
        case "html5":
          return this.core.duration;
        case "soundcloud":
          return this.SoundCloud.duration;
        case "xbmc":
          return this.xbmcDuration;
      }
    }
  },
  progress: {
    get: function() {
      return this.currentTime / this.duration;
    },
    set: function(val) {
      return this.currentTime = this.duration * val;
    }
  },
  minutes: {
    get: function() {
      if (this.currentTime / 60 < 10 && this.hours > 0) {
        return "0" + Math.floor(this.currentTime / 60);
      } else {
        return "" + Math.floor(this.currentTime / 60);
      }
    }
  },
  hours: {
    get: function() {
      if (this.currentTime / 360 < 10 && Math.floor(this.currentTime / 360) > 0) {
        return "0" + Math.floor(this.currentTime / 360);
      } else if (Math.floor(this.currentTime / 360) > 0) {
        return "" + Math.floor(this.currentTime / 360);
      } else {
        return "";
      }
    }
  },
  secondsLeft: {
    get: function() {
      if (this.timeLeft % 60 < 10) {
        return "0" + Math.floor(this.timeLeft % 60);
      } else {
        return "" + Math.floor(this.timeLeft % 60);
      }
    }
  },
  minutesLeft: {
    get: function() {
      if (this.timeLeft / 60 < 10 && this.hours > 0) {
        return "0" + Math.floor(this.timeLeft / 60);
      } else {
        return "" + Math.floor(this.timeLeft / 60);
      }
    }
  },
  hoursLeft: {
    get: function() {
      if (this.timeLeft / 360 < 10 && Math.floor(this.timeLeft / 360) > 0) {
        return "0" + Math.floor(this.timeLeft / 360);
      } else if (Math.floor(this.timeLeft / 360) > 0) {
        return "" + Math.floor(this.timeLeft / 360);
      } else {
        return "";
      }
    }
  },
  volume: {
    set: function(volume) {
      var e;
      if (this.currentCore === "html5") {
        try {
          this.SoundCloud.widget.setVolume(volume);
          this.core.volume = volume;
        } catch (_error) {
          e = _error;
          console.log(e);
        }
        this.__volume = volume;
        this.SoundCloud.volume = this.__volume;
        if (this.saveVolumeState && this.udp) {
          CONFIG.playerVolume.value = this.volume;
          CONFIG.update();
        }
        if (this.udp) {
          return this.trigger("volumechange", this.volume, this);
        }
      } else if (this.currentCore === "xbmc") {
        ce.setVolume(volume, function() {});
        this.xbmcVolume = volume;
        if (this.udp) {
          return this.trigger("volumechange", this.xbmcVolume, this);
        }
      }
    },
    get: function() {
      switch (this.currentCore) {
        case "html5":
          return this.core.volume;
        case "soundcloud":
          return this.SoundCloud.volume / 100;
        case "xbmc":
          return this.xbmcVolume;
      }
      return 0;
    }
  },
  toggleMute: {
    value: function() {
      if (this.currentCore === "mp3") {
        this.udp = false;
        if (this.__volume !== 0) {
          this.trigger("volumechange", 0, this);
          this.__pvolume = this.__volume;
          this.muted = true;
          clearInterval(this.volumeInterval);
          this.volumeInterval = null;
          return this.volumeInterval = setInterval((function(_this) {
            return function() {
              if (_this.muted && _this.__volume >= 0.01) {
                return _this.volume -= 0.01;
              } else {
                _this.udp = true;
                _this.volume = 0;
                clearInterval(_this.volumeInterval);
                return _this.trigger("volumechange", _this.volume, _this);
              }
            };
          })(this), CONFIG.volumeDuration.value / (this.__pvolume / 0.01));
        } else {
          clearInterval(this.volumeInterval);
          this.volumeInterval = null;
          this.muted = false;
          this.trigger("volumechange", this.__pvolume + 0.01, this);
          return this.volumeInterval = setInterval((function(_this) {
            return function() {
              if (!_this.muted && _this.__volume < _this.__pvolume - 0.01) {
                return _this.volume += 0.01;
              } else {
                _this.udp = true;
                clearInterval(_this.volumeInterval);
                _this.volume = _this.__pvolume;
                return _this.trigger("volumechange", _this.volume, _this);
              }
            };
          })(this), CONFIG.volumeDuration.value / (this.__pvolume / 0.01));
        }
      } else if (this.currentCore === "xbmc") {
        if (this.xbmcVolume > 0) {
          this.__pxbmcVolume = this.xbmcVolume;
          return this.volume = 0;
        } else {
          return this.volume = this.__pxbmcVolume;
        }
      }
    }
  },
  paused: {
    get: function() {
      switch (this.currentCore) {
        case "html5":
          return this.core.paused;
        case "soundcloud":
          return this.SoundCloud.paused;
        case "xbmc":
          return this.xbmcPaused;
      }
      return 0;
    },
    set: function(val) {
      if (val === true || val === false) {
        if (val) {
          this.pause();
          return this.trigger("pause", {}, this);
        } else {
          this.play();
          return this.trigger("play", {}, this);
        }
      }
    }
  },
  play: {
    value: function(songIndex) {
      console.log(songIndex);
      if (songIndex !== void 0 && songIndex !== "smoothly" && typeof (songIndex / 1) === "number") {
        this.CURRENT_SONG = songIndex;
        this.load(this.PLAYLIST[songIndex]);
        return;
      }
      if (this.TRACK["default"]) {
        this.load(this.PLAYLIST[0]);
      }
      switch (this.currentCore) {
        case "html5":
          if (songIndex === "smoothly" && false) {
            this.udp = false;
            this.volume = 0;
            clearInterval(this.volumeInterval);
            this.volumeInterval = null;
            this.muted = false;
            this.core.play();
            return this.volumeInterval = setInterval((function(_this) {
              return function() {
                console.log(_this.volume);
                if (!_this.muted && _this.__volume < _this.__pvolume - 0.01 && window.focused) {
                  return _this.volume += 0.01;
                } else {
                  _this.volume = _this.__pvolume;
                  _this.udp = true;
                  return clearInterval(_this.volumeInterval);
                }
              };
            })(this), CONFIG.volumeDuration.value / (this.__pvolume / 0.01));
          } else {
            this.udp = true;
            clearInterval(this.volumeInterval);
            return this.core.play();
          }
          break;
        case "soundcloud":
          return this.SoundCloud.widget.play();
        case "xbmc":
          if (this.xbmcPaused) {
            return ce.playPause(function() {});
          }
      }
    }
  },
  pause: {
    value: function(param) {
      switch (this.currentCore) {
        case "html5":
          console.log(param);
          if (param === "smoothly" && false) {
            this.udp = false;
            this.__pvolume = this.__volume;
            clearInterval(this.volumeInterval);
            this.trigger("pause", {}, this);
            this.volumeInterval = null;
            return this.volumeInterval = setInterval((function(_this) {
              return function() {
                console.log(_this.volume);
                if (_this.__volume >= 0.01) {
                  return _this.volume -= 0.01;
                } else {
                  _this.volume = 0;
                  _this.udp = true;
                  clearInterval(_this.volumeInterval);
                  return _this.core.pause();
                }
              };
            })(this), CONFIG.volumeDuration.value / (this.__pvolume / 0.01));
          } else {
            clearInterval(this.volumeInterval);
            this.udp = true;
            return this.core.pause();
          }
          break;
        case "soundcloud":
          return this.SoundCloud.widget.pause();
        case "xbmc":
          if (!this.xbmcPaused) {
            return ce.playPause((function(_this) {
              return function() {};
            })(this));
          }
      }
    }
  },
  stop: {
    value: function() {
      this.currentTime = 0;
      this.pause();
      return this.trigger("stop", {}, this);
    }
  },
  toggle: {
    value: function(reting) {
      if (this.paused) {
        this.play(reting);
        return false;
      } else {
        this.pause(reting);
        return true;
      }
      if (reting !== void 0 && reting !== "smoothly") {
        return this[reting];
      }
    }
  },
  next: {
    value: function() {
      if (this.CURRENT_SONG < this.PLAYLIST.length - 1) {
        this.CURRENT_SONG++;
        return this.play(this.CURRENT_SONG);
      }
    }
  },
  prev: {
    value: function() {
      if (this.CURRENT_SONG > 0) {
        this.CURRENT_SONG--;
        return this.play(this.CURRENT_SONG);
      }
    }
  },
  load: {
    value: function(track) {
      var err;
      this.TRACK = track;
      switch (track.type) {
        case "mp3":
          if (this.currentCore === "html5") {
            this.stop();
            this.SoundCloud.reset();
            this.currentCore = "html5";
            this.core.src = track.url;
            this.core.autoplay = true;
            this.play("smoothly");
            if (!this.TRACK.title || !this.TRACK.artist) {
              try {
                return ID3.loadTags(track.url, (function(_this) {
                  return function() {
                    return setTimeout(function() {
                      var base64String, cc, i, len, ref, tags;
                      tags = ID3.getAllTags(track.url);
                      _this.TRACK.title = tags.title;
                      _this.TRACK.artist = tags.artist;
                      if (tags.picture !== void 0) {
                        base64String = "";
                        ref = tags.picture.data;
                        for (i = 0, len = ref.length; i < len; i++) {
                          cc = ref[i];
                          base64String += String.fromCharCode(cc);
                        }
                        _this.TRACK.coverArt = "data:" + tags.picture.format + ";base64," + window.btoa(base64String);
                      }
                      return _this.trigger("trackinfo", _this.TRACK, _this);
                    }, 0);
                  };
                })(this), {
                  tags: ["artist", "title", "album", "year", "comment", "track", "genre", "lyrics", "picture"]
                });
              } catch (_error) {
                err = _error;
                console.log(err);
                return this.trigger("trackinfo", this.TRACK, this);
              }
            } else {
              return this.trigger("trackinfo", this.TRACK, this);
            }
          } else {
            this.trigger("loadingStart", {}, this);
            this.trigger("trackinfo", this.TRACK, this);
            return ce.openMedia(getFullURL(this.TRACK.url), (function(_this) {
              return function() {
                return _this.trigger("loadingEnd", {}, _this);
              };
            })(this));
          }
          break;
        case "soundcloud":
          this.stop();
          this.trigger("trackinfo", this.TRACK, this);
          this.currentCore = "soundcloud";
          return this.SoundCloud.widget.load(track.url, {
            auto_play: true
          });
      }
    }
  },
  loadPlaylist: {
    value: function(playlist) {
      if (JSON.stringify(playlist) !== JSON.stringify(this.PLAYLIST)) {
        this.PLAYLIST = playlist;
        this.currentTime = 0;
        this.stop;
        this.CURRENT_SONG = 0;
        this.TRACK = this.PLAYLIST[this.CURRENT_SONG];
        this.play(0);
        this.stop;
        this.trigger("loadPlaylist", this.PLAYLIST, this);
        if (!this.TRACK.title || !this.TRACK.artist) {
          try {
            ID3.loadTags(this.TRACK.url, (function(_this) {
              return function() {
                return setTimeout(function() {
                  var tags;
                  tags = ID3.getAllTags(_this.TRACK.url);
                  _this.TRACK.title = tags.title;
                  _this.TRACK.artist = tags.artist;
                  return _this.trigger("trackinfo", _this.TRACK, _this);
                }, 0);
              };
            })(this), ["picture", "artist", "title", "album"]);
          } catch (_error) {
            this.trigger("trackinfo", this.TRACK, this);
          }
        } else {
          this.trigger("trackinfo", this.TRACK, this);
        }
        if (this.savePlaylist) {
          return localStorage.setItem("player_playlist", JSON.stringify(this.PLAYLIST));
        }
      }
    }
  },
  startStream: {
    value: function() {
      this.trigger("loadingStart", {}, this);
      console.log("Starting stream...");
      return ce.openMedia(this.core.src, (function(_this) {
        return function() {
          var curtime;
          curtime = _this.currentTime;
          return ce.seekTo(curtime, function() {
            _this.pause;
            _this.currentCore = "xbmc";
            _this.core.src = "";
            _this.trigger("loadingEnd", {}, _this);
            console.log("Now straming...");
            return _this.trigger("volumechange", _this.xbmcVolume, _this);
          });
        };
      })(this));
    }
  },
  stopStream: {
    value: function() {
      var curtime;
      curtime = this.currentTime;
      ce.stop(function() {});
      this.currentCore = "html5";
      this.trigger("volumechange", this.__volume, this);
      this.load(this.TRACK);
      return this.currentTime = curtime;
    }
  }
});

window.Player = Player;
