const { dialog, app } = require('electron')
const http = require('follow-redirects').https
const extract = require('extract-zip')
const fs = require('fs')
const path = require('path')

const DOWNLOAD_URL = 'https://github.com/qurs/hammerpp-manager/releases/download/content/hammer++.zip'

const unzipContent = (zipDir) => {
	return new Promise((resolve, reject) => {
		extract(zipDir, { dir: path.join(process.cwd(), 'hammer++') }).then(() => {
			fs.rm(zipDir, {force: true}, resolve)
		}).catch(reject)
	})
}

const downloadContent = () => {
	return new Promise((resolve, reject) => {
		const _path = path.join(process.cwd(), 'hammer++.zip')
	
		const urlData = new URL(DOWNLOAD_URL)
		if (!urlData) return reject()
	
		if (fs.existsSync(_path)) return reject()
	
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

exports.check = () => {
	return new Promise((resolve, reject) => {
		if (fs.existsSync( path.join(process.cwd(), 'hammer++') )) return resolve(false)

		downloadContent().then(_path => {
			unzipContent(_path).then(() => {
				app.relaunch()
				app.exit(0)
			}).catch(err => {
				dialog.showErrorBox('Ошибка', 'При попыке распаковать контент Hammer++ произошла ошибка! ' + err)
			})
		}).catch(err => {
			dialog.showErrorBox('Ошибка', 'При попыке скачать контент Hammer++ произошла ошибка! ' + err)
		})

		resolve(true)
	})
}