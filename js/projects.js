//////////////////////
//// ALL PROJECTS ////
//////////////////////

var constantColor = '0000';
var startColor = '00';
var endColor = '00';
var titleMargin = 30;
function init(color1, color2) {
  constantColor = color1.slice(2, 6);
  startColor = color1.slice(0, 2);
  endColor = color2.slice(0, 2);
  console.log('s:' + startColor + ', e:' + endColor + ', c:' + constantColor);
}

function colorMap(start, end, percent) {
  var currentColor = ((end - start) / 100.0) * percent + start;
  return currentColor.toString(16).slice(0,2);
}

function updateColorDefault(newColor) {
  $('body').css('background-color', hexColor);
  $('.projectContent').css('background-color', hexColor);
}

/*
$(window).on('scroll', function() {
  //TODO: set splash image margin based on height of project title?
  if (titleMargin > 0) {
    window.scrollTo(0, 0);
    titleMargin -= .5;
    $('.projectTitle').css('margin-top', titleMargin + '%');
  }

  var s = $(window).scrollTop();
  var d = $(document).height();
  var c = $(window).height();

  var scrollPercent = (s / (d - c)) * 100;
  var finalColor = colorMap(parseInt(startColor, 16), parseInt(endColor, 16), scrollPercent);
  var hexColor = '#' + finalColor + constantColor;

  updateMapColor(hexColor);
});
*/
