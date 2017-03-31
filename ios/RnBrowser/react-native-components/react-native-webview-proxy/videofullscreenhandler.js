 (function () {
  var scheme = 'videohandler://';
  var videos = document.getElementsByTagName('video');
  for (var i = 0; i < videos.length; i++) {
    videos[i].addEventListener('play', onBeginFullScreen, false);
//  videos[i].addEventListener('onplaying', onEndFullScreen, false);
  }
  function onBeginFullScreen() {
//    window.location.href = scheme + 'video-beginonplaying';
//  window.location.href = "http://www.baidu.com";
//  alert("------");
    userPlayVideo('ider', [7, 21], { hello:'world', js:100 });
  }
//  function onEndFullScreen() {
//    window.location.href = scheme + 'video-endfullscreen';
//    alert("------")
//  }
  
  
  })();
