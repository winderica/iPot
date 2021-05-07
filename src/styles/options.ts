import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(({ palette }) => ({
  highlighted: {
    color: palette.primary.main,
  },
}));
