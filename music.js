(() => {
  'use strict';

  // Native controls work without JavaScript. This enhancement only prevents
  // two performance clips from playing over one another.
  const players = [...document.querySelectorAll('.music-page video.music-video')];
  players.forEach((player) => {
    player.addEventListener('play', () => {
      players.forEach((other) => {
        if (other !== player && !other.paused) other.pause();
      });
    });
  });
})();
