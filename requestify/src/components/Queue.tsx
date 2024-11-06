import React from 'react';
import { useEffect, useState } from 'react';
import './Dashboard.css';

// Define a type for the props
interface QueueProps {
  djName: string;
}

// Define a type for the track data if you know the structure
interface Track {
  trackName: string;
  artist: string;
  album: string;
  external_url: string;
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
                <img src="/assets/song1.png" alt="Album cover" />
                <div className="song-info">
                  <p>{track[0]}</p> {/* Track name */}
                  <p className="artist">{track[1]}</p> {/* Artist name */}
                </div>
                <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" />
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
