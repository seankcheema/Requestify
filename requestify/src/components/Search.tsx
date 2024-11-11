// Search.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDJ } from './DJContext';
import './MobileHome.css';

const Search: React.FC = () => {
    const { djName } = useParams<{ djName: string }>();
    const { setDJName } = useDJ();
    const navigate = useNavigate();
    const [tracks, setTracks] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const ipAddress = process.env.REACT_APP_API_IP;

    useEffect(() => {
        if (djName) {
            setDJName(djName); // Set djName in context
            console.log("Setting djName in context and redirecting to /0:", djName); // Debug
            navigate('/0'); // Redirect to MobileHome after setting djName
        }

        const fetchSearchResults = async () => {
            try {
                const response = await axios.get(`http://${ipAddress}:5001/search`, {
                    params: { query: djName },
                });
                setTracks(response.data);
            } catch (err) {
                setError('Error fetching search results');
                console.error(err);
            }
        };

        fetchSearchResults();
    }, [djName, setDJName, navigate]);

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
