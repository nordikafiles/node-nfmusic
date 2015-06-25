window.app = angular.module("nfmusic", ['ngResource']);

app.factory('PlayerFactory', function() {
  var pl;
  pl = new Player;
  pl.init();
  window.__PLAYER__ = pl;
  return pl;
});

app.service('GetPlaylist', function($resource) {
  this.playlist1 = $resource('tracklist.json');
  return this.vk = $resource("https://api.vk.com/method/audio.get?owner_id=" + CONFIG.vkUserId.value + "&access_token=" + CONFIG.vkAccessToken.value + "&callback=JSON_CALLBACK", {}, {
    jsonp: {
      method: 'JSONP'
    }
  });
});
