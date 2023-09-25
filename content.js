const fs = require('fs')
const path = require('path')
const content = {}
exports.content = content

content._list = []

content.load = (store) => {
	if (store.get('content')) {
		content._list = store.get('content')
	}
}

content.getAll = () => {
	return content._list
}

content.get = index => {
	return content._list[index]
}

content.add = (store) => {
	content._list.push("")
	store.set('content', content._list)
}

content.set = (store, index, path) => {
	if (!path) return
	if (content._list[index] == null || content._list[index] == undefined) return

	content._list[index] = path
	store.set('content', content._list)
}

content.remove = (store, index) => {
	if (content._list[index] == null || content._list[index] == undefined) return

	content._list.splice(index, 1)
	store.set('content', content._list)
}