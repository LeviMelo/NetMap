import React, { useState, memo } from 'react';
import { Handle, Position } from 'reactflow';

const Node = memo(({ data, selected, id }) => {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const handleDoubleClick = () => {
    setEditing(true);
  };

  const handleInputChange = (event) => {
    setLabel(event.target.value);
  };

  const handleBlur = () => {
    setEditing(false);
    data.onChange({ ...data, label });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <div
      className="custom-node"
      onDoubleClick={handleDoubleClick}
      style={{ backgroundColor: data.color }}
    >
      <Handle type="target" position={Position.Top} />
      {editing ? (
        <input
          type="text"
          value={label}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="px-2 py-1 text-sm border border-gray-400 rounded-sm"
          autoFocus
        />
      ) : (
        <div className="text-sm">{label || `Node ${id}`}</div>
      )}
      <Handle type="source" position={Position.Bottom} id="a" />
    </div>
  );
});

export default Node;