
class ChromeExtension
	@init: () ->
		window.PORT = document.querySelector("#port")
	@send: (name, value) ->
		ev = new CustomEvent name, 
			detail:
				type: "FROM_PAGE"
				value: value
		PORT.dispatchEvent ev
	@on: (eventName, callback, removeAfterLoading) ->
		called = false
		eventHandler = (e) ->
			type = e.detail.type
			value = e.detail.value
			if type == "FROM_EXTENSION" and !called and callback != undefined
				callback value
			if removeAfterLoading then called = true
		PORT.addEventListener eventName, eventHandler
	@openMedia: (url, callback, fromTime) =>
		@send "openMedia", {
			url: url,
			fromTime: fromTime
		}
		@on "openMedia_res", (data) ->
			if typeof callback == 'function' then callback data
		, true
	@playPause: (callback) =>
		@send "playPause", {}
		@on "playPause_res", (data) ->
			if typeof callback == 'function' then callback data
		, true
	@stop: (callback) =>
		@send "stop", {}
		@on "stop_res", (data) ->
			if typeof callback == 'function' then callback data
		, true
	@seekTo: (time, callback) =>
		@send "seekTo", time
		@on "seekTo_res", (data) ->
			if typeof callback == 'function' then callback data
		, true
	@setVolume: (volume, callback) =>
		@send "setVolume", volume.toFixed(2)
		@on "setVolume_res", (data) ->
			if typeof callback == 'function' then callback data
		, true
	@sendNotification: (title, message, callback) ->
		@send "sendNotification", {title: title, message: message}
		@on "sendNotification_res", (data) ->
			if typeof callback == 'function' then callback data
		, true
	@connect: (ip, port, callback) ->
		if typeof ip == 'string' and typeof port == 'function'
			data = 
				ip: ip
			CONFIG.xbmcip = ip
			CONFIG.xbmcport = null
			CONFIG.update()
			@send "connect", data
			@on "connect_res", (data) -> port data , true
		else if typeof ip == 'function'
			@send "connect", data
			@on "connect_res", (data) -> ip data , true
		else
			data = 
				port: port
				ip: ip
			CONFIG.xbmcip = ip
			CONFIG.xbmcport = port
			CONFIG.update()
			
			@send "connect", data
			@on "connect_res", (data) -> callback data , true




window.ce = ChromeExtension