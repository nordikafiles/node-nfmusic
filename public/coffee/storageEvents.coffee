class StorageEvents
	events: []
	on: (eventNames, func) =>
		for eventName in eventNames.split(",")
			if @events[eventName] == undefined
				@events[eventName] = []
			@events[eventName].push func
	trigger: (eventName, args) =>
		localStorage.setItem "__StorageEvent__" + eventName,
			JSON.stringify
				key: Math.random()
				content: args
	__trigger: (eventName, args, th) =>
		if @events[eventName] != undefined
			for func in @events[eventName]
				func.call(th, args)
StorageEvents = new StorageEvents
window.addEventListener 'storage', (e) ->
	StorageEvents.__trigger e.key.slice(16), JSON.parse(e.newValue).content, {}
window.StorageEvents = StorageEvents