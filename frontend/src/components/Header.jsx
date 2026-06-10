// Masthead: live-feed eyebrow, editorial title, intro, and the control row
// (Refresh, Ask AI, Auto-refresh toggle, Updated time).

import { TABS } from "../tabs.js";

export default function Header({
  scope,
  updatedLabel,
  refreshing,
  autoRefresh,
  onToggleAutoRefresh,
  onRefresh,
  onAskAi,
}) {
  return (
    <header className="masthead">
      <div className="eyebrow">
        <span className="eyebrow__dot" />
        LIVE FEED · {scope.toUpperCase()}
      </div>

      <h1 className="masthead__title">
        Mumbai Real Estate <em>Brief</em>
      </h1>

      <p className="masthead__intro">
        Projects, laws and regulations across the Mumbai region — plus global construction AI.
        <br />
        Each story a TL;DR; ask the assistant for anything specific.
      </p>

      <div className="controls">
        <button className="btn btn--primary" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? "REFRESHING…" : "REFRESH"}
        </button>

        <button className="btn btn--ghost" onClick={() => onAskAi()}>
          ✦ ASK AI
        </button>

        <label className="toggle">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => onToggleAutoRefresh(e.target.checked)}
          />
          <span className="toggle__track">
            <span className="toggle__thumb" />
          </span>
          <span className="toggle__label">Auto-refresh</span>
        </label>

        <span className="controls__updated">Updated {updatedLabel}</span>
      </div>
    </header>
  );
}

export { TABS };
