class Auth
	authUrl: "/auth.html"
	appId: "14882281488"
	iframeElement: null
	type: "popup"
	popupWindow: null
	getToken: (permissions, callback) =>
		npermissions = []
		if typeof permissions == "string"
			for permission in permissions.split(",")
				npermissions.push permission.trim()
		permissions = npermissions
		if Array.isArray(permissions)
			url = @authUrl
			url += "?"
			url += "app_id="
			url += @appId
			url += "&scope=" + permissions.join(",")
			if @type == "popup"
				@popupWindow = window.open url
				window.addEventListener 'message', (e) =>
					if e.data.type == "auth_callback"
						@popupWindow.close()
						callback.call e.data, e.data
						window.removeEventListener 'message'
window.Auth = Auth