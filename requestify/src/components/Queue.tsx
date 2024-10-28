import React from 'react';
import './Dashboard.css';

const Queue: React.FC = () => {
  return (
    <section className="queue">
      <h2>Current Queue</h2>
      <div className='song-container'>
      <div className="song-list">
        <div className="song-item">
          <img src="/assets/song1.png" alt="Album cover" />
          <div className="song-info">
            <p>Count me out</p>
            <p className="artist">Kendrick Lamar</p>
          </div>
          {/* <img src="/assets/External link.svg" alt="External link" className="external-link" /> */}
          <div className="song-upvotes">(16 upvotes)</div>
          <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
        </div>
        <div className="song-item">
          <img src="/assets/song1.png" alt="Album cover" />
          <div className="song-info">
            <p>Count me out</p>
            <p className="artist">Kendrick Lamar</p>
          </div>
          <div className="song-upvotes">(16 upvotes)</div>
          <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
        </div>
        <div className="song-item">
          <img src="/assets/song1.png" alt="Album cover" />
          <div className="song-info">
            <p>Count me out</p>
            <p className="artist">Kendrick Lamar</p>
          </div>
          <div className="song-upvotes">(16 upvotes)</div>
          <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
        </div>
        <div className="song-item">
          <img src="/assets/song1.png" alt="Album cover" />
          <div className="song-info">
            <p>Count me out</p>
            <p className="artist">Kendrick Lamar</p>
          </div>
          <div className="song-upvotes">(16 upvotes)</div>
          <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
        </div>
        <div className="song-item">
          <img src="/assets/song1.png" alt="Album cover" />
          <div className="song-info">
            <p>Count me out</p>
            <p className="artist">Kendrick Lamar</p>
          </div>
          <div className="song-upvotes">(16 upvotes)</div>
          <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
        </div>
        <div className="song-item">
          <img src="/assets/song1.png" alt="Album cover" />
          <div className="song-info">
            <p>Count me out</p>
            <p className="artist">Kendrick Lamar</p>
          </div>
          <div className="song-upvotes">(16 upvotes)</div>
          <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
        </div>
        <div className="song-item">
          <img src="/assets/song1.png" alt="Album cover" />
          <div className="song-info">
            <p>Count me out</p>
            <p className="artist">Kendrick Lamar</p>
          </div>
          <div className="song-upvotes">(16 upvotes)</div>
          <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
        </div>
        <div className="song-item">
          <img src="/assets/song1.png" alt="Album cover" />
          <div className="song-info">
            <p>Count me out</p>
            <p className="artist">Kendrick Lamar</p>
          </div>
          <div className="song-upvotes">(16 upvotes)</div>
          <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
        </div>
        <div className="song-item">
          <img src="/assets/song1.png" alt="Album cover" />
          <div className="song-info">
            <p>Count me out</p>
            <p className="artist">Kendrick Lamar</p>
          </div>
          <div className="song-upvotes">(16 upvotes)</div>
          <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
        </div>
        <div className="song-item">
          <img src="/assets/song1.png" alt="Album cover" />
          <div className="song-info">
            <p>Count me out</p>
            <p className="artist">Kendrick Lamar</p>
          </div>
          <div className="song-upvotes">(16 upvotes)</div>
          <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
        </div>
      </div>
      </div>
      <button className="clear-queue">Clear Queue</button>
    </section>
  );
}

export default Queue;
