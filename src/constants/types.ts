import { Events, Runtime } from 'webextension-polyfill-ts';

import { Event } from './enums';

type M<E extends Event, P> = P extends void ? {
  event: E;
  payload?: P;
} : {
  event: E;
  payload: P;
};

export type Message =
  | M<Event.totalTime, number>
  | M<Event.currentTime, number>
  | M<Event.playing, boolean>
  | M<Event.muted, boolean>
  | M<Event.volume, number>
  | M<Event.index, number | undefined>
  | M<Event.musics, MusicMetadata[]>
  | M<Event.granted, void>
  | M<Event.hello, void>
  | M<Event.goodbye, void>
  | M<Event.lyric, Lyric | undefined>
  | M<Event.lineNumber, number>
  ;

export type MessageHandler = (message: Message, port: Port) => void | Promise<void>;

export interface Port extends Runtime.Port {
  onMessage: Events.Event<MessageHandler>;

  postMessage(message: Message): void;
}

export interface MusicMetadata {
  name: string;
}

export interface Music extends MusicMetadata {
  name: string;
  musicFile: FileSystemFileHandle;
  lyricFile?: FileSystemFileHandle;
}

export interface Lyric {
  artist?: string;
  album?: string;
  title?: string;
  author?: string;
  by?: string;
  length?: number;
  offset: number;
  lines: Line[];
}

export interface Line {
  words: Word[];
  content: string;
}

export interface Word {
  time: number;
  content: string;
}
