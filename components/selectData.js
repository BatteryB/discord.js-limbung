import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
const db = new Database(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'db', 'egoGift.db'));

export function selectInmateObj() {
    const inmateData = db.prepare('SELECT * FROM inmate').all();

    return inmateData.map(inmate => {
        return {
            name: inmate.name, 
            value: inmate.id
        }
    })
}

export function selectKeyword() {
    const keywordData = db.prepare('SELECT * FROM keyword').all();

    return keywordData.map(keyword => {
        return {
            name: keyword.name, 
            value: keyword.id
        }
    })
}