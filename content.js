const fs = require('fs')
const path = require('path')
const content = {}
exports.content = content

content._list = []

content.load = (store) => {
	if (store.get('content')) {
		content._list = store.get('content')

		let changed = false
		content._list.forEach((el, i) => {
			if ( typeof el === 'string' ) {
				content._list[i] = [el, true]
				changed = true
			}
		})

		if (changed) {
			store.set('content', content._list)
		}
	}
}

content.getAll = () => {
	return content._list
}

content.get = index => {
	if (content._list[index] == null || content._list[index] == undefined) return
	return content._list[index][0]
}

content.add = (store) => {
	content._list.push(["", false])
	store.set('content', content._list)
}

content.set = (store, index, path) => {
	if (!path) return
	if (content._list[index] == null || content._list[index] == undefined) return

	content._list[index][0] = path
	store.set('content', content._list)
}

content.remove = (store, index) => {
	if (content._list[index] == null || content._list[index] == undefined) return

	content._list.splice(index, 1)
	store.set('content', content._list)
}

content.isEnabled = index => {
	if (content._list[index] == null || content._list[index] == undefined) return

	return content._list[index][1]
}

content.toggle = (store, index, b) => {
	if (content._list[index] == null || content._list[index] == undefined) return

	content._list[index][1] = b
	store.set('content', content._list)
}