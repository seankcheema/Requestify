import React, { useState, useEffect } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from './UserContext';
import io from 'socket.io-client';
import './MobileActivity.css';
//Sets up imports for MobileActivity and utilizes UserContext rather than DJ

//Sets up IP and socketIO
const ipAddress = process.env.REACT_APP_API_IP;
const socket = io(`http://${ipAddress}:5001`);

//Sets up RequestifyLayout component and sets up variables and hooks
const RequestifyLayout: React.FC = () => {
    const navigate = useNavigate();
    const { djName: paramDJName } = useParams<{ djName: string }>();
    const { scannedDJName, setScannedDJName, scannedDisplayName, setScannedDisplayName } = useUser();
    const [tracks, setTracks] = useState<{ track: string[]; hasUpvoted: boolean; hasDownvoted: boolean }[]>([]);

    //Sets the scanned DJName if it is different from the URL's DJ Name
    useEffect(() => {
        if (paramDJName && scannedDJName !== paramDJName) {
            //console.log("Setting scannedDJName from paramDJName:", paramDJName);
            setScannedDJName(paramDJName);
        }
    }, [paramDJName, scannedDJName, setScannedDJName]);

    //Fetches the displayname of the DJ
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

    //Fetches the track queue of the dj
    const fetchTracks = async () => {
        try {
            const response = await fetch(`http://${ipAddress}:5001/tracks/${scannedDJName}`);

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data: string[][] = await response.json();
            setTracks(data.map(track => ({ track, hasUpvoted: false, hasDownvoted: false })));
        } catch (error) {
            console.error("Failed to fetch tracks:", error);
        }
    };

    useEffect(() => {
        if (scannedDJName) {
            fetchTracks();
        }

        //Listens for SocketIO event of song being removed and removes the track to state
        socket.on('song_removed', (removedSong) => {
            if (removedSong.djName === scannedDJName) {
                setTracks((prevTracks) =>
                    prevTracks.filter((trackObj) =>
                        !(trackObj.track[0] === removedSong.trackName && trackObj.track[1] === removedSong.artist)
                    )
                );
            }
        });

        //Listens for SocketIO event of song being added and adds the track to state
        socket.on('song_added', (newSong) => {
            if (newSong.djName === scannedDJName) {
                setTracks((prevTracks) => [
                    ...prevTracks,
                    { track: [newSong.trackName, newSong.artist, newSong.album, newSong.external_url, newSong.album_cover_url, (newSong.upvotes || 0).toString()], hasUpvoted: false, hasDownvoted: false }
                ]);
            }
        });

        //Listens for SocketIO event of upvote count being updated
        socket.on('upvote_updated', (updatedSong) => {
            setTracks((prevTracks) =>
                prevTracks.map((track) =>
                    track.track[0] === updatedSong.trackName && track.track[1] === updatedSong.artist
                        ? { ...track, upvotes: updatedSong.upvotes }
                        : track
                )
            );
        });

        //Listens for SocketIO event of all songs being removed and sets the tracks state to being empty
        socket.on('all_songs_removed', (djName) => {
            if (djName === scannedDJName) {
                setTracks([]);
            }
        });

        //Makes sure that event listeners are removed when unmounted
        return () => {
            socket.off('song_removed');
            socket.off('song_added');
            socket.off('upvote_updated');
            socket.off('all_songs_removed');
        };
    }, [scannedDJName]);

    //Handles the upvoting status in the tracks state and in backend
    const handleUpvote = async (trackName: string, artist: string, index: number) => {
        try {
            const updatedTracks = [...tracks];

            if (updatedTracks[index].hasUpvoted) {
                await fetch(`http://${ipAddress}:5001/tracks/downvote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ djName: scannedDJName, trackName, artist })
                });
                updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) - 1).toString();
                updatedTracks[index].hasUpvoted = false;
            } else {
                await fetch(`http://${ipAddress}:5001/tracks/upvote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ djName: scannedDJName, trackName, artist })
                });
                updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) + 1).toString();
                updatedTracks[index].hasUpvoted = true;
                updatedTracks[index].hasDownvoted = false;
            }

            setTracks(updatedTracks);
        } catch (error) {
            console.error("Error upvoting:", error);
        }
    };

    //Handles the downvoting status in the tracks state and in backend
    const handleDownvote = async (trackName: string, artist: string, index: number) => {
        try {
            const updatedTracks = [...tracks];

            if (updatedTracks[index].hasDownvoted) {
                await fetch(`http://${ipAddress}:5001/tracks/upvote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ djName: scannedDJName, trackName, artist })
                });
                updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) + 1).toString();
                updatedTracks[index].hasDownvoted = false;
            } else {
                await fetch(`http://${ipAddress}:5001/tracks/downvote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ djName: scannedDJName, trackName, artist })
                });
                updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) - 1).toString();
                updatedTracks[index].hasDownvoted = true;
                updatedTracks[index].hasUpvoted = false;
            }

            setTracks(updatedTracks);
        } catch (error) {
            console.error("Error downvoting:", error);
        }
    };

    //Navigation to DJ homepage
    const goToHome = () => {
        navigate(`/dj/${paramDJName}`);
    };

    //Navigation to payment/tip page
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
                                tracks.map((trackObj, index) => (
                                    <div key={index} className="mobile-song-item">
                                        <img
                                            src={trackObj.track[4]}
                                            alt={`${trackObj.track[2]} cover`}
                                            className="album-cover"
                                        />
                                        <div className="mobile-song-info">
                                            <p className="song-title">{trackObj.track[0]}</p>
                                            <p className="mobile-artist">{trackObj.track[1]}</p>
                                        </div>
                                        <FaArrowUp
                                            className={`mobile-upvote ${trackObj.hasUpvoted ? 'active-upvote' : ''}`}
                                            onClick={() => handleUpvote(trackObj.track[0], trackObj.track[1], index)}
                                        />
                                        <div className="mobile-song-upvotes">{trackObj.track[5]}</div>
                                        <FaArrowDown
                                            className={`mobile-downvote ${trackObj.hasDownvoted ? 'active-downvote' : ''}`}
                                            onClick={() => handleDownvote(trackObj.track[0], trackObj.track[1], index)}
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
