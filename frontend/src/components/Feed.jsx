// The list of stories for the active tab, with loading / error / empty states.

import StoryCard from "./StoryCard.jsx";

export default function Feed({ loading, error, stories, onAsk, onRetry }) {
  if (loading) {
    return (
      <div className="feed">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="story story--skeleton">
            <div className="sk sk--title" />
            <div className="sk sk--line" />
            <div className="sk sk--line sk--short" />
            <div className="sk sk--meta" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="feed feed__state">
        <p className="feed__error">Couldn’t load the feed.</p>
        <p className="feed__error-detail">{error}</p>
        <button className="btn" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (!stories.length) {
    return (
      <div className="feed feed__state">
        <p className="feed__error">No stories found right now.</p>
        <button className="btn" onClick={onRetry}>
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="feed">
      {stories.map((story, i) => (
        <StoryCard key={story.url || i} story={story} onAsk={onAsk} />
      ))}
    </div>
  );
}
