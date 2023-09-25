const addContent = document.getElementById('new_content')
const removeContentBtns = document.getElementsByClassName('content__removecontent_button')
const saveContentBtn = document.getElementById('save_config')
const startBtn = document.getElementById('start_button')

addContent.addEventListener('click', () => {
	window.content.add()
})

saveContentBtn.addEventListener('click', () => {
	window.config.save()
})

startBtn.addEventListener('click', () => {
	window.hammer.start()
})

const removeContent = (el) => {
	window.content.remove(el.id)
}

const saveContent = (el) => {
	const found = el.id.match('[\\d]+')
	if (!found || !found[0]) return

	const id = found[0]
	const entry = document.getElementById(`content_${id}`)
	if (!entry) return

	window.content.save(el.id, entry.value)
}