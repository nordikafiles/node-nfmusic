class LangDictionary
	constructor: (json_url) ->
		lxhr = new XMLHttpRequest()
		lxhr.open "GET", json_url, false
		lxhr.send()
		resp = JSON.parse lxhr.response
		for sl of resp
			this[sl] = resp[sl]
		return this
	play: "Play"
	pause: "Pause"
	prev: "Prev"
	next: "Next"
	unknownTitle: "Unknown title"
	unknownArtist: "Unknown artist"
	homepage: "Homepage"
	charts: "Charts"
	search: "Search"
	signin: "Sign in"
	signout: "Sign out"
	signup: "Signup"