var axonSketch = function ( a ) {

  a.setup = () => {
    var flockWidth = $('.projectContent').width();
    var flockHeight = flockWidth * .67;

    if (flockHeight > window.windowHeight * .9) {
      flockHeight = window.windowHeight * .9;
    }

    var axonCanvas = a.createCanvas(flockWidth, flockHeight);
    axonCanvas.parent('axon-holder');

    a.textFont('Roboto'); 
  }

  a.draw = () => {
    if (baseUnlockedFlag) {
      a.background(bgColor);

      a.fill(255);
      a.stroke(0);
      a.rect(a.width/2 - holdTextBoxWidth/2, a.height/2 - holdTextBoxHeight/2, 
             holdTextBoxWidth, holdTextBoxHeight);
      a.fill(0);
      a.noStroke();
      a.textSize(holdTextBoxTextSize);
      a.textAlign(a.CENTER);
      a.text("Waiting to determine base shape.\nPlease see first sketch.", a.width/2, a.height/2 - holdTextBoxTextSize * .7);
    }
    else {
      a.background(bgColor);
    }
  }
};

let axonP5 = new p5(axonSketch);