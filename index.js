const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const cp = require('child_process')
const Store = require('electron-store')
const { content } = require('./content')
const { config } = require('./config')
const autoupdate = require('./autoupdate')
const hammercontent = require('./hammercontent')

const store = new Store()

const hammerConfig = `
"Configs"
{
	"Games"
	{
		"GarrysMod"
		{
			"GameDir"			"${ path.join(process.cwd(), 'hammer++', 'sourcetest') }"
			"Hammer"
			{
				"GameData0"		"${ path.join('!gmod_dir!', 'bin', 'garrysmod.fgd') }"
				"GameData1"		"${ path.join(process.cwd(), 'hammer++', 'bin', 'hammerplusplus', 'hammerplusplus_fgd.fgd') }"
				"GameData2"		"${ path.join(process.cwd(), 'hammer++', 'bin', 'propper.fgd') }"
				"TextureFormat"	"5"
				"MapFormat"		"4"
				"DefaultTextureScale"	"0.250000"
				"DefaultLightmapScale"	"16"
				"GameExe"		"${ path.join(process.cwd(), 'hammer++', 'hl2.exe') }"
				"DefaultSolidEntity"	"func_detail"
				"DefaultPointEntity"	"info_player_start"
				"BSP"			"${ path.join('!gmod_dir!', 'bin', 'vbsp.exe') }"
				"Vis"			"${ path.join('!gmod_dir!', 'bin', 'vvis.exe') }"
				"Light"			"${ path.join('!gmod_dir!', 'bin', 'vrad.exe') }"
				"GameExeDir"		"${ path.join(process.cwd(), 'hammer++') }"
				"MapDir"		"${ path.join(process.cwd(), 'hammer++', 'sourcesdk_content', 'sourcetest', 'mapsrc') }"
				"BSPDir"		"${ path.join('!gmod_dir!', 'garrysmod', 'maps') }"
				"PrefabDir"		"${ path.join(process.cwd(), 'hammer++', 'bin', 'Prefabs') }"
				"CordonTexture"		"tools/toolsskybox"
				"MaterialExcludeCount"	"0"
				"Previous"		"1"
			}
		}
	}
	"SDKVersion"					"5"
}
`

const gameInfo = `
"GameInfo"
{
	game		"Source Engine Test"
	title 		"~"
    title2		"Source Test"
	type		singleplayer_only
	FileSystem
	{
		SteamAppId				243750

		SearchPaths
		{
			game+mod			sourcetest/custom/*

			game_lv				hl2/hl2_lv.vpk
			game+mod			sourcetest/sourcetest_pak.vpk
			game				|all_source_engine_paths|hl2/hl2_sound_vo_english.vpk
			game				|all_source_engine_paths|hl2/hl2_pak.vpk
			game				|all_source_engine_paths|hl2/hl2_textures.vpk
			game				|all_source_engine_paths|hl2/hl2_sound_misc.vpk
			game				|all_source_engine_paths|hl2/hl2_misc.vpk
			platform			|all_source_engine_paths|platform/platform_misc.vpk

			mod+mod_write+default_write_path		|gameinfo_path|.

			game+game_write		sourcetest

			gamebin				sourcetest/bin

			game				|all_source_engine_paths|sourcetest
			game				|all_source_engine_paths|hl2
			platform			|all_source_engine_paths|platform
		
			//Game Contents
			!contents!
		}
	}
}
`

const mountCfg = `
"mountcfg"
{
	!contents!
}
`

let notify

const createWindow = () => {
	const win = new BrowserWindow({
		titleBarStyle: 'hidden',
		titleBarOverlay: {
			color: '#303030',
			symbolColor: '#dddddd',
			height: 32,
		},
		width: 800,
		height: 600,
		webPreferences: {
			contextIsolation: true,
			preload: path.join(__dirname, 'preload.js'),
		},
		icon: 'icons/app.png',
	})
  
	win.loadFile('html/index.html')
}

