import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import Tabs from "./components/Tabs.jsx";
import Feed from "./components/Feed.jsx";
import AssistantPanel from "./components/AssistantPanel.jsx";
import { TABS } from "./tabs.js";
import { fetchNews } from "./api.js";

const AUTO_REFRESH_MS = 5 * 60 * 1000; // re-fetch the active tab every 5 minutes

export default function App() {
  const [activeTab, setActiveTab] = useState("general");
  const [feeds, setFeeds] = useState({}); // tab -> { stories, updatedAt }
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantStory, setAssistantStory] = useState(null);

  const timerRef = useRef(null);
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab;
    setError(null);
  }, [activeTab]);

  const scope = TABS.find((t) => t.key === activeTab)?.scope || "Mumbai";
  const current = feeds[activeTab];

  const load = useCallback(
    async (tab, { force = false } = {}) => {
      const haveData = Boolean(feeds[tab]);
      if (force) setRefreshing(true);
      else if (!haveData) setLoading(true);

      if (activeTabRef.current === tab) setError(null);

      try {
        const data = await fetchNews(tab, { force });
        setFeeds((prev) => ({ ...prev, [tab]: data }));

        // Backend fires a background refresh — auto re-fetch after 35s for fresh news
        if (data.backgroundRefresh) {
          setTimeout(() => {
            if (activeTabRef.current === tab) {
              fetchNews(tab, { force: false })
                .then((fresh) => setFeeds((prev) => ({ ...prev, [tab]: fresh })))
                .catch(() => {}); // silent — user can manually refresh if it fails
            }
          }, 35000);
        }
      } catch (err) {
        if (activeTabRef.current === tab) setError(err.message);
      } finally {
        if (activeTabRef.current === tab) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );


  // Load whenever the active tab changes (uses cache if we already have it).
  useEffect(() => {
    if (!feeds[activeTab]) load(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Auto-refresh the active tab on an interval.
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!autoRefresh) return;
    timerRef.current = setInterval(() => {
      load(activeTab, { force: true });
    }, AUTO_REFRESH_MS);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, activeTab]);

  function openAssistant(story = null) {
    setAssistantStory(story);
    setAssistantOpen(true);
  }

  const updatedLabel = formatUpdated(current?.updatedAt);

  return (
    <div className={"app" + (assistantOpen ? " app--shifted" : "")}>
      <div className="page">
        <Header
          scope={scope}
          updatedLabel={updatedLabel}
          refreshing={refreshing}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={setAutoRefresh}
          onRefresh={() => load(activeTab, { force: true })}
          onAskAi={() => openAssistant(null)}
        />

        <Tabs active={activeTab} onChange={setActiveTab} />

        <Feed
          loading={loading && !current}
          error={error}
          stories={current?.stories || []}
          onAsk={(story) => openAssistant(story)}
          onRetry={() => load(activeTab, { force: true })}
        />

        <footer className="footer">
          Summaries link back to their original sources. Nothing here is invented.
        </footer>
      </div>

      <AssistantPanel
        open={assistantOpen}
        story={assistantStory}
        onClose={() => setAssistantOpen(false)}
      />
    </div>
  );
}

function formatUpdated(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}
