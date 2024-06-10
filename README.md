# twitch subonly vod bypass

### Content
This repo contains [the userscript](https://github.com/n-vh/twitch-subonly-vod-bypass/blob/master/yoink.user.js) and the server part that runs on a Cloudflare Worker.

To use this script, you'll need a manager like [Violentmonkey](https://violentmonkey.github.io/) to inject the adequate JavaScript. 
You can also host the wrangler worker on your own Cloudflare if you'd like to.

### Summary
The userscript lets you bypass the subonly VODs on Twitch. It replaces the default Twitch player by a Plyr player to be able to load the video.

The server is mainly used for caching to prevent a high number of request calls to a Twitch API.
