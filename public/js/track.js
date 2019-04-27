var Track,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Track = (function() {
  function Track() {
    this.contructor = bind(this.contructor, this);
    this.getYoutubeIframeUrl = bind(this.getYoutubeIframeUrl, this);
    this.getYoutubeVideoId = bind(this.getYoutubeVideoId, this);
    this.getLyrics = bind(this.getLyrics, this);
  }

  Track.prototype.type = "mp3";

  Track.prototype.id = 0;

  Track.prototype.url = void 0;

  Track.prototype.coverArt = void 0;

  Track.prototype.coverArtSmall = void 0;

  Track.prototype.coverArtLarge = void 0;

  Track.prototype.title = void 0;

  Track.prototype.artist = void 0;

  Track.prototype.youtube = void 0;

  Track.prototype.lyrics = void 0;

  Track.prototype.vk_lyrics_id = 0;

  Track.prototype.comment = void 0;

  Track.prototype.disabled = false;

  Track.fromMp3 = function(link) {
    var ret;
    ret = new Track;
    ret.type = "mp3";
    ret.url = link;
    return ret;
  };

  Track.fromSoundCloud = function(link) {
    var ret;
    ret = new Track;
    ret.type = "soundcloud";
    ret.url = link;
    return ret;
  };

  Track.fromVK = function(vk) {
    var ret;
    ret = new Track;
    ret.type = "mp3";
    ret.vk = true;
    ret.vkid = vk.id;
    ret.url = vk.url;
    ret.title = vk.title;
    ret.artist = vk.artist;
    return ret;
  };

  Track.prototype.getLyrics = function(callback) {
    switch (this.type) {
      case "mp3":
        return callback.call(this, this.lyrics);
    }
  };

  Track.prototype.getYoutubeVideoId = function() {
    if (this.youtube !== void 0) {
      return this.youtube.split("v=")[1].substring(0, (youtube.indexOf("&") !== -1 ? youtube.indexOf("&") : youtube.length));
    }
  };

  Track.prototype.getYoutubeIframeUrl = function() {
    if (this.youtube !== void 0) {
      return "//www.youtube.com/embed/" + this.getYoutubeVideoId();
    }
  };

  Track.prototype.contructor = function(options) {
    if ("mp3" in options) {
      return this.mp3 = options.mp3;
    } else if ("vk" in options) {
      return this.vk = options.vk;
    }
  };

  return Track;

})();

window.Track = Track;
