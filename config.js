const fs = require('fs')
const path = require('path')
const config = {}
exports.config = config

config._map = {}

config.load = (store) => {
	if (store.get('config')) {
		config._map = store.get('config')
	}
}

config.getAll = () => {
	return config._map
}

config.get = key => {
	return config._map[key]
}

config.set = (store, key, val) => {
	if (!key) return

	config._map[key] = val != '' ? val : undefined
	store.set('config', config._map)
}