window.define = function (objName, obj) {
	Object.defineProperty(window, objName, {
		value: obj,
		enumerable: false,
		configurable: false,
		writable: false
	})
}