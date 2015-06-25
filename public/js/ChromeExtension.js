var ChromeExtension;

ChromeExtension = (function() {
  function ChromeExtension() {}

  ChromeExtension.init = function() {
    return window.PORT = document.querySelector("#port");
  };

  ChromeExtension.send = function(name, value) {
    var ev;
    ev = new CustomEvent(name, {
      detail: {
        type: "FROM_PAGE",
        value: value
      }
    });
    return PORT.dispatchEvent(ev);
  };

  ChromeExtension.on = function(eventName, callback, removeAfterLoading) {
    var called, eventHandler;
    called = false;
    eventHandler = function(e) {
      var type, value;
      type = e.detail.type;
      value = e.detail.value;
      if (type === "FROM_EXTENSION" && !called && callback !== void 0) {
        callback(value);
      }
      if (removeAfterLoading) {
        return called = true;
      }
    };
    return PORT.addEventListener(eventName, eventHandler);
  };

  ChromeExtension.openMedia = function(url, callback, fromTime) {
    ChromeExtension.send("openMedia", {
      url: url,
      fromTime: fromTime
    });
    return ChromeExtension.on("openMedia_res", function(data) {
      if (typeof callback === 'function') {
        return callback(data);
      }
    }, true);
  };

  ChromeExtension.playPause = function(callback) {
    ChromeExtension.send("playPause", {});
    return ChromeExtension.on("playPause_res", function(data) {
      if (typeof callback === 'function') {
        return callback(data);
      }
    }, true);
  };

  ChromeExtension.stop = function(callback) {
    ChromeExtension.send("stop", {});
    return ChromeExtension.on("stop_res", function(data) {
      if (typeof callback === 'function') {
        return callback(data);
      }
    }, true);
  };

  ChromeExtension.seekTo = function(time, callback) {
    ChromeExtension.send("seekTo", time);
    return ChromeExtension.on("seekTo_res", function(data) {
      if (typeof callback === 'function') {
        return callback(data);
      }
    }, true);
  };

  ChromeExtension.setVolume = function(volume, callback) {
    ChromeExtension.send("setVolume", volume.toFixed(2));
    return ChromeExtension.on("setVolume_res", function(data) {
      if (typeof callback === 'function') {
        return callback(data);
      }
    }, true);
  };

  ChromeExtension.sendNotification = function(title, message, callback) {
    this.send("sendNotification", {
      title: title,
      message: message
    });
    return this.on("sendNotification_res", function(data) {
      if (typeof callback === 'function') {
        return callback(data);
      }
    }, true);
  };

  ChromeExtension.connect = function(ip, port, callback) {
    var data;
    if (typeof ip === 'string' && typeof port === 'function') {
      data = {
        ip: ip
      };
      CONFIG.xbmcip = ip;
      CONFIG.xbmcport = null;
      CONFIG.update();
      this.send("connect", data);
      return this.on("connect_res", function(data) {
        return port(data, true);
      });
    } else if (typeof ip === 'function') {
      this.send("connect", data);
      return this.on("connect_res", function(data) {
        return ip(data, true);
      });
    } else {
      data = {
        port: port,
        ip: ip
      };
      CONFIG.xbmcip = ip;
      CONFIG.xbmcport = port;
      CONFIG.update();
      this.send("connect", data);
      return this.on("connect_res", function(data) {
        return callback(data, true);
      });
    }
  };

  return ChromeExtension;

})();

window.ce = ChromeExtension;
