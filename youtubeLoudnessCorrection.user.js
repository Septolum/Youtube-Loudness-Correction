// ==UserScript==
// @name           Youtube Loudness Correction
// @description    Amplifies any youtube video with loudness lower than 0dB
// @namespace      Septolum
// @include        https://www.youtube.com/*
// @include        https://m.youtube.com/*
// @icon           https://www.youtube.com/favicon.ico
// @version        1.0
// @grant          none
// @run-at         idle
// ==/UserScript==

// I created this script because Youtube does not amplify quiet videos, it only quietens loud ones

// from: https://stackoverflow.com/a/18997637
setInterval(function () {
  if (this.lastHrefStr !== location.href || this.lastHrefStr === null) {
    this.lastHrefStr = location.href;
    console.log("page change");
    gmMain();
  }
}, 111);

function gmMain() {
  "use strict";

  //from: https://github.com/ytdl-org/youtube-dl/blob/c9595ee78027ecf6bedbdc33c690228fa7d3a5bb/youtube_dl/extractor/youtube.py#L1437

  var req = new XMLHttpRequest();
  req.open(
    "GET",
    "https://www.youtube.com/watch?v=" +
      /v=(.+?)(?:(?:&.*?)|$)/.exec(window.location.href)[1],
    false
  );
  req.send(null);
  if (req.status == 200) {
    var loudness = JSON.parse(
      JSON.parse(
        /;ytplayer\.config\s*=\s*({.+?});ytplayer/.exec(req.responseText)[1]
      ).args.player_response
    ).playerConfig.audioConfig.loudnessDb;
  }

  if (loudness < 0) {
    console.log("Loudness Corrected");
    loudness = 10 ** ((loudness * -1) / 20);
    // from https://stackoverflow.com/questions/43794356/html5-volume-increase-past-100#comment99251398_43794379
    if (window["_gainNode"]) {
      window["_gainNode"].gain.value = loudness;
      return;
    }
    var v = document.querySelector("video");
    var audioCtx = new AudioContext();
    var source = audioCtx.createMediaElementSource(v);
    var gainNode = audioCtx.createGain();
    gainNode.gain.value = loudness;
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    window["_gainNode"] = gainNode;
  } else {
    if (window["_gainNode"]) {
      console.log("Loudness Reset");
      window["_gainNode"].gain.value = 1;
      return;
    }
  }
}