import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './MobileHome.css';

const Search: React.FC = () => {
    const { djName } = useParams<{ djName: string }>(); // Capture the djName from the URL
    console.log(djName); // Test if the correct value is captured from the URL

    const [tracks, setTracks] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/search`, {
                    params: { query: djName },
                });
                setTracks(response.data);
            } catch (err) {
                setError('Error fetching search results');
                console.error(err);
            }
        };

        fetchSearchResults();
    }, [djName]);

    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Search Results for: {djName}</h1>
            {tracks.length > 0 ? (
                <ul>
                    {tracks.map((track, index) => (
                        <li key={index}>
                            <h3>{track.trackName}</h3>
                            <p>Artist: {track.artist}</p>
                            <p>Album: {track.album}</p>
                            <a href={track.external_url} target="_blank" rel="noopener noreferrer">
                                Listen on Spotify
                            </a>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No results found.</p>
            )}
        </div>
    );
};

export default Search;
