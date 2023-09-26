const fetch = require('node-fetch')
const http = require('follow-redirects').https
const zip = require('zip-lib')
const fs = require('fs')
const path = require('path')
const { app } = require('electron')

const unzipUpdate = (zipDir) => {
	return new Promise((resolve, reject) => {
		zip.extract(zipDir, '_update').then(() => {
			const _dirs = fs.readdirSync( path.join(__dirname, '_update') )
			const root = _dirs[0]
			if (!root) return reject()
		
			const files = fs.readdirSync( path.join(__dirname, '_update', root) )
			files.forEach(fileName => {
				fs.cpSync( path.join(__dirname, '_update', root, fileName), path.join(__dirname, '_update', fileName), {recursive: true, force: true} )
			})
		
			fs.rmSync( path.join(__dirname, '_update', root), {recursive: true, force: true} )
			fs.rm( zipDir, resolve)
		})
	})
}

const downloadUpdate = async (url) => {
	return new Promise((resolve, reject) => {
		const _path = path.join(__dirname, '_update', 'update.zip')
	
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
	
			try {
				fs.mkdirSync( path.join(__dirname, '_update'), {force: true} )
			} catch (error) {}
	
			downloadUpdate(data.zipball_url).then(_path => {
				unzipUpdate(_path).then(() => {
					fs.cpSync( path.join(__dirname, '_update'), path.join(__dirname), {recursive: true, force: true} )
					fs.rmSync( path.join(__dirname, '_update'), {recursive: true, force: true} )

					app.relaunch()
					app.exit(0)
				})
			})

			resolve(true)
		}
		else {
			resolve(false)
		}
	})
}