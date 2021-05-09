import { Line, Lyric } from '@constants/types';

const matchArrayToTime = (match: RegExpMatchArray) => {
  return +(match[1] ?? 0) * 60000 + +(match[2] ?? 0) * 1000 + +(match[3] ?? 0) * 10;
};

export const parseLrc = (source: string) => {
  const lyric: Lyric = { offset: 0, lines: [] };
  source.split(/\r?\n/).forEach((line) => {
    line = line.trim();
    if (line[0] === '[' && line[1] > '9') {
      lyric.artist = (/\[ar:\s*(.*)]/.exec(line))?.[1] ?? lyric.artist;
      lyric.album = (/\[al:\s*(.*)]/.exec(line))?.[1] ?? lyric.album;
      lyric.title = (/\[ti:\s*(.*)]/.exec(line))?.[1] ?? lyric.title;
      lyric.author = (/\[au:\s*(.*)]/.exec(line))?.[1] ?? lyric.author;
      lyric.by = (/\[by:\s*(.*)]/.exec(line))?.[1] ?? lyric.by;
      const time = /\[length:\s*(\d+):(\d+)(?:.(\d+))?]/.exec(line);
      lyric.length = time ? matchArrayToTime(time) : lyric.length;
      lyric.offset = +((/\[offset:\s*([+-]?\d+)]/.exec(line))?.[1] ?? lyric.offset);
    }
    const lines: Line[] = [];
    const items = line.split(/((?:\[\d+:\d+.\d+])+)/g);
    for (let i = 1; i < items.length; i += 2) {
      const content = items[i + 1];
      let j = 0;
      for (const time of items[i].matchAll(/\[(\d+):(\d+).(\d+)]/g)) {
        lines[j] = lines[j] ?? { words: [], content: '' };
        lines[j].words.push({ time: matchArrayToTime(time), content });
        j++;
      }
    }
    lines.forEach((line) => {
      line.words.sort((a, b) => a.time - b.time);
      line.content = line.words.map(({ content }) => content).join('');
      lyric.lines.push(line);
    });
  });
  lyric.lines.sort((a, b) => a.words[0].time - b.words[0].time);
  return lyric;
};
