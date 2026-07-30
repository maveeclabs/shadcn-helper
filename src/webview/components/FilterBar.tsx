import React from "react";

interface FilterBarProps {
  value: "all" | "installed" | "uninstalled";
  onChange: (value: "all" | "installed" | "uninstalled") => void;
}

export default function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <button
        className={`filter-btn ${value === "all" ? "active" : ""}`}
        onClick={() => onChange("all")}
      >
        All
      </button>
      <button
        className={`filter-btn ${value === "installed" ? "active" : ""}`}
        onClick={() => onChange("installed")}
      >
        Installed
      </button>
      <button
        className={`filter-btn ${value === "uninstalled" ? "active" : ""}`}
        onClick={() => onChange("uninstalled")}
      >
        Not Installed
      </button>
    </div>
  );
}
