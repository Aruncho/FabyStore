document.addEventListener("DOMContentLoaded", function () {
    // Seleccionamos el video por su ID
    var video1 = document.getElementById("miVideoFondo");
    if (video1) {
      video1.playbackRate = 1.0;
      video1.muted = true; // Forzar mute explícito para iOS

      var playPromise1 = video1.play();
      if (playPromise1 !== undefined) {
        playPromise1.catch(function (error) {
          console.log("Autoplay prevenido por el navegador en miVideoFondo:", error);
        });
      }
    }

    var video2 = document.getElementById("videoTendencias");
    if (video2) {
      video2.muted = true; // Forzar mute explícito para iOS
      var playPromise2 = video2.play();
      if (playPromise2 !== undefined) {
        playPromise2.catch(function (error) {
          console.log("Autoplay prevenido por el navegador en videoTendencias:", error);
        });
      }
    }
});
