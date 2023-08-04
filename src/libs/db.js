import fs from 'fs/promises'
import shouldParse from './shouldParse'
import getDefaultAttendance from './getDefaultAttendance'

async function loadData(filename) {
    return fs.stat(filename)
        .then(() => fs.readFile(filename, 'utf8'))
        .then(data => shouldParse(data, {}))
        .then(async (data) => {
            data.attendance = data?.attendance || await getDefaultAttendance()
            data.diffs = data?.diffs || []
            return data
        })
        .catch(async () => {
            return {
                attendance: await getDefaultAttendance(),
                diffs: []
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
 * @typedef {object} db
 * @property {function} appendDiff - append a diff to db
 * @property {function} getJSON - get the json object of db
 * @property {function} reloadDB - reload db from file
 * @property {function} saveDB - save db to file
 */

/**
 * create a db object
 * @param {string} file - filename
 * @param {whenUpdate} whenUpdate - callback when db is updated
 * @returns {Promise<db>} - db object
 */
export default async function NewDB(file, whenUpdate) {
    let db = await loadData(file)
    if (OpenedDB.has(file)) {
        return OpenedDB.get(file)
    }
    const dbObj = {
        appendDiff(diff) {
            // console.log('appendDiff', diff)
            if (['day', 'room', 'id', 'attendance'].some(i => !diff[i])) {
                return Error('invalid diff')
            }
            db.diffs.push(diff)
            db.attendance[diff.day][diff.room][diff.id] = diff.attendance

            saveData(file, db).then(() => {
                whenUpdate?.(diff)
            }).catch(e => {
                console.error(e)
            })

            return undefined
        },

        getJSON() {
            return db
        },

        async reloadDB() {
            db = await loadData(file)
        },

        async saveDB() {
            await saveData(file, db)
        },
    }
    OpenedDB.add(file, dbObj)
    return dbObj
}

