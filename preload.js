const { contextBridge, ipcRenderer } = require('electron')

const cfgElements = {
	gmodPath: 'gmod_path',
}

const notify = err => {
	const notifyWindow = document.getElementById('error')
	if (!notifyWindow) return

	notifyWindow.innerText = err
	notifyWindow.style.visibility = 'visible'

	setInterval(() => {
		notifyWindow.style.visibility = 'hidden'
	}, 2000)
}

const start = () => {
	ipcRenderer.invoke('start')
}

const addContentItem = (_path, index) => {
	const contentList = document.getElementById('content_list')

	const item = document.createElement('div')
	item.className = 'content__list__item'
	item.innerHTML = `
		<div class="content__list__item">
			<input class="content__pathto" id="content_${index}" placeholder="Путь до файла .vpk (если есть)" value="${_path}">
			<input class="content__newcontent_button" id="save_content_${index}" type="submit" value="Сохранить" onclick="saveContent(this)">
			<input class="content__newcontent_button" id="delete_content_${index}" type="submit" value="Удалить" onclick="removeContent(this)">
		</div>
	`

	contentList.appendChild(item)
}

const loadContentList = content => {
	content.forEach((_path, i) => {
		addContentItem(_path, i)
	})
}

const loadConfig = cfg => {
	if (!cfg) return

	for (let k in cfg) {
		if (!cfg[k]) continue

		const id = cfgElements[k]
		if (!id) continue

		const entry = document.getElementById(id)
		if (!entry) continue

		entry.value = cfg[k]
	}
}

const addNewContent = () => {
	ipcRenderer.invoke('content.add')
}

const removeContent = id => {
	if (!id) return

	const found = id.match('[\\d]+')
	if (!found || !found[0]) return

	ipcRenderer.invoke('content.remove', parseInt(found[0]))
}

const saveContent = (id, path) => {
	if (!id) return
	if (!path) return

	const found = id.match('[\\d]+')
	if (!found || !found[0]) return

	ipcRenderer.invoke('content.set', parseInt(found[0]), path)
}

const saveConfig = () => {
	let paths = {}

	const gmodPathEl = document.getElementById('gmod_path')
	if (gmodPathEl) {
		paths.gmodPath = gmodPathEl.value
	}

	ipcRenderer.invoke('config.save', paths)
}

contextBridge.exposeInMainWorld('content', {
	add: addNewContent,
	remove: removeContent,
	save: saveContent,
})

contextBridge.exposeInMainWorld('config', {
	save: saveConfig,
})

contextBridge.exposeInMainWorld('hammer', {
	start: start,
})

window.addEventListener('DOMContentLoaded', () => {
	ipcRenderer.invoke('content.fetch').then(content => {
		loadContentList(content)
	})

	ipcRenderer.invoke('config.fetch').then(cfg => {
		loadConfig(cfg)
	})

	ipcRenderer.invoke('get_error').then(err => {
		if (!err) return
		notify(err)
	})
})