var flockSketch = function ( f ) {
  preload = () => {
  }

  setup = () => {
    var flockWidth = $('.projectContent').width();
    var flockHeight = flockWidth * .67;

    if (flockHeight > window.windowWidth * .9) {
      flockHeight = window.windowWidth * .9;
    }

    var flockCanvas = createCanvas(flockWidth, flockHeight);
    flockCanvas.parent('flock-holder');
  }

  draw = () => {
    background(255, 125, 0);
  }
};

var flockSketchP5 = new p5(flockSketch);