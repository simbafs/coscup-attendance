import fs from 'fs/promises'
import shouldParse from './shouldParse'
import getDefaultAttendance from './getDefaultAttendance'

async function loadData(filename) {
	return fs
		.stat(filename)
		.then(() => fs.readFile(filename, 'utf8'))
		.then(data => shouldParse(data, {}))
		.then(async data => {
			data.attendance = data?.attendance || (await getDefaultAttendance())
			data.diffs = data?.diffs || []
			return data
		})
		.catch(async () => {
			return {
				attendance: await getDefaultAttendance(),
				diffs: [],
			}
		})
}

async function saveData(filename, data) {
	// console.log('saveData', filename, data)
	return fs.writeFile(filename, JSON.stringify(data))
}

const OpenedDB = new Set()

/**
 * this callback is called when db is updated
 * @callback whenUpdate
 * @param {object} diff - diff object
 */

/**
 * create a db object
 * @param {string} file - filename
 * @param {function} whenUpdate - callback when db is updated
 * @returns {Promise<db>} - db object
 */
export default async function NewDB(file, whenUpdate) {
	let db = await loadData(file)
	if (OpenedDB.has(file)) {
		return OpenedDB.get(file)
	}
	const dbObj = {
		async appendDiff(diffs) {
			for (let diff of diffs) {
				// console.log('appendDiff', diff)
				if (['day', 'room', 'id', 'attendance'].some(i => !diff[i])) {
					throw Error('invalid diff')
				}
				db.diffs.push(diff)
				db.attendance[diff.day][diff.room][diff.id] = Number(
					diff.attendance
				)
			}

			return saveData(file, db).then(() => {
				whenUpdate?.(diffs)
			})
		},

		getJSON() {
			return db
		},
		// async reloadDB() {
		//     db = await loadData(file)
		// },
		//
		// async saveDB() {
		//     await saveData(file, db)
		// },
	}
	OpenedDB.add(file, dbObj)
	return dbObj
}
