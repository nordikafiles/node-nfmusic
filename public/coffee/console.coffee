window.CONSOLE = 
	print: (value) ->
		$(".console .content").append('<div class="line">' + value + '</div>')
	currentReadCallBack: null
window.COMMANDS = {}
Object.defineProperty COMMANDS, "addCommand", 
	value: (cname, func) ->
		COMMANDS[cname] = func
COMMANDS.addCommand "alert", (str) ->
	alert str.join("")
COMMANDS.addCommand
do $(".console input").focus
$(".console input").on "keydown", (e) ->
	if e.keyCode == 13
		nstr = ""
		ret = []
		nret = []
		cav = false
		input = $(this).val()
		console.log input
		for ch of input
			console.log( ch + " of " + (input.length-1))
			if input[ch] == " " and not cav and input[ch-1] != "\\"
				if nstr != "" then ret.push nstr
				nstr = ""
				continue
			if ch/1 + 1 == input.length
				if input[ch] != '"' then nstr += input[ch]

				console.log nstr
				if nstr != "" then ret.push nstr
				nstr = ""
				break
			if input[ch] == '"' and cav == false and input[ch-1] != "\\"
				cav = true
				continue
			if input[ch] =='"' and cav == true and input[ch-1] != "\\"
				cav = false
				ret.push nstr
				nstr = ""
				continue
			nstr += input[ch]
		$(this).val ""
		for st in ret
			st = st.replace /\\n/g, "\n"
			st = st.replace /\\t/g, "\t"
			st = st.replace /\\"/g, '"'
			st = st.replace /\\'/g, "'"
			st = st.replace /\\\s/g, " "
			nret.push st
		if COMMANDS[nret[0]] == undefined
			CONSOLE.print nret[0] + " not found"
		else
			COMMANDS[nret[0]].call this, nret.slice(1)
	$(document).scrollTop $(document).height()