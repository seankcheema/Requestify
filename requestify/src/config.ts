import { io } from 'socket.io-client';

// Where the two backends live. CRA inlines these at build time.
// - Docker / cloud: REACT_APP_API_URL=/api and REACT_APP_WEB_URL=/ (same origin, routed by the reverse proxy)
// - Local start.bat: unset, so they fall back to http://<REACT_APP_API_IP>:5001 (Flask) and :5000 (Node)
const ip = process.env.REACT_APP_API_IP;
const resolve = (url: string) => new URL(url, window.location.origin);
const trimSlash = (url: string) => url.replace(/\/$/, '');

// Flask API (REST + song/tip socket events)
export const API_URL = trimSlash(process.env.REACT_APP_API_URL || `http://${ip}:5001`);

// Node server (serves the frontend + DJ message socket), always absolute so it can be shown/encoded in QR links
export const WEB_URL = trimSlash(resolve(process.env.REACT_APP_WEB_URL || `http://${ip}:5000`).href);

// socket.io-client treats a URL path as a namespace, so a base path like "/api"
// has to be passed as the transport path instead
export const connectSocket = (base: string) => {
    const url = resolve(base);
    return io(url.origin, { path: `${trimSlash(url.pathname)}/socket.io` });
};
