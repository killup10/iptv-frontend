// src/components/ui/tabs.jsx
import React from 'react';

// Tabs: recibe value, onValueChange y renderiza los Tab hijos
export function Tabs({ value, onValueChange, children, className }) {
  return (
    <div className={className + ' flex space-x-2'}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { isActive: child.props.value === value, onSelect: onValueChange })
      )}
    </div>
  );
}

// Tab: recibe value, label, isActive y onSelect
export function Tab({ value, label, isActive, onSelect }) {
  return (
    <button
      onClick={() => onSelect(value)}
      className={
        (isActive ? 'bg-blue-600' : 'bg-gray-700') +
        ' px-4 py-2 rounded text-white hover:bg-blue-500 transition'
      }
    >
      {label}
    </button>
  );
}
