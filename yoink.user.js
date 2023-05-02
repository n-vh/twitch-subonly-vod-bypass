// ==UserScript==
// @name        VOD Yoink
// @version     1.2.2
// @description Yoink sub-only VODs
// @match       https://www.twitch.tv/*
// @require     https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.1.5/hls.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/plyr/3.7.2/plyr.min.js
// @updateURL   https://gist.github.com/n-vh/ebe67c27dc1f21a3125ef7f166944a1d/raw
// @downloadURL https://gist.github.com/n-vh/ebe67c27dc1f21a3125ef7f166944a1d/raw
// ==/UserScript==

'use strict';

const LOCALSTORAGE_KEY = 'yoink:current';
const PATHNAME_REGEX = /\/([A-Z]+)\/([0-9]+)/i;
const WORKER_HOST = 'https://vod.yoink.workers.dev';

class Yoink extends Hls {
  async inject(videoId) {
    this.videoId = videoId;

    const container = document.querySelector('.video-player__container');
    const video = container.appendChild(document.createElement('video'));

    this.hideSubOnlyOverlay();

    const source = await this.request('playlist');

    if (!source) {
      return;
    }

    this.loadSource(source);
    this.attachMedia(video);

    this.once(Hls.Events.MANIFEST_LOADED, (event, manifest) => {
      this.plyr = new Plyr(video, {
        controls: [
          'play',
          'mute',
          'volume',
          'current-time',
          'progress',
          'duration',
          'settings',
          'fullscreen',
        ],
        invertTime: false,
        quality: {
          options: manifest.levels.map((level) => level.height),
          forced: true,
          onChange: (quality) => {
            this.currentLevel = this.levels.map((x) => x.height).indexOf(quality);
          },
        },
      });

      this.plyr.on('timeupdate', () => {
        const currentTime = this.getCurrentTime();

        if (currentTime && Math.floor(video.currentTime) === 0) {
          video.currentTime = currentTime;
        }

        this.setCurrentTime(video.currentTime);
      });

      this.plyr.play();

      this.setPreviews();
    });
  }

  reset() {
    const overlay = document.querySelector('.video-ref');
    overlay?.classList.remove('yoink-hidden');

    this.detachMedia();
    this.plyr?.destroy();
    this.videoId = null;
  }

  hideSubOnlyOverlay() {
    const overlay = document.querySelector('.video-ref');
    overlay?.classList.add('yoink-hidden');
  }

  getCurrentTime() {
    const data = localStorage.getItem(LOCALSTORAGE_KEY);

    if (data) {
      const object = JSON.parse(data);
      return object[this.videoId];
    }
  }

  setCurrentTime(time) {
    const data = localStorage.getItem(LOCALSTORAGE_KEY);
    const parsed = data ? JSON.parse(data) : {};

    const stringified = JSON.stringify({
      ...parsed,
      [this.videoId]: Math.round(time),
    });

    localStorage.setItem(LOCALSTORAGE_KEY, stringified);
  }

  async setPreviews() {
    const source = await this.request('previews');

    if (source) {
      this.plyr.setPreviewThumbnails({
        enabled: true,
        src: source,
      });
    }
  }

  async request(route) {
    try {
      const response = await fetch(`${WORKER_HOST}/${route}/${this.videoId}`);

      if (response.ok) {
        const data = await response.text();

        if (data) {
          const blob = new Blob([data]);
          return URL.createObjectURL(blob);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

function DOMObserver(callback) {
  const observer = new MutationObserver(callback);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer;
}

function onNavigate(callback) {
  let previous;
  let current;

  DOMObserver(() => {
    current = window.location.href;
    const navigate = previous !== current;

    if (navigate) {
      callback(new URL(current));
      previous = current;
    }
  });
}

(() => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/plyr/3.6.2/plyr.css';
  document.head.appendChild(link);

  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `.yoink-hidden { display: none; }`;

  document.head.appendChild(style);

  const yoink = new Yoink({
    maxMaxBufferLength: 30,
    xhrSetup: (xhr, url) => {
      xhr.open('GET', url.replace('unmuted', 'muted'), true);
    },
  });

  let observer;

  onNavigate((url) => {
    observer?.disconnect();
    yoink.reset();

    observer = DOMObserver(() => {
      const hasPlayer = !!document.querySelector('.video-player__container');
      const [match, directory, videoId] = url.pathname.match(PATHNAME_REGEX) || [];

      if (hasPlayer && directory === 'videos') {
        const isSubOnly = document.querySelector('.content-overlay-gate__content');

        if (!!!isSubOnly) {
          return yoink.reset();
        }

        const isInjected = !!yoink.videoId;

        if (videoId && !isInjected) {
          yoink.inject(videoId);
        }
      }
    });
  });
})();
