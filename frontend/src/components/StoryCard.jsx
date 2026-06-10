// A single summarised story: title, TL;DR, source/timing, and Ask / Read actions.

export default function StoryCard({ story, onAsk }) {
  return (
    <article className="story">
      <h2 className="story__title">{story.title}</h2>

      <div className="story__body">
        <span className="story__tldr-label">TL;DR</span>
        <p className="story__tldr">{story.tldr}</p>
      </div>

      <div className="story__meta">
        <span className="story__source">
          {story.source} · {story.published}
        </span>
        <span className="story__actions">
          <button className="story__ask" onClick={() => onAsk(story)}>
            ✦ Ask / Similar
          </button>
          <a
            className="story__read"
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read full article →
          </a>
        </span>
      </div>
    </article>
  );
}
