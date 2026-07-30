import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search components..."
        value={value}
        onChange={e => onChange((e.target as HTMLInputElement).value)}
        autoFocus
      />
      {value && (
        <button
          className="search-clear"
          onClick={() => onChange('')}
          title="Clear search"
        >
          &times;
        </button>
      )}
    </div>
  );
}
