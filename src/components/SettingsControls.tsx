import { IconButton, Menu, MenuItem } from '@material-ui/core';
import { Settings } from '@material-ui/icons';
import React, { FC, useState } from 'react';

interface Props {
  items: { action: () => void; name: string }[];
}

export const SettingsControls: FC<Props> = ({ items }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  return (
    <>
      <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
        <Settings />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        {items.map(({ action, name }) => (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              action();
            }}
            key={name}
          >
            {name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
