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
	'1F': ['RB101', 'RB102', 'RB105'],
	'2F': ['TR209', 'TR210', 'TR211', 'TR212', 'TR213', 'TR214'],
	'3F': ['TR313'],
	'4F': ['TR409-2', 'TR410', 'TR411', 'TR412-1', 'TR412-2', 'TR413-1'],
	'5F': ['TR510', 'TR511', 'TR512', 'TR513', 'TR514'],
	'6F': ['TR609', 'TR610', 'TR611', 'TR613', 'TR614', 'TR615', 'TR616'],
}

// TODO: modify this every year
export const days = {
	'3': '8/3',
	'4': '8/4',
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
