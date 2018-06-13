var file = null;
var x1 = null;
var x2 = null;
var y1 = null;
var y2 = null;
var minX = null;
var minY = null;

function dodrop(event) {
  var dt = event.dataTransfer;
  var files = dt.files;

  if (files.length == 0) {
    console.log("0 photos dropped, probably working on a photo");
  } else {
    event.stopPropagation();
    event.preventDefault();
    if (files.length > 1) {
      alert("Only 1 photo is allowed at time...");
    } else {
      console.log(event);
      file = files[0]
      console.log(file);
      console.log(file.name);
      var reader = new FileReader();
      reader.onload = (function (e) {
        $("#picture").attr('src', e.target.result).css('display', 'block');
      });
      reader.readAsDataURL(file);
    }
  }
}

function startSelection(event) {
  x1 = event.offsetX;
  y1 = event.offsetY;
  // x, y are from top left
}

function continueSelection(event) {
  x2 = event.offsetX;
  y2 = event.offsetY;
  minX = Math.min(x1, x2);
  var maxX = Math.max(x1, x2);
  minY = Math.min(y1, y2);
  var maxY = Math.max(y1, y2);
  var width = maxX - minX;
  var height = maxY - minY;
  $("#selection").css('top', minY).css('left', minX).css('width', width).css('height', height);
}

function stopSelection(event) {
  console.log("stopSelection");
  if (file == null) {
    // just dropping file
  } else {
    continueSelection(event);

    var upscale = "";
    var origWidth = $('#picture')[0].naturalWidth;
    var origWidth = 20000;
    var origHeight = $('#picture')[0].naturalHeight;
    var origHeight = 10000 * $('#picture')[0].naturalHeight / $('#picture')[0].naturalWidth;
    if (origWidth != $('#picture')[0].naturalWidth) {
      upscale = "scale=" + origWidth + ":-1,";
    }
    var fps = 25;
    var durationStillStart = 2; // seconds the picture is zoomed at the start
    var durationZoomout = 6; // seconds the effect take place
    var durationStillEnd = 2; // seconds the picture is unzoomed at the end
    var totalDuration = durationStillStart + durationZoomout + durationStillEnd; // seconds
    var framesZoomout = fps * durationZoomout;
    var framesStillStart = fps * durationStillStart;
    var framesStillEnd = fps * durationStillEnd;
    var totalFrames = framesStillStart + framesZoomout;
    var zoomX = $('#picture').width() / $('#selection').width();
    var zoomY = $('#picture').height() / $('#selection').height();
    var startZoom = Math.min(zoomX, zoomY).toFixed(3);
    var origMinX = (minX * origWidth / $('#picture')[0].width).toFixed(0);
    var origMinY = (minY * origHeight / $('#picture')[0].height).toFixed(0);

    var on1 = "((on-" + framesStillStart + ")/" + framesZoomout + ")"; // on1 is from 0 to 1 during zoomout phase
    // var onZoomoutEasing = "if(lt(" + on1 + ",0.5),2*" + on1 + "*" + on1 + ",1.05-(1-" + on1 + "*" + on1 + ")*(1-" + on1 + "*" + on1 + "))";
    var onZoomoutEasing = "1/(1+exp(8-16*" + on1 + "))";
    var on = framesZoomout + "*if(lt(" + on1 + ",0),0,if(gt(" + on1 + ",1),1," + onZoomoutEasing + "))";
    // var on = framesZoomout + "*if(lt(" + on1 + ",0),0,if(gt(" + on1 + ",1),1," + on1 + "))";

    var zoompanZ = "'" + startZoom + "*" + framesZoomout + "/(" + on + "*(" + startZoom + "-1)+" + framesZoomout + ")'";
    var zoompanX = "'" + origMinX + "*(" + framesZoomout + "-" + on + ")/" + framesZoomout + "'";
    var zoompanY = "'" + origMinY + "*(" + framesZoomout + "-" + on + ")/" + framesZoomout + "'";
    var output = "ffmpeg -loop 1 -i \"" + file.name + "\" -vf \"" + upscale + "zoompan=z=" + zoompanZ + ":x=" + zoompanX + ":y=" + zoompanY + ":d=" + totalFrames + "\" -c:v libx264 -t " + totalDuration + " /home/miso/svadba/prezentacia/" + file.name + "_zoomout.mp4";
    console.log(output)
    $("#output").text(output);
    window.getSelection().selectAllChildren( $("#output")[0] );
    try {
      navigator.clipboard.writeText(output).then(function() {
        $('#message').text('Command copied').show().fadeOut(3000);
      })
    } catch (err) {
      alert('Oops, unable to copy');
    }
  }
}
