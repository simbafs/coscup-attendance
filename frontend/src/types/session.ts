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

// TODO: modify this every year
export const floors = {
	'1F': ['AU', 'RB 105'],
	'2F': ['TR 209', 'TR 210', 'TR 211', 'TR 212', 'TR 213', 'TR 214'],
	'3F': ['TR 310-1', 'TR 311', 'TR 312', 'TR 313'],
	'4F': ['TR 409-1', 'TR 410', 'TR 411', 'TR 412-1', 'TR 412-2', 'TR 413-1'],
	'5F': ['TR 509', 'TR 510', 'TR 511', 'TR 512', 'TR 513'],
	'6F': ['TR 609', 'TR 613', 'TR 614', 'TR 615', 'TR 616'],
}

// TODO: modify this every year
export const days = {
	'29': '7/29',
	'30': '7/30',
}

export type Floors = typeof floors
export type Floor = keyof Floors
export type Days = typeof days
export type Day = keyof Days

export function getFloor(roomId: string) {
	for (const [floor, rooms] of Object.entries(floors)) {
		if (rooms.includes(roomId)) {
			return floor
		}
	}
	return null // Return null if the roomId is not found in any floor
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
