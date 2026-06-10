// The Ask AI assistant. Slides in from the right. Works in two modes:
//  - general: ask anything about Mumbai real estate / construction
//  - story-scoped: opened from a specific story, with quick-action chips

import { useEffect, useRef, useState } from "react";
import { askAssistant } from "../api.js";

const STORY_CHIPS = [
  "Find similar stories",
  "Give me the background",
  "What’s the impact for developers?",
];

export default function AssistantPanel({ open, story, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  const storyContext = story ? story.title : null;

  // Reset the conversation each time the panel is (re)opened with a new context.
  useEffect(() => {
    if (!open) return;
    setMessages([]);
    setInput("");
  }, [open, storyContext]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  async function send(question) {
    const q = (question || input).trim();
    if (!q || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const res = await askAssistant(q, storyContext);
      setMessages((m) => [
        ...m,
        { role: "assistant", text: res.answer, sources: res.sources || [] },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `Sorry — ${err.message}`, sources: [] },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div
        className={"scrim" + (open ? " scrim--open" : "")}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside className={"assistant" + (open ? " assistant--open" : "")} aria-hidden={!open}>
        <div className="assistant__head">
          <div className="assistant__eyebrow">ASSISTANT</div>
          <div className="assistant__subtitle">
            {story ? story.title : "Mumbai construction & real estate"}
          </div>
          <button className="assistant__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="assistant__scroll" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="bubble bubble--intro">
              {story ? (
                <>
                  <p>
                    Ask me about <strong>{story.title}</strong> — or tap below to find related
                    coverage.
                  </p>
                  <div className="chips">
                    {STORY_CHIPS.map((c) => (
                      <button key={c} className="chip" onClick={() => send(c)}>
                        {c}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p>
                  Ask me for any Mumbai construction or real-estate news — by locality, developer,
                  regulation or topic.
                </p>
              )}
            </div>
          )}

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="bubble bubble--user">
                {m.text}
              </div>
            ) : (
              <div key={i} className="bubble bubble--assistant">
                <AnswerText text={m.text} />
                {m.sources?.length > 0 && (
                  <div className="sources">
                    {m.sources.map((s, j) => (
                      <a
                        key={j}
                        className="source"
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {s.title} ↗
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {busy && (
            <div className="bubble bubble--assistant bubble--typing">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          )}
        </div>

        <form
          className="assistant__compose"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            className="assistant__input"
            placeholder="Ask for news…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
          />
          <button className="assistant__send" type="submit" disabled={busy} aria-label="Send">
            ↑
          </button>
        </form>
      </aside>
    </>
  );
}

// Render the model's plain-text answer, preserving line breaks and bullet lines.
function AnswerText({ text }) {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  return (
    <div className="answer">
      {lines.map((line, i) => (
        <p key={i} className={line.trim().startsWith("•") ? "answer__bullet" : "answer__line"}>
          {line.replace(/^•\s*/, "")}
        </p>
      ))}
    </div>
  );
}
