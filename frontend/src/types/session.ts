export type Floors = Record<string, string[]>
export type Floor = keyof Floors
export type Days = Record<string, string>
export type Day = keyof Days

let floors: Floors = {}
let days: Days = {}

export { floors, days }

export function initFloors(data: Sessions) {
	const rooms = Array.from(new Set(data.sessions.map(s => s.room)))
	rooms.sort((a, b) => Number(a[2]) - Number(b[2]))

	const floorKeys = Array.from(new Set(rooms.map(r => r[2])))
	floors = floorKeys.reduce((acc, key) => {
		const f = `${key}F`
		acc[f] = rooms.filter(r => r[2] === key)
		return acc
	}, floors)
}

export function formatDay(day: string) {
	const date = new Date(day)
	const dayStr = `${date.getMonth() + 1}/${date.getDate()}`
	return dayStr
}

export function initDays(data: Sessions) {
	const d = Array.from(new Set(data.sessions.map(s => s.start)))
	d.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

	days = d.reduce((acc, day) => {
		const dayStr = formatDay(day)
		acc[dayStr] = dayStr
		return acc
	}, days)
}

export function getFloor(roomId: string) {
	for (const [floor, rooms] of Object.entries(floors)) {
		if (rooms.includes(roomId)) {
			return floor
		}
	}
	return null // Return null if the roomId is not found in any floor
}

// Type definitions for the sessions.json file
export interface Sessions {
	sessions: Session[]
	speakers: Speaker[]
	session_types: Room[]
	rooms: Room[]
	tags: Room[]
}

export interface Room {
	id: string
	zh: RoomEn
	en: RoomEn
}

export interface RoomEn {
	name: string
}

export interface Session {
	id: string
	type: string
	room: string
	start: string
	end: string
	language: Language
	zh: SessionEn
	en: SessionEn
	speakers: string[]
	tags: Tag[]
	co_write: null | string
	qa: null
	slide: null
	record?: string
	uri: string
}

export interface SessionEn {
	title: string
	description: string
}

export enum Language {
	English = 'English',
	中文 = '中文',
}

export enum Tag {
	Advance = 'Advance',
	Beginner = 'Beginner',
	En = 'en',
	Prime = 'Prime',
	Skilled = 'Skilled',
	ZhTw = 'zh-tw',
}

export interface Speaker {
	id: string
	avatar: string
	zh: SpeakerEn
	en: SpeakerEn
}

export interface SpeakerEn {
	name: string
	bio: string
}
