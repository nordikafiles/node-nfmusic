class ChromeExtension
	@send: (name, value) ->
		ev = new CustomEvent name, 
			detail:
				type: "FROM_PAGE"
				value: value
		document.querySelector("#port").dispatchEvent ev
	@on: (eventName, callback) =>
		document.querySelector("#port").addEventListener eventName, (e) =>
			if e.type == "FROM_EXTENSION" then callback e.value
	@off: (eventName) =>
		document.querySelector("#port").removeEventListener eventName
	@openMedia: (url, callback) =>
		@send "openMedia", url
		@on "openMedia_res", (data) =>
			@off "openMedia_res"
			callback data