window.app = angular.module "nfmusic", ['ngResource']
app.factory 'PlayerFactory', () ->
	pl = new Player
	pl.init()
	window.__PLAYER__ = pl
	return pl
app.service 'GetPlaylist', ($resource) ->
	@playlist1 = $resource 'tracklist.json'
	@vk = $resource "https://api.vk.com/method/audio.get?owner_id=" + CONFIG.vkUserId.value + "&access_token=" + CONFIG.vkAccessToken.value + "&callback=JSON_CALLBACK", {}, 
		jsonp:
			method: 'JSONP'