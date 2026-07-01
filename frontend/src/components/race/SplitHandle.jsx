import React from 'react';

const SplitHandle = ({ direction, onMouseDown, colors }) => {
  const isVertical = direction === 'vertical';
  
  return (
    <div 
      onMouseDown={onMouseDown}
      style={{ 
        width: isVertical ? '4px' : '100%', 
        height: isVertical ? '100%' : '4px',
        cursor: isVertical ? 'col-resize' : 'row-resize', 
        background: 'transparent', 
        transition: 'background 0.2s', 
        borderRadius: '4px', 
        zIndex: 10 
      }}
      onMouseOver={e => e.currentTarget.style.background = colors.borderHover}
      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
    />
  );
};

export default SplitHandle;