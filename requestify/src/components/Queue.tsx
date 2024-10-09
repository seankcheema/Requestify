import React from 'react';

const Queue: React.FC = () => {
  return (
    <section className="queue">
      <h2>Current Queue</h2>
      <div className="song-list">
        <div className="song-item">
          <img src="/assets/song1.jpg" alt="Album cover" />
          <div className="song-info">
            <p>Count me out</p>
            <p className="artist">Kendrick Lamar</p>
          </div>
          <div className="song-upvotes">(16 upvotes)</div>
          <div className="remove-btn">X</div>
        </div>
        {/* Add more song items similarly */}
      </div>
      <button className="clear-queue">Clear Queue</button>
    </section>
  );
}

export default Queue;
