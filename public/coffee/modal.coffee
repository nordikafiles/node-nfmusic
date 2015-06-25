class Modal 
	@alert: (message, title, callback) ->
		mod = new Modal
		mod.type = "ok"
		mod.title = title
		mod.text = message
		mod.init()
		mod.show callback
		return mod
	@confirm: (message, title, callback) ->
		mod = new Modal
		mod.type = "confirm"
		mod.title = title
		mod.text = message
		mod.init()
		mod.show callback
		return mod
	id: ""
	type: ""
	title: ""
	text: ""
	image: ""
	onclose: () ->
	onapplypressed: () ->
	oncancelpressed: () ->
	onokpressed: () ->
	init: () =>
		modalBoxId = "modal_box_" + (Math.floor(Math.random()*10000))
		$("body").append  "<div class='modal-box' id='" + modalBoxId + "'>  <div class='modal'><div class='modal-header'>  <h4>Simple title</h4>  <div class='close'>    <i></i>  </div></div><div class='modal-body'>  Simple text</div><div class='modal-footer'>  <div class='btn btn-primary yes'>#{DICTIONARY.yes}</div>  <div class='btn no'>#{DICTIONARY.no}</div>  <div class='btn ok'>#{DICTIONARY.ok}</div><div class='btn apply'>#{DICTIONARY.apply}</div><div class='btn cancel'>#{DICTIONARY.cancel}</div>    </div>  </div></div>"
		@id = modalBoxId
		if @type == 'ok' then $("#" + @id + " .modal").addClass "ok"
		if @type == 'confirm' then $("#" + @id + " .modal").addClass "confirm"
		if @type == 'apply' then $("#" + @id + " .modal").addClass "apply"
		if @type == 'image'
			$("#" + @id + " .modal")
				.addClass "image"
				.append '<img src="' + @image + '">'
		$("#" + @id + " h4").html @title
		$("#" + @id + " .modal-body").html @text
		$("#" + @id + " .apply").on "click", () =>
			@onapplypressed $("#" + @id)
	show: (callback) ->
		setTimeout () =>
			$("#" + @id).addClass "show"
			$("#" + @id + " .modal").addClass "show"
		, 10
		hideModal = () =>
			$("#" + @id + " .yes").off "click"
			$("#" + @id + " .no").off "click"
			$("#" + @id + " .btn.ok").off "click"
			$("#" + @id + " .close").off "click"
			$("#" + @id + " .cancel").off "click"
			$("#" + @id + " .modal").removeClass "show"
			setTimeout () =>
				$("#" + @id).removeClass "show"
			, 200
		$("#" + @id + " .cancel, " + "#" + @id + " .no").on "click", () =>
			do hideModal
			setTimeout () =>
				callback false, $("#" + @id)
			, 200
		$("#" + @id + " .yes, " + "#" + @id + " .ok").on "click", () =>
			do hideModal
			setTimeout () =>
				callback true, $("#" + @id)
			, 200
		$("#" + @id + " .close").on "click", () =>
			do hideModal
window.Modal = Modal