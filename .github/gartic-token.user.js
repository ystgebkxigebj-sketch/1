// ==UserScript==
// @name         Gartic.io Token Fetcher (RDP Auto)
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Fetch maximum tokens from Turnstile with auto reload
// @author       You
// @match        *://gartic.io/*
// @match        *://*.gartic.io/*
// @grant        none
// ==/UserScript==
(function () {
    'use strict';
    const TOKEN_INTERVAL = 4000;
    const NUM_IFRAMES = 6;
    const BACKEND_URL = 'https://moonfive.alwaysdata.net/add-token';

    setInterval(() => { location.reload(); }, 30000);

    function sendToken(token) {
        if (typeof token !== 'string' || token.length <= 20) return;
        console.log("Token received:", token);
        fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        }).catch(() => {});
    }

    function createTurnstileFrames() {
        window.addEventListener('message', function(event) {
            if (event.data && typeof event.data === 'string') {
                sendToken(event.data);
            }
        });
        for (let i = 0; i < NUM_IFRAMES; i++) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.sandbox = 'allow-scripts allow-same-origin';
            document.body.appendChild(iframe);
            iframe.srcdoc = `<!DOCTYPE html>
<html><head>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer><\/script>
</head><body>
<div id="cf-turnstile"></div>
<script>
function requestToken() {
    try {
        window.turnstile.render('#cf-turnstile', {
            sitekey: '0x4AAAAAABBPKaIbNwnPEfSo',
            callback: function(token) { parent.postMessage(token, '*'); }
        });
    } catch (e) {}
}
setInterval(requestToken, ${TOKEN_INTERVAL});
setTimeout(requestToken, 200);
<\/script></body></html>`;
        }
    }
    createTurnstileFrames();
})();
