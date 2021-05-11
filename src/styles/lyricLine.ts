import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(() => ({
  lineContainer: {
    position: 'fixed',
    bottom: 0,
    width: '100vw',
    zIndex: 10000,
    userSelect: 'none',
    cursor: 'move',
  },
}));
