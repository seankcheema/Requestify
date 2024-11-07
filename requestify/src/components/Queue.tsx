import React from 'react';
import { useEffect, useState } from 'react';
import './Dashboard.css';

// Define a type for the props
interface QueueProps {
  djName: string;
}

// Define a type for the track data
interface Track {
  trackName: string;
  artist: string;
  album: string;
  external_url: string;
  album_cover_url: string;
  upvotes: number;
}

const Queue: React.FC<QueueProps> = ({ djName }) => {
  const [tracks, setTracks] = useState<string[][]>([]);

  const fetchTracks = async () => {
    try {
      const response = await fetch(`http://localhost:5001/tracks/${djName}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: string[][] = await response.json();
      setTracks(data);
    } catch (error) {
      console.error("Failed to fetch tracks:", error);
    }
  };

  const removeTrack = async (trackName: string, artist: string) => {
    try {
      const response = await fetch(`http://localhost:5001/tracks/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ djName, trackName, artist })
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    setTracks(tracks.filter(track => track[0] !== trackName && track[1] !== artist));
    } 
    catch (error) {
      console.error("Failed to remove track:", error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTracks();

    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchTracks();
    }, 5000); // Fetch every 5 seconds (adjust as needed)

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, [djName]);

  return (
    <section className="queue">
      <h2>Current Queue</h2>
      <div className="song-container">
        <div className="song-list">
          {tracks.length > 0 ? (
            tracks.map((track, index) => (
              <div key={index} className="song-item">
                <img src={track[4]} alt={`${track[2]} cover`} className="album-cover" />
                <div className="song-info">
                  <p>{track[0]}</p> {/* Track name */}
                  <p className="artist">{track[1]}</p> {/* Artist name */}
                </div>
                <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" onClick={() => removeTrack(track[0], track[1])}/>
              </div>
            ))
          ) : (
            <p>No tracks in the queue.</p>
          )}
        </div>
      </div>
      <button className="clear-queue">Clear Queue</button>
    </section>
  );
};


// const Queue: React.FC = () => {
//   return (
//     <section className="queue">
//       <h2>Current Queue</h2>
//       <div className='song-container'>
//       <div className="song-list">
//         <div className="song-item">
//           <img src="/assets/song1.png" alt="Album cover" />
//           <div className="song-info">
//             <p>Count me out</p>
//             <p className="artist">Kendrick Lamar</p>
//           </div>
//           {/* <img src="/assets/External link.svg" alt="External link" className="external-link" /> */}
//           <div className="song-upvotes">(16 upvotes)</div>
//           <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
//         </div>
//         <div className="song-item">
//           <img src="/assets/song1.png" alt="Album cover" />
//           <div className="song-info">
//             <p>Count me out</p>
//             <p className="artist">Kendrick Lamar</p>
//           </div>
//           <div className="song-upvotes">(16 upvotes)</div>
//           <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
//         </div>
//         <div className="song-item">
//           <img src="/assets/song1.png" alt="Album cover" />
//           <div className="song-info">
//             <p>Count me out</p>
//             <p className="artist">Kendrick Lamar</p>
//           </div>
//           <div className="song-upvotes">(16 upvotes)</div>
//           <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
//         </div>
//         <div className="song-item">
//           <img src="/assets/song1.png" alt="Album cover" />
//           <div className="song-info">
//             <p>Count me out</p>
//             <p className="artist">Kendrick Lamar</p>
//           </div>
//           <div className="song-upvotes">(16 upvotes)</div>
//           <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
//         </div>
//         <div className="song-item">
//           <img src="/assets/song1.png" alt="Album cover" />
//           <div className="song-info">
//             <p>Count me out</p>
//             <p className="artist">Kendrick Lamar</p>
//           </div>
//           <div className="song-upvotes">(16 upvotes)</div>
//           <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
//         </div>
//         <div className="song-item">
//           <img src="/assets/song1.png" alt="Album cover" />
//           <div className="song-info">
//             <p>Count me out</p>
//             <p className="artist">Kendrick Lamar</p>
//           </div>
//           <div className="song-upvotes">(16 upvotes)</div>
//           <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
//         </div>
//         <div className="song-item">
//           <img src="/assets/song1.png" alt="Album cover" />
//           <div className="song-info">
//             <p>Count me out</p>
//             <p className="artist">Kendrick Lamar</p>
//           </div>
//           <div className="song-upvotes">(16 upvotes)</div>
//           <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
//         </div>
//         <div className="song-item">
//           <img src="/assets/song1.png" alt="Album cover" />
//           <div className="song-info">
//             <p>Count me out</p>
//             <p className="artist">Kendrick Lamar</p>
//           </div>
//           <div className="song-upvotes">(16 upvotes)</div>
//           <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
//         </div>
//         <div className="song-item">
//           <img src="/assets/song1.png" alt="Album cover" />
//           <div className="song-info">
//             <p>Count me out</p>
//             <p className="artist">Kendrick Lamar</p>
//           </div>
//           <div className="song-upvotes">(16 upvotes)</div>
//           <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
//         </div>
//         <div className="song-item">
//           <img src="/assets/song1.png" alt="Album cover" />
//           <div className="song-info">
//             <p>Count me out</p>
//             <p className="artist">Kendrick Lamar</p>
//           </div>
//           <div className="song-upvotes">(16 upvotes)</div>
//           <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
//         </div>
//       </div>
//       </div>
//       <button className="clear-queue">Clear Queue</button>
//     </section>
//   );
// }

export default Queue;
