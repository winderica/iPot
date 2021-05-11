import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(() => ({
  lineContainer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    zIndex: 10000,
    userSelect: 'none',
    cursor: 'move',
  },
}));
