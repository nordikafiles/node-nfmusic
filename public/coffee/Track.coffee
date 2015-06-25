class Track
	type: "mp3"
	id: 0
	url: undefined
	coverArt: undefined
	coverArtSmall: undefined
	coverArtLarge: undefined
	title: undefined
	artist: undefined
	youtube: undefined
	lyrics: undefined
	vk_lyrics_id: 0
	comment: undefined
	disabled: false
	@fromMp3: (link) ->
		ret = new Track
		ret.type = "mp3"
		ret.url = link
		return ret
	@fromSoundCloud: (link) ->
		ret = new Track
		ret.type = "soundcloud"
		ret.url = link
		return ret
	@fromVK: (vk) ->
		ret = new Track
		ret.type = "mp3"
		ret.vk = true
		ret.vkid = vk.id
		ret.url = vk.url
		ret.title = vk.title
		ret.artist = vk.artist
		ret
	getLyrics: (callback) =>
		switch @type
			when "mp3"
				callback.call @, @lyrics
	getYoutubeVideoId: () =>
		if @youtube != undefined
			return @youtube.split("v=")[1].substring(0, (if youtube.indexOf("&") != -1 then  youtube.indexOf("&") else youtube.length) )
	getYoutubeIframeUrl: () =>
		if @youtube != undefined
			return "//www.youtube.com/embed/" + @getYoutubeVideoId()
	contructor: (options) =>
		if "mp3" of options
			@mp3 = options.mp3
		else if "vk" of options
			@vk = options.vk
window.Track = Track