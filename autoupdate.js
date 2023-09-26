const http = require('follow-redirects').https
const extract = require('extract-zip')
const fs = require('fs')
const path = require('path')
const { app, dialog } = require('electron')

const unzipUpdate = (zipDir) => {
	return new Promise((resolve, reject) => {
		process.noAsar = true
		extract(zipDir, { dir: path.join(process.cwd(), '_update') }).then(() => {
			process.noAsar = false
			fs.rm(zipDir, {force: true}, resolve)
		}).catch(err => {
			process.noAsar = false
			reject(err)
		})
	})
}

const downloadUpdate = async (repoName) => {
	return new Promise((resolve, reject) => {
		const _path = path.join(process.cwd(), '_update', 'update.zip')
	
		const url = `https://github.com/qurs/${repoName}/releases/latest/download/HammerPlusPlus-Manager.zip`
		const urlData = new URL(url)
		if (!urlData) return reject()

		if (fs.existsSync(_path)) {
			fs.rmSync(_path, {force: true})
		}
	
		http.get({
			hostname: urlData.hostname,
			path: urlData.pathname,
			headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10; Win64; x64; rv:60.0) Gecko/20100101 Firefox/60.0'},
		}, res => {
			res.on('data', chunk => {
				fs.appendFileSync(_path, chunk)
			})
	
			res.on('end', () => {
				if (res.statusCode != 200) {
					reject()
				}
				else {
					resolve(_path)
				}
			})
		})
	})
}

exports.checkUpdate = repoName => {
	return new Promise(async (resolve, reject) => {
		const res = await fetch(`https://api.github.com/repos/qurs/${repoName}/releases/latest`)
		const data = await res.json()

		if (!data || !data.zipball_url) return reject()
		
		const package = require('./package.json')
		if (data.tag_name != package.version) {
			console.log('UPDATE IS REQUIRED!')
			dialog.showErrorBox('Обновление', `Доступно новое обновление ${data.tag_name}! Скачайте по следующей ссылке: https://github.com/qurs/hammerpp-manager/releases/latest`)

			resolve(false)
	
			// try {
			// 	fs.mkdirSync( path.join(process.cwd(), '_update'), {force: true} )
			// } catch (error) {}
	
			// downloadUpdate(repoName).then(_path => {
			// 	unzipUpdate(_path).then(() => {
			// 		app.relaunch()
			// 		app.exit(0)

			// 		fs.cpSync( path.join(process.cwd(), '_update'), path.join(process.cwd()), {recursive: true, force: true} )
			// 		fs.rmSync( path.join(process.cwd(), '_update'), {recursive: true, force: true} )
			// 	}).catch(err => {
			// 		dialog.showErrorBox('Распаковка', 'При распаковке обновления произошла ошибка! ' + err)
			// 	})
			// })

			// resolve(true)
		}
		else {
			resolve(false)
		}
	})
}