const createLoadingWindow = () => {
	const win = new BrowserWindow({
		titleBarStyle: 'hidden',
		titleBarOverlay: {
			color: '#303030',
			symbolColor: '#dddddd',
			height: 32,
		},
		width: 800,
		height: 600,
		webPreferences: {
			contextIsolation: true,
		},
		icon: 'icons/app.png',
	})
  
	win.loadFile('html/loading.html')
}

app.whenReady().then(() => {
	content.load(store)
	config.load(store)

	// autoupdate.checkUpdate('hammerpp-manager').then(need => {
	// 	if (!need) {
	// 		createWindow()
	// 	}
	// 	else {
	// 		createLoadingWindow()
	// 	}
	// }).catch(() => {
	// 	createWindow()
	// 	dialog.showErrorBox('Ошибка с обновлением', 'Кажется, на твоей версии невозможно автообновление! Скачай последнюю версию с Github')
	// })

	autoupdate.checkUpdate('hammerpp-manager')

	hammercontent.check().then(downloading => {
		if (downloading) {
			createLoadingWindow()
		}
		else {
			createWindow()
		}
	})

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

ipcMain.handle('content.add', () => {
	content.add(store)
})

ipcMain.handle('content.set', (_, index, path) => {
	if (index == null || index == undefined) return
	if (!path) return

	content.set(store, index, path)
})

ipcMain.handle('content.remove', (_, index) => {
	if (index == null || index == undefined) return
	content.remove(store, index)
})

ipcMain.handle('config.save', (_, paths) => {
	if (!paths) return
	if (paths.length <= 0) return

	for (let k in paths) {
		let v = paths[k]
		config.set(store, k, v)
	}
})

ipcMain.handle('content.toggle', (_, index, b) => {
	if (index == null || index == undefined) return

	content.toggle(store, index, b)
})

ipcMain.handle('content.fetch', () => {
	return content.getAll()
})

ipcMain.handle('config.fetch', () => {
	return config.getAll()
})

ipcMain.handle('start', () => {
	const gmodPath = config.get('gmodPath')
	if (!gmodPath) return notify = 'Не указан путь к GarrysMod!'

	const newHammerConfig = hammerConfig.replaceAll('!gmod_dir!', gmodPath)
	fs.writeFileSync( path.join(process.cwd(), 'hammer++', 'bin', 'hammerplusplus', 'hammerplusplus_gameconfig.txt'), newHammerConfig )

	let pathsStr = ''
	let mountCfgStr = ''

	content.getAll().forEach((el, i) => {
		let _path = el[0]
		if (!_path) return

		let disabled = '//'
		if (content.isEnabled(i)) {
			disabled = ''
		}

		const pathWithoutVPK = _path.match('.+(?=\\\\.+\\.vpk)')
		if (pathWithoutVPK && pathWithoutVPK[0]) {
			mountCfgStr += `${disabled}"${i}" "${pathWithoutVPK[0]}"\n	`
		}
		else {
			mountCfgStr += `${disabled}"${i}" "${_path}"\n	`
		}

		pathsStr += `${disabled}game "${_path}"\n			`
	})

	const newGameInfo = gameInfo.replaceAll('!contents!', pathsStr)
	fs.writeFileSync( path.join(process.cwd(), 'hammer++', 'sourcetest', 'gameinfo.txt'), newGameInfo )

	const newMountCfg = mountCfg.replaceAll('!contents!', mountCfgStr)
	fs.writeFileSync( path.join(process.cwd(), 'hammer++', 'sourcetest', 'cfg', 'mount.cfg'), newMountCfg )

	cp.execFile( path.join(process.cwd(), 'hammer++', 'bin', 'hammerplusplus.exe') )
	// app.quit()
})

ipcMain.handle('get_error', () => {
	if (!notify) return

	let val = notify
	notify = null

	return val
})

ipcMain.handle('get_version', () => {
	return require('./package.json').version
})