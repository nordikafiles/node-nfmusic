hash = location.hash.slice(1).split("&")
nhash = {}
for a in hash
	nhash[a.split("=")[0]] = a.split("=")[1]
hash = nhash
localStorage.setItem "vk_access_token", hash["access_token"]
localStorage.setItem "vk_user_id", hash["user_id"]
location.href = "/"
