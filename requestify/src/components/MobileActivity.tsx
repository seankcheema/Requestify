import React, { useState, useEffect } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from './UserContext';
import io from 'socket.io-client';
import './MobileActivity.css';

const ipAddress = process.env.REACT_APP_API_IP;
const socket = io(`http://${ipAddress}:5001`);

const RequestifyLayout: React.FC = () => {
    const navigate = useNavigate();
    const { djName: paramDJName } = useParams<{ djName: string }>();
    const { scannedDJName, setScannedDJName, scannedDisplayName, setScannedDisplayName } = useUser();
    const [tracks, setTracks] = useState<{ track: string[]; hasUpvoted: boolean; hasDownvoted: boolean }[]>([]);

    // Function to generate a unique key for each song
    const generateTrackKey = (trackName: string, artist: string) => `${scannedDJName}_${trackName}_${artist}`;

    // Function to get vote state from localStorage
    const getVoteState = (trackKey: string) => {
        const state = localStorage.getItem(trackKey);
        if (state) {
            return JSON.parse(state);
        }
        return { hasUpvoted: false, hasDownvoted: false };
    };

    // Function to set vote state in localStorage
    const setVoteState = (trackKey: string, hasUpvoted: boolean, hasDownvoted: boolean) => {
        localStorage.setItem(trackKey, JSON.stringify({ hasUpvoted, hasDownvoted }));
    };

    useEffect(() => {
        if (paramDJName && scannedDJName !== paramDJName) {
            setScannedDJName(paramDJName);
        }
    }, [paramDJName, scannedDJName, setScannedDJName]);

    useEffect(() => {
        const fetchDisplayName = async () => {
            try {
                const response = await fetch(`http://${ipAddress}:5001/dj/displayName/${scannedDJName}`);
                if (response.ok) {
                    const data = await response.json();
                    setScannedDisplayName(data.displayName);
                } else {
                    console.error('Failed to fetch display name');
                }
            } catch (error) {
                console.error('Error fetching display name:', error);
            }
        };

        if (scannedDJName) {
            fetchDisplayName();
        }
    }, [scannedDJName, setScannedDisplayName]);

    const fetchTracks = async () => {
        try {
            const response = await fetch(`http://${ipAddress}:5001/tracks/${scannedDJName}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data: string[][] = await response.json();
            setTracks(
                data.map(track => {
                    const trackKey = generateTrackKey(track[0], track[1]);
                    const { hasUpvoted, hasDownvoted } = getVoteState(trackKey);
                    return { track, hasUpvoted, hasDownvoted };
                })
            );
        } catch (error) {
            console.error("Failed to fetch tracks:", error);
        }
    };

    useEffect(() => {
        if (scannedDJName) {
            fetchTracks();
        }

        socket.on('song_removed', (removedSong) => {
            if (removedSong.djName === scannedDJName) {
                setTracks((prevTracks) => {
                    const updatedTracks = prevTracks.filter((trackObj) => {
                        const isMatch = trackObj.track[0] === removedSong.trackName && trackObj.track[1] === removedSong.artist;
                        if (isMatch) {
                            // Remove the corresponding song from localStorage
                            const trackKey = generateTrackKey(trackObj.track[0], trackObj.track[1]);
                            localStorage.removeItem(trackKey);
                        }
                        return !isMatch; // Keep only non-matching tracks
                    });
                    return updatedTracks;
                });
            }
        });

        socket.on('song_added', (newSong) => {
            if (newSong.djName === scannedDJName) {
                const trackKey = generateTrackKey(newSong.trackName, newSong.artist);
                const { hasUpvoted, hasDownvoted } = getVoteState(trackKey);
                setTracks((prevTracks) => [
                    ...prevTracks,
                    { track: [newSong.trackName, newSong.artist, newSong.album, newSong.external_url, newSong.album_cover_url, (newSong.upvotes || 0).toString()], hasUpvoted, hasDownvoted }
                ]);
            }
        });

        socket.on('upvote_updated', (updatedSong) => {
            setTracks((prevTracks) =>
                prevTracks.map((track) =>
                    track.track[0] === updatedSong.trackName && track.track[1] === updatedSong.artist
                        ? { ...track, track: [...track.track.slice(0, 5), updatedSong.upvotes.toString()] }
                        : track
                )
            );
        });

        socket.on('all_songs_removed', (removeAllData) => {
            if (removeAllData.djName === paramDJName) {
                setTracks((prevTracks) => {
                    // Remove all cached tracks from localStorage
                    prevTracks.forEach((trackObj) => {
                        const trackKey = generateTrackKey(trackObj.track[0], trackObj.track[1]);
                        localStorage.removeItem(trackKey);
                    });
                    return []; // Clear the state
                });
            }
        });
        
        return () => {
            socket.off('song_removed');
            socket.off('song_added');
            socket.off('upvote_updated');
            socket.off('all_songs_removed');
        };
    }, [scannedDJName]);

    const handleUpvote = async (trackName: string, artist: string, index: number) => {
        try {
            const updatedTracks = [...tracks];
            const trackKey = generateTrackKey(trackName, artist);

            if (updatedTracks[index].hasUpvoted) {
                await fetch(`http://${ipAddress}:5001/tracks/downvote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ djName: scannedDJName, trackName, artist })
                });
                updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) - 1).toString();
                updatedTracks[index].hasUpvoted = false;
            } 
            else if (updatedTracks[index].hasDownvoted) {
                await fetch(`http://${ipAddress}:5001/tracks/double-upvote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ djName: scannedDJName, trackName, artist })
                });
                updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) + 2).toString();
                updatedTracks[index].hasUpvoted = true;
                updatedTracks[index].hasDownvoted = false;
            }
            else {
                await fetch(`http://${ipAddress}:5001/tracks/upvote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ djName: scannedDJName, trackName, artist })
                });
                updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) + 1).toString();
                updatedTracks[index].hasUpvoted = true;
                updatedTracks[index].hasDownvoted = false;
            }

            setVoteState(trackKey, updatedTracks[index].hasUpvoted, updatedTracks[index].hasDownvoted);
            setTracks(updatedTracks);
        } catch (error) {
            console.error("Error upvoting:", error);
        }
    };

    const handleDownvote = async (trackName: string, artist: string, index: number) => {
        try {
            const updatedTracks = [...tracks];
            const trackKey = generateTrackKey(trackName, artist);

            if (updatedTracks[index].hasDownvoted) {
                await fetch(`http://${ipAddress}:5001/tracks/upvote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ djName: scannedDJName, trackName, artist })
                });
                updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) + 1).toString();
                updatedTracks[index].hasDownvoted = false;
            } 
            else if (updatedTracks[index].hasUpvoted) {
                await fetch(`http://${ipAddress}:5001/tracks/double-downvote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ djName: scannedDJName, trackName, artist })
                });
                updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) - 2).toString();
                updatedTracks[index].hasUpvoted = false;
                updatedTracks[index].hasDownvoted = true;
            }
            else {
                await fetch(`http://${ipAddress}:5001/tracks/downvote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ djName: scannedDJName, trackName, artist })
                });
                updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) - 1).toString();
                updatedTracks[index].hasDownvoted = true;
                updatedTracks[index].hasUpvoted = false;
            }

            setVoteState(trackKey, updatedTracks[index].hasUpvoted, updatedTracks[index].hasDownvoted);
            setTracks(updatedTracks);
        } catch (error) {
            console.error("Error downvoting:", error);
        }
    };

    const goToHome = () => {
        navigate(`/dj/${paramDJName}`);
    };

    const goToPayment = () => {
        navigate(`/dj/${paramDJName}/payment`);
    };

    //Displays the mobile activity page, notifications, buttons, icons, song queue, and other
    //stuff associated with it
    return (
        <div className="mobile-container">
            <header className="mobile-header">
                <div className="header-title">
                    <img
                        src="/assets/requestify-logo.svg"
                        alt="Requestify Logo"
                        className="mobile-header-logo"
                        onClick={goToHome}
                    />
                </div>
            </header>

            <FaBell className="bell-icon" onClick={() => navigate(`/dj/${paramDJName}/message`)} />

            <main className="mobile-content">
                <section className="mobile-queue">
                    <h2>Current Queue for {scannedDisplayName || scannedDJName}</h2>
                    <div className="mobile-song-container">
                        <div className="mobile-song-list">
                            {tracks.length > 0 ? (
                                tracks.map(({ track, hasUpvoted, hasDownvoted }, index) => (
                                    <div key={`${track[0]}_${track[1]}`} className="mobile-song-item">
                                        <img src={track[4]} alt="Album Cover" className="album-cover" />
                                        <div className="mobile-song-info">
                                            <p className="song-title">{track[0]}</p>
                                            <p className="mobile-artist">{track[1]}</p>
                                        </div>
                                        <FaArrowUp
                                            className={`mobile-upvote ${hasUpvoted ? 'active-upvote' : ''}`}
                                            onClick={() => handleUpvote(track[0], track[1], index)}
                                        />
                                        <div className="mobile-song-upvotes">{track[5]}</div>
                                        <FaArrowDown
                                            className={`mobile-downvote ${hasDownvoted ? 'active-downvote' : ''}`}
                                            onClick={() => handleDownvote(track[0], track[1], index)}
                                        />
                                    </div>
                                ))
                            ) : (
                                <p>No tracks in the queue.</p>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="mobile-footer">
                <nav className="bottom-nav">
                    <div className="nav-item" onClick={goToHome}>
                        <FaHome />
                        <span>Home</span>
                    </div>
                    <div className="nav-item active">
                        <FaChartLine />
                        <span>Activity</span>
                    </div>
                    <div className="nav-item" onClick={goToPayment}>
                        <FaDollarSign />
                        <span>Payment</span>
                    </div>
                </nav>
            </footer>
        </div>
    );
    
};

    


export default RequestifyLayout;

