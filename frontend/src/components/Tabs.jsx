// The tab row. Each tab has a small dot; the active one is underlined.

import { TABS } from "../tabs.js";

export default function Tabs({ active, onChange }) {
  return (
    <nav className="tabs" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          className={"tab" + (active === tab.key ? " tab--active" : "")}
          onClick={() => onChange(tab.key)}
        >
          <span className="tab__dot" />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
