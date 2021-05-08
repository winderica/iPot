import { useEffect, useRef } from 'react';

export const usePrevious = <T>(value: T, defaultValue: T) => {
  const ref = useRef<T>(defaultValue);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};
