getRequest = (url, cb) ->
	xhr = new XMLHttpRequest
	xhr.open "GET", url
	do xhr.send
	xhr.onload = () ->
		cb xhr.response

await getRequest "tracklist.json", defer result
console.log result