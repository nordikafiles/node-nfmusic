var CONFIG, DICTIONARY, NF_AUTH, getLang, getRequest, sleep;

define("NF_AUTH_URL", "http://nf.noip.me/auth.html");

window.getFullURL = function(url) {
  return (new Audio(url)).src;
};

window.getTracklistJSON = function(callback) {
  var xhr;
  xhr = new XMLHttpRequest;
  xhr.open("GET", "tracklist.json", true);
  xhr.send();
  return xhr.onload = function() {
    return callback(xhr.response);
  };
};

window.focused = true;

window.addEventListener("focus", function() {
  return window.focused = true;
});

window.addEventListener("blur", function() {
  return window.focused = false;
});

CONFIG = {};

if (localStorage.getItem("config")) {
  CONFIG = JSON.parse(localStorage.getItem("config"));
} else {
  CONFIG = {
    invertMouseWheel: {
      value: true,
      changed: false
    },
    playerVolume: {
      value: 0.7
    },
    volumeDuration: {
      value: 10
    },
    vkAccessToken: {
      value: ""
    },
    vkUserId: {
      value: ""
    },
    language: "ru"
  };
  localStorage.setItem("config", JSON.stringify(CONFIG));
}

CONFIG.update = function() {
  return localStorage.setItem("config", JSON.stringify(CONFIG));
};

setTimeout(function() {
  if (CONFIG.vkAccessToken.value === "") {
    $(".vk-container").attr("style", "transform: scale(1); opacity: 1;");
  } else {
    $(".vk-container").attr("style", "display: none");
  }
  return $(".vk-container").on("click", function() {
    return NF_AUTH();
  });
}, 10);

sleep = function(ms) {
  ms += new Date().getTime();
  while (new Date() < ms) {
    continue;
  }
};

NF_AUTH = function(callback) {
  var au;
  au = new Auth();
  au.authUrl = NF_AUTH_URL;
  return au.getToken("vk.audio", function(e) {
    if (callback !== void 0) {
      return callback.call(this, e);
    } else {
      CONFIG.vkAccessToken.value = e.vk.access_token;
      CONFIG.vkUserId.value = e.vk.user_id;
      CONFIG.update();
      return location.reload();
    }
  });
};

$(window).keydown(function(e) {
  if ((e.ctrlKey || e.metaKey) && e.keyCode === 79) {
    console.log(e.keyCode);
    e.preventDefault();
    return $("#fileDialog").click();
  }
});

$("#fileDialog").on("change", function(e) {
  var TRACK, currentNum, ea, file, i, j, len, len1, numberOfFiles, qu, ref, ref1, results, url;
  ea = [];
  qu = 0;
  numberOfFiles = 0;
  console.log(this.files);
  ref = this.files;
  for (i = 0, len = ref.length; i < len; i++) {
    file = ref[i];
    if (file.type === "audio/mp3" || file.type === "audio/mpeg") {
      qu++;
    }
  }
  ref1 = this.files;
  results = [];
  for (j = 0, len1 = ref1.length; j < len1; j++) {
    file = ref1[j];
    if (file.type === "audio/mp3" || file.type === "audio/mpeg") {
      currentNum = numberOfFiles;
      TRACK = new Track;
      url = file.urn || file.name;
      ID3.loadTags(url, function() {
        var base64String, cc, k, len2, reader, ref2, tags;
        tags = ID3.getAllTags(url);
        TRACK.title = tags.title || "";
        TRACK.artist = tags.artist || "";
        if (tags.picture !== void 0) {
          base64String = "";
          ref2 = tags.picture.data;
          for (k = 0, len2 = ref2.length; k < len2; k++) {
            cc = ref2[k];
            base64String += String.fromCharCode(cc);
          }
          TRACK.coverArt = "data:" + tags.picture.format + ";base64," + window.btoa(base64String);
        }
        reader = new FileReader;
        reader.readAsDataURL(file);
        return reader.onload = function(e) {
          TRACK.url = e.target.result;
          ea.push(TRACK);
          qu--;
          if (qu === 0) {
            return pla.loadPlaylist(ea);
          }
        };
      }, {
        tags: ["artist", "title", "album", "year", "comment", "track", "genre", "lyrics", "picture"],
        dataReader: FileAPIReader(file)
      });
      results.push(numberOfFiles++);
    } else {
      results.push(void 0);
    }
  }
  return results;
});

getRequest = function(url, cb) {
  var xhr;
  xhr = new XMLHttpRequest;
  xhr.open("GET", url);
  xhr.send();
  return xhr.onload = function() {
    return cb(xhr.response);
  };
};

window.CONFIG = CONFIG;

DICTIONARY = {};

getLang = function(language) {
  var request;
  request = new XMLHttpRequest;
  request.open("GET", "/languages/" + language + ".json", false);
  request.send();
  return JSON.parse(request.response);
};

DICTIONARY = getLang(CONFIG.language);

window.addEventListener("load", function() {
  return setTimeout(function() {
    $("#globalLoading").removeClass("show");
    return setTimeout(function() {
      $("#globalLoading").hide();
      return $(".musiclist").removeClass("hide");
    }, 500);
  }, 500);
});
