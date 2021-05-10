import { Message, Port } from '@constants/types';

type MessageMap = {
  [P in Message['event']]: Extract<Message, { event: P }>['payload'];
};

export const sendOne = <E extends keyof MessageMap>(port: Port, event: E, payload: MessageMap[E]) => {
  port.postMessage({ event, payload } as Message);
};

export const sendMultiple = <E extends keyof MessageMap>(ports: Iterable<Port>, event: E, payload: MessageMap[E]) => {
  for (const port of ports) {
    sendOne(port, event, payload);
  }
};
