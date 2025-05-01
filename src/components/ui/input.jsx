// src/components/ui/input.jsx
import React from 'react';

export function Input(props) {
  return (
    <input
      {...props}
      className={'w-full p-2 border rounded ' + (props.className || '')}
    />
  );
}
