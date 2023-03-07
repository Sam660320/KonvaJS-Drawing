import React from 'react';
import { Vector2d } from 'konva/lib/types';

const ContextMenu = (props: {
  position: Vector2d;
  options: string[];
  onOptionSelected: Function;
}) => {
  const handleOptionSelected = (option: string) =>
    props.onOptionSelected(option);

  return (
    <div
      className='menu'
      style={{
        position: 'absolute',
        left: props.position.x,
        top: props.position.y,
        zIndex: 1,
        padding: 10,
      }}
    >
      {props.options.map((option) => {
        return (
          <button
            style={{ display: 'block', width: 150, border: '1px solid' }}
            key={`option_${option}`}
            onClick={() => handleOptionSelected(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};

export default ContextMenu;
