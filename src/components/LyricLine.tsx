import { Typography } from '@material-ui/core';
import { blue, green, orange, red } from '@material-ui/core/colors';
import React, { FC, useEffect, useRef, useState } from 'react';

import { Line } from '@constants/types';
import { useStyles } from '@styles/lyricLine';

interface Props {
  line?: Line;
  currentTime: number;
  nextTime: number;
  playing: boolean;
}

export const LyricLine: FC<Props> = ({ line, currentTime, nextTime, playing }) => {
  const startTime = line?.words[0]?.time ?? 0;
  const duration = nextTime - startTime;
  const svg = useRef<SVGSVGElement | null>(null);
  const fg = useRef<SVGTextElement | null>(null);
  const bg = useRef<SVGTextElement | null>(null);
  const [animation, setAnimation] = useState<Animation>();
  const [shift, setShift] = useState<[number, number]>();
  const classes = useStyles();
  useEffect(() => {
    if (!svg.current || !fg.current || !bg.current || !line) {
      return;
    }
    const { x, y, width, height } = svg.current.getBBox();
    svg.current.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
    svg.current.setAttribute('width', `${width}px`);
    svg.current.setAttribute('height', `${height}px`);
    if (!width || !duration) {
      return;
    }
    const animation = bg.current.animate(
      {
        clipPath: [...fg.current.children]
          .map((i) => (i as SVGGraphicsElement).getBBox())
          .map(({ x }, index, boxes) => {
            const prev = boxes[index - 1];
            return Math.max(x, prev ? (prev.x + prev.width) : 0);
          })
          .map((i) => `inset(0 0 0 ${(i - x) * 100 / width}%)`)
          .concat('inset(0 0 0 100%)'),
        offset: line.words.map(({ time }) => Math.min((time - startTime) / duration, 1)).concat(1),
      },
      {
        duration,
        easing: 'linear',
        fill: 'forwards',
      }
    );
    animation.currentTime = currentTime - startTime;
    playing ? animation.play() : animation.pause();
    setAnimation(animation);
  }, [line]);
  useEffect(() => {
    if (!shift) {
      return;
    }
    const onMouseMove = ({ clientX, clientY }: MouseEvent) => {
      if (!svg.current) {
        return;
      }
      svg.current.style.right = 'unset';
      svg.current.style.bottom = 'unset';
      svg.current.style.left = `${clientX - shift[0]}px`;
      svg.current.style.top = `${clientY - shift[1]}px`;
    };
    const onMouseUp = () => {
      setShift(undefined);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, [shift]);
  useEffect(() => {
    playing ? animation?.play() : animation?.pause();
  }, [playing]);
  return (
    <svg
      ref={svg}
      className={classes.lineContainer}
      onMouseDown={({ currentTarget, clientX, clientY }) => {
        const { left, top } = currentTarget.getBoundingClientRect();
        setShift([clientX - left, clientY - top]);
      }}
    >
      <defs>
        <linearGradient id='bg-color' x1='0' y1='0' x2='100%' y2='0'>
          <stop stopColor={blue[500]} offset='0' />
          <stop stopColor={green[500]} offset='100%' />
        </linearGradient>
        <linearGradient id='fg-color' x1='0' y1='0' x2='100%' y2='0'>
          <stop stopColor={red[500]} offset='0' />
          <stop stopColor={orange[500]} offset='100%' />
        </linearGradient>
      </defs>
      <text x='0' y='1em' fill='url(#fg-color)' ref={fg}>
        {line?.words.map(({ content }, index) => (
          <Typography component='tspan' variant='h4' key={index}>{content}</Typography>
        ))}
      </text>
      <text x='0' y='1em' fill='url(#bg-color)' ref={bg}>
        <Typography component='tspan' variant='h4'>{line?.content}</Typography>
      </text>
    </svg>
  );
};
