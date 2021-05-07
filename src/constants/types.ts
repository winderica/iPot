import { Events, Runtime } from 'webextension-polyfill-ts';

import { Event, Status } from './enums';

type M<E extends Event, P> = P extends void ? {
  event: E;
} : {
  event: E;
  payload: P;
};

type Message =
  | M<Event.totalTime, number>
  | M<Event.currentTime, number>
  | M<Event.status, Status>
  | M<Event.volume, number>
  | M<Event.ping, void>
  | M<Event.parse, void>
  | M<Event.load, string>
  | M<Event.play, void>
  | M<Event.pause, void>;

export interface Port extends Runtime.Port {
  onMessage: Events.Event<(message: Message, port: Port) => void | Promise<void>>;
  postMessage(message: Message): void;
}
