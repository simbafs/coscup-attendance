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
