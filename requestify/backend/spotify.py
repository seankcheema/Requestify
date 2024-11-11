import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)

# Set up Spotify API credentials from environment variables
SPOTIFY_CLIENT_ID = os.getenv('REACT_APP_SPOTIFY_CLIENT_ID')
SPOTIFY_SECRET_CLIENT_ID = os.getenv('REACT_APP_SPOTIFY_SECRET_CLIENT_ID')

if not SPOTIFY_CLIENT_ID or not SPOTIFY_SECRET_CLIENT_ID:
    raise Exception('Spotify client id and secret not found')

#Spotify Client Setup
auth_manager = SpotifyClientCredentials(client_id=SPOTIFY_CLIENT_ID, client_secret=SPOTIFY_SECRET_CLIENT_ID)
spotify = spotipy.Spotify(auth_manager=auth_manager)

def search_song(query):
    results = spotify.search(q=query, type= 'track', limit=1)
    tracks = []
    for track in results['tracks']['items']:
        album_images = track['album']['images']
        album_cover_url = album_images[0]['url'] if album_images else None

        tracks.append({
            'name': track['name'],
            'artist': track['artists'][0]['name'],
            'album': track['album']['name'],
            'external_url': track['external_urls']['spotify'],
            'album_cover_url': album_cover_url
        })
    return tracks
