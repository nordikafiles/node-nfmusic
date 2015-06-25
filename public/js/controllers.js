app.controller("PlayerCtrl", [
  "$scope", "PlayerFactory", "$rootScope", "GetPlaylist", function($scope, PlayerFactory, $rootScope, GetPlaylist) {
    var configureXbmc, downArrow, invertMod, keyboardSeekRelativePosition, leftArrow, rightArrow, scrollAnimateTimeout, seek, seekRelativePosition, seekTimeout, seekVolume, seekingBack, seekingForward, udp, upArrow, xbmcSettingsModal;
    getTracklistJSON(function(res) {
      return setMusicListContent(JSON.parse(res));
    });
    $scope.playerLoading = false;
    $scope.artist = PlayerFactory.TRACK.artist;
    $scope.title = PlayerFactory.TRACK.title;
    $scope.coverArt = PlayerFactory.TRACK.coverArt | "";
    window.pla = PlayerFactory;
    $rootScope.player_playlist = PlayerFactory.PLAYLIST;
    $scope.volume = CONFIG.playerVolume.value;
    PlayerFactory.volume = $scope.volume;
    $(".player-volume-slider .player-slider-progress").css("width", ($scope.volume * 100) + "%");
    $(".player-volume-slider .player-slider-thumb").css("left", ($scope.volume * 100) + "%");
    $scope.position = "0:00";
    $scope.duration = "0:00";
    udp = true;
    $scope.paused = true;
    $scope.hidden = true;
    $scope.coverFull = false;
    $rootScope.currentSong = 0;
    $scope.selectedTrack = 0;
    $scope.keyboardControl = false;
    $scope["default"] = false;
    seekingBack = false;
    seekingForward = false;
    scrollAnimateTimeout = null;
    keyboardSeekRelativePosition = 0;
    $rootScope.nowPlaying = "";
    $scope.showStartStreamBtn = false;
    PlayerFactory.on("extensionReady", function() {
      return $scope.$apply(function() {
        return $scope.showStartStreamBtn = true;
      });
    });
    StorageEvents.on('play', function() {
      return $scope.pause();
    });
    PlayerFactory.on("play", function() {
      return StorageEvents.trigger("play", {});
    });
    PlayerFactory.on("currrenttimechanged", function() {
      return udp = true;
    });
    PlayerFactory.on("play,pause,ended", function() {
      return $scope.$apply((function(_this) {
        return function() {
          $scope.hidden = false;
          if (_this.currentCore === "xbmc") {
            $scope.now_streaming = true;
          } else {
            $scope.now_streaming = false;
          }
          $scope.paused = _this.paused;
          if (!_this.paused) {
            return $rootScope.nowPlaying = "► " + $scope.artist + " - " + $scope.title + " | ";
          } else {
            return $rootScope.nowPlaying = "";
          }
        };
      })(this));
    });
    PlayerFactory.on("trackinfo", function(trackInfo) {
      if (this.currentCore === "xbmc") {
        $scope.now_streaming = true;
      } else {
        $scope.now_streaming = false;
      }
      $scope.coverArt = trackInfo.coverArt;
      $scope.title = trackInfo.title;
      $scope.artist = trackInfo.artist;
      console.log($rootScope.player_playlist = this.PLAYLIST);
      console.log($rootScope.currentSong = this.CURRENT_SONG);
      $scope["default"] = trackInfo["default"];
      $scope.hidden = false;
      if (!$scope.keyboardControl) {
        $scope.selectedTrack = this.CURRENT_SONG;
      }
      if (scrollAnimateTimeout !== null) {
        clearTimeout(scrollAnimateTimeout);
      }
      return scrollAnimateTimeout = setTimeout(function() {
        var e;
        try {
          return $(".playlist").animate({
            scrollTop: $(".playlist li.play")[0].offsetTop - window.innerHeight / 2
          });
        } catch (_error) {
          e = _error;
          return console.log(e);
        }
      }, 500);
    });
    PlayerFactory.on("timeupdate", function() {
      if (udp) {
        keyboardSeekRelativePosition = this.progress;
      }
      $scope.$apply((function(_this) {
        return function() {
          if (_this.currentCore === "xbmc") {
            $scope.now_streaming = true;
          } else {
            $scope.now_streaming = false;
          }
          $rootScope.player_playlist = _this.PLAYLIST;
          $rootScope.currentSong = _this.CURRENT_SONG;
          $scope.paused = _this.paused;
          if (udp) {
            $scope.position = _this.minutes + ":" + _this.seconds;
          }
          return $scope.duration = Math.floor(_this.duration / 60) + ":" + (Math.floor(_this.duration % 60) < 10 ? "0" + Math.floor(_this.duration % 60) : Math.floor(_this.duration % 60));
        };
      })(this));
      if (udp) {
        $(".seek-bar-container .player-slider-progress").css("width", (this.progress * 100) + "%");
        return $(".seek-bar-container .player-slider-thumb").css("left", (this.progress * 100) + "%");
      }
    });
    PlayerFactory.on("progress", function(progress) {
      return $(".seek-bar-container .player-slider-buffer").css("width", (progress * 100) + "%");
    });
    PlayerFactory.on("loadingStart", function() {
      return $scope.playerLoading = true;
    });
    PlayerFactory.on("loadingEnd", function() {
      return $scope.playerLoading = false;
    });
    PlayerFactory.on("volumechange", function(vol) {
      $scope.volume = vol;
      console.log("Controllers volume: " + vol);
      $(".player-volume-slider .player-slider-progress").css("width", (vol * 100) + "%");
      return $(".player-volume-slider .player-slider-thumb").css("left", (vol * 100) + "%");
    });
    seek = false;
    seekVolume = false;
    seekRelativePosition = 0;
    $(".player .seek-bar-container .player-seek-bar").on("mousedown", function(e) {
      seek = true;
      udp = false;
      if (seek) {
        if ((e.pageX - $(".player .seek-bar-container .player-seek-bar").offset().left) / $(".player .seek-bar-container .player-seek-bar").width() > 0 && (e.pageX - $(".player .seek-bar-container .player-seek-bar").offset().left) / $(".player .seek-bar-container .player-seek-bar").width() <= 1) {
          seekRelativePosition = (e.pageX - $(".player .seek-bar-container .player-seek-bar").offset().left) / $(".player .seek-bar-container .player-seek-bar").width();
        }
        e.preventDefault();
        $(".seek-bar-container .player-slider-progress").css("width", (seekRelativePosition * 100) + "%");
        return $(".seek-bar-container .player-slider-thumb").css("left", (seekRelativePosition * 100) + "%");
      }
    });
    $(".player-volume-slider").on("mousedown", function(e) {
      var volumeRelativePosition;
      seekVolume = true;
      if ((e.pageX - $(".player-volume-slider").offset().left) / $(".player-volume-slider").width() >= 0 && (e.pageX - $(".player-volume-slider").offset().left) / $(".player-volume-slider").width() <= 1) {
        volumeRelativePosition = (e.pageX - $(".player-volume-slider").offset().left) / $(".player-volume-slider").width();
      }
      PlayerFactory.volume = volumeRelativePosition;
      return $scope.$apply(function() {
        return $scope.volume = volumeRelativePosition;
      });
    });
    $(window).on("mousemove", function(e) {
      var volumeRelativePosition;
      $scope.keyboardControl = false;
      if (seek) {
        if ((e.pageX - $(".player .seek-bar-container .player-seek-bar").offset().left) / $(".player .seek-bar-container .player-seek-bar").width() > 0 && (e.pageX - $(".player .seek-bar-container .player-seek-bar").offset().left) / $(".player .seek-bar-container .player-seek-bar").width() <= 1) {
          seekRelativePosition = (e.pageX - $(".player .seek-bar-container .player-seek-bar").offset().left) / $(".player .seek-bar-container .player-seek-bar").width();
        }
        $scope.$apply(function() {
          return $scope.position = Math.floor(seekRelativePosition * PlayerFactory.duration / 60) + ":" + (Math.floor(seekRelativePosition * PlayerFactory.duration % 60) < 10 ? "0" : "") + Math.floor(seekRelativePosition * PlayerFactory.duration % 60);
        });
        e.preventDefault();
        $(".seek-bar-container .player-slider-progress").css("width", (seekRelativePosition * 100) + "%");
        $(".seek-bar-container .player-slider-thumb").css("left", (seekRelativePosition * 100) + "%");
      }
      if (seekVolume) {
        if ((e.pageX - $(".player-volume-slider").offset().left) / $(".player-volume-slider").width() >= 0 && (e.pageX - $(".player-volume-slider").offset().left) / $(".player-volume-slider").width() <= 1) {
          volumeRelativePosition = (e.pageX - $(".player-volume-slider").offset().left) / $(".player-volume-slider").width();
          $scope.$apply(function() {
            return $scope.volume = volumeRelativePosition;
          });
        }
        if (volumeRelativePosition !== void 0) {
          if (volumeRelativePosition > 0.05) {
            PlayerFactory.muted = false;
            if (volumeRelativePosition < 0.95) {
              PlayerFactory.volume = volumeRelativePosition;
            } else {
              PlayerFactory.volume = 1;
            }
          } else {
            PlayerFactory.volume = 0;
          }
        }
        return e.preventDefault();
      }
    }).on("mouseup", function(e) {
      if (seekVolume) {
        seekVolume = false;
      }
      if (seek) {
        seek = false;
        if ((e.pageX - $(".player .seek-bar-container .player-seek-bar").offset().left) / $(".player .seek-bar-container .player-seek-bar").width() > 0 && (e.pageX - $(".player .seek-bar-container .player-seek-bar").offset().left) / $(".player .seek-bar-container .player-seek-bar").width() <= 1) {
          seekRelativePosition = (e.pageX - $(".player .seek-bar-container .player-seek-bar").offset().left) / $(".player .seek-bar-container .player-seek-bar").width();
        }
        return PlayerFactory.progress = seekRelativePosition;
      }
    });
    setInterval(function() {
      if (seekingBack && PlayerFactory.currentTime > 0) {
        udp = false;
        keyboardSeekRelativePosition -= 0.001;
        $(".seek-bar-container .player-slider-progress").css("width", (keyboardSeekRelativePosition * 100) + "%");
        return $(".seek-bar-container .player-slider-thumb").css("left", (keyboardSeekRelativePosition * 100) + "%");
      } else if (seekingForward && keyboardSeekRelativePosition + 0.001 <= 1) {
        udp = false;
        keyboardSeekRelativePosition += 0.001;
        $(".seek-bar-container .player-slider-progress").css("width", (keyboardSeekRelativePosition * 100) + "%");
        return $(".seek-bar-container .player-slider-thumb").css("left", (keyboardSeekRelativePosition * 100) + "%");
      }
    }, 1);
    downArrow = 40;
    upArrow = 38;
    leftArrow = 37;
    rightArrow = 39;
    seekTimeout = null;
    window.addEventListener("keydown", function(e) {
      if (e.keyCode === downArrow && document.activeElement.tagName !== "INPUT") {

      } else if (e.keyCode === upArrow && document.activeElement.tagName !== "INPUT") {

      } else if (e.keyCode === leftArrow && !seekingBack && document.activeElement.tagName !== "INPUT") {
        return seekTimeout = setTimeout(function() {
          udp = false;
          return seekingBack = true;
        }, 300);
      } else if (e.keyCode === rightArrow && !seekingForward && document.activeElement.tagName !== "INPUT") {
        return seekTimeout = setTimeout(function() {
          udp = false;
          return seekingForward = true;
        }, 300);
      } else if (e.keyCode === 32 && document.activeElement.tagName !== "INPUT") {
        return e.preventDefault();
      }
    });
    window.addEventListener("keyup", function(e) {
      if (e.keyCode === upArrow && document.activeElement.tagName !== "INPUT") {
        $scope.keyboardControl = true;
        if ($scope.selectedTrack > 0) {
          $scope.selectedTrack -= 1;
        }
      } else if (e.keyCode === downArrow && document.activeElement.tagName !== "INPUT") {
        $scope.keyboardControl = true;
        if ($scope.selectedTrack < $rootScope.player_playlist.length - 1) {
          $scope.selectedTrack += 1;
        }
      } else if (e.keyCode === leftArrow && document.activeElement.tagName !== "INPUT") {
        if (seekTimeout !== null) {
          clearTimeout(seekTimeout);
        }
        if (!seekingBack) {
          $scope.prev();
        }
        seekingBack = false;
        PlayerFactory.progress = keyboardSeekRelativePosition;
      } else if (e.keyCode === rightArrow && document.activeElement.tagName !== "INPUT") {
        if (seekTimeout !== null) {
          clearTimeout(seekTimeout);
        }
        if (!seekingForward) {
          $scope.next();
        }
        PlayerFactory.progress = keyboardSeekRelativePosition;
      } else if (e.keyCode === 32 && document.activeElement.tagName !== "INPUT") {
        $scope.toggle("smoothly");
        e.preventDefault();
      }
      seekingForward = false;
      return seekingBack = false;
    });
    invertMod = new Modal;
    invertMod.type = 'confirm';
    invertMod.title = DICTIONARY["Invert mouse wheel"];
    invertMod.text = DICTIONARY["Invert mouse wheel to control the volume?"];
    invertMod.init();
    $(".player")[0].addEventListener("mousewheel", function(e) {
      var wheelDelta;
      if (!CONFIG.invertMouseWheel.changed) {
        invertMod.show(function(result) {
          CONFIG.invertMouseWheel.changed = true;
          CONFIG.invertMouseWheel.value = result;
          return CONFIG.update();
        });
      }
      wheelDelta = e.wheelDelta;
      if (CONFIG.invertMouseWheel.value) {
        wheelDelta = e.wheelDelta * -1;
      }
      if (PlayerFactory.volume + wheelDelta / 100 > 0) {
        if (PlayerFactory.volume + wheelDelta / 100 < 1) {
          PlayerFactory.volume += wheelDelta / 100;
        } else {
          PlayerFactory.volume = 1;
        }
      } else {
        PlayerFactory.volume = 0;
      }
      return e.preventDefault();
    });
    $scope.toggle = function(param) {
      return PlayerFactory.toggle();
    };
    $scope.prev = function() {
      return PlayerFactory.prev();
    };
    $scope.next = function() {
      return PlayerFactory.next();
    };
    $rootScope.play = function(songIndex) {
      console.log(songIndex);
      if (songIndex === void 0) {
        songIndex = "smoothly";
      }
      if (songIndex === $scope.currentSong) {
        return $scope.toggle("smoothly");
      } else {
        return PlayerFactory.play(songIndex);
      }
    };
    $scope.pause = function() {
      return PlayerFactory.pause("smoothly");
    };
    $scope.stop = function() {
      return PlayerFactory.stop();
    };
    $scope.mute = function() {
      return PlayerFactory.toggleMute();
    };
    xbmcSettingsModal = new Modal;
    xbmcSettingsModal = new Modal;
    xbmcSettingsModal.type = "apply";
    xbmcSettingsModal.text = '<input class="ip" type="text" placeholder="XBMC/KODI ip"> <input class="port" type="text" placeholder="XBMC/KODI port (default 80)"> <input class="username" type="text" placeholder="Username (Optional)"> <input class="password" type="password" placeholder="Password (Optional)">';
    xbmcSettingsModal.title = "Settings";
    xbmcSettingsModal.onapplypressed = function(elem) {
      CONFIG.xbmcip = elem.find(".ip").val();
      CONFIG.xbmcport = elem.find(".port").val();
      CONFIG.update();
      return false;
    };
    xbmcSettingsModal.init();
    configureXbmc = new Modal;
    configureXbmc.type = "confirm";
    configureXbmc.title = DICTIONARY["Unknown destination address"];
    configureXbmc.text = DICTIONARY["Unknown destination address. Do you want to specify it now?"];
    configureXbmc.init();
    $scope.startStream = function() {
      if (CONFIG.xbmcip && CONFIG.xbmcport) {
        PlayerFactory.startStream();
      } else {
        configureXbmc.show(function(result) {
          if (result) {
            return xbmcSettingsModal.show(function(result, elem) {
              if (result) {
                CONFIG.xbmcip = elem.find(".ip").val();
                CONFIG.xbmcport = elem.find(".port").val() === "" ? "80" : elem.find(".port").val();
                CONFIG.update();
                if (CONFIG.xbmcip && CONFIG.xbmcport) {
                  return ce.sendNotification("nfmusic", "Successfully paired", function() {
                    return Modal.alert(DICTIONARY["Successfully paired with kodi"], DICTIONARY["Successfully paired"], function() {});
                  });
                }
              }
            });
          }
        });
      }
      return false;
    };
    $scope.stopStream = function() {
      return PlayerFactory.stopStream();
    };
    $scope.toggleCover = function() {
      var pos;
      if ($scope.coverFull) {
        $('.media-poster').removeClass("full");
        setTimeout(function() {
          $('.media-poster img').attr("style", "");
          return $('.media-poster').removeClass("fixed-pos");
        }, 200);
        $scope.coverFull = false;
      } else {
        pos = {
          bottom: $(window).height() - $('.media-poster img').offset().top - 80,
          left: $('.media-poster img').offset().left
        };
        console.log(pos);
        $('.media-poster img').css("left", pos.left + "px");
        $('.media-poster img').css("bottom", pos.bottom + "px");
        $('.media-poster').addClass("fixed-pos");
        setTimeout(function() {
          return $('.media-poster').addClass("full");
        }, 10);
        $scope.coverFull = true;
      }
      return false;
    };
    $scope.loadPlaylist = function(num) {
      var req;
      switch (num) {
        case 1:
          req = new XMLHttpRequest;
          req.open("GET", "tracklist.json", false);
          req.send();
          return PlayerFactory.loadPlaylist(JSON.parse(req.response));
      }
    };
    return false;
  }
]);

app.controller("PlaylistCtrl", [
  "$scope", "$rootScope", "PlayerFactory", function($scope, $rootScope, PlayerFactory) {
    $rootScope.show_playlist = false;
    $rootScope.showPlaylist = function() {
      return $rootScope.show_playlist = true;
    };
    return $rootScope.hidePlaylist = function() {
      return $rootScope.show_playlist = false;
    };
  }
]);
