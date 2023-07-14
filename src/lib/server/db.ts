import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { dev } from '$app/environment'

export class DB<T extends {}> {
	private _db: Low<T>
	private _name: string

	constructor(name: string, initialData: T) {
		this._name = name
		const filename = dev ? `db-${name}-dev.json` : `db-${name}.json`
		const file = join(dirname(fileURLToPath(import.meta.url)), '../../..', filename)
		const adapter = new JSONFile<T>(file)
		this._db = new Low<T>(adapter, initialData)
	}

	public async writeData() {
		let fileLocked = true
		let attempts = 0
		do {
			try {
				attempts++
				await this._db.write()
				fileLocked = false
			} catch (_) {}
		} while (fileLocked) // Retry if write fails (can happen on dev-mode restarts)
		if (dev && attempts > 1)
			console.log(this._name, 'db write took', attempts, 'attempts')
	}

	public get data() {
		return this._db.data as Readonly<T>
	}

	public async modifyData(data: Partial<T>) {
		this._db.data = <T>{ ...this._db.data, ...data }
		await this.writeData()
	}

	public async initialize() {
		await this._db.read()
	}
}
