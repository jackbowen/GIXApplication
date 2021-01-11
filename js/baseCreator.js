var baseCreatorSketch = function( bc ) {
  //window.bcp5 = new p5();
  //new p5();

  let gui;
  let guiFont;
  let xSlider;
  let ySlider;
  let wiggleSlider;

  var points = [];

  var noiseX = 0.0;
  var noiseXInc = .01; // How squiggly is the shape
  var noiseY = 0.0;
  var noiseYInc = .002; // How quickly does the shape change

  var bgColor = '#FF7C7B';
  var steelColor = '#B4D0DE';

  var scaleFactor = 20;
  var axisToOffset;

  var axisLabelSize;

  var guiInc = 70;
  var sliderX = 15;
  var xSliderY = 30;
  var ySliderY = xSliderY + guiInc;
  var wiggleSliderY = ySliderY + guiInc;

  bc.preload = () => {
  
  }

  bc.setup = () => {
    var baseCreatorWidth = $('.projectContent').width();
    var baseCreatorHeight = baseCreatorWidth * .67;

    if (baseCreatorHeight > window.windowWidth * .9) {
      baseCreatorHeight = window.windowWidth * .9;
    }

    var baseCreatorCanvas = bc.createCanvas(baseCreatorWidth, baseCreatorHeight);
    baseCreatorCanvas.parent('base-creator-holder');

    gui = this.createGui();

    var sliderWidth = 128;
    var sliderHeight = 32;
    xSlider = this.createSlider("width", sliderX, xSliderY, sliderWidth, sliderHeight, 6, 40);
    ySlider = this.createSlider("height", sliderX, ySliderY, sliderWidth, sliderHeight, 6, 30);
    wiggleSlider = this.createSlider("wiggle", sliderX, wiggleSliderY, sliderWidth, sliderHeight, sqrt(1000), sqrt(5)); 

    var scaleMargin = .9;
    var xScale = (width / (2*xSlider.max)) * scaleMargin;
    var yScale = (height / (2*ySlider.max)) * scaleMargin;

    //scaleFactor = xScale < yScale ? xScale : yScale;
    if (xScale < yScale) {
      scaleFactor = xScale;
      axisToOffset = 'y';
    }
    else {
      scaleFactor = yScale;
      axisToOffset = 'x';
    }

    //textFont(guiFont);
    bc.textFont('Arial');
    axisLabelSize = bc.width/50;
    if (axisLabelSize < 12) {
      axisLabelSize = 12;
    }
    bc.textSize(axisLabelSize);
    console.log(gui);
  }


  function generateBase() {
    var origin = {x: width/2, y: height/2};
    var numPoints = 30;
    var degInc = 360.0 / numPoints;

    var xRefRadius = xSlider.val * scaleFactor;
    var yRefRadius = ySlider.val * scaleFactor;
    var refRadius = 300;
    noiseX = 0.1;
    noiseY += noiseYInc;
    var smoothFactor = 20;
  
    for (var i = 0; i < numPoints; i++) {
      var deg = i * degInc;
      var radians = deg * PI / 180.0;

      var tempRefRadius = (xRefRadius * yRefRadius) / bc.sqrt(xRefRadius * xRefRadius * bc.sin(radians) * bc.sin(radians) + yRefRadius * yRefRadius * bc.cos(radians) * bc.cos(radians));
      var tempMinRadius = tempRefRadius * .6;
      var radiusOffset = tempRefRadius - tempMinRadius;
      var tempRadius = tempMinRadius + radiusOffset * bc.noise(deg * noiseX / smoothFactor, noiseY);
      //noiseX += noiseXInc;
      //console.log(1 / (wiggleSlider.val * wiggleSlider.val));
      noiseX += 1 / (wiggleSlider.val * wiggleSlider.val);
    
      var xPos = tempRadius * bc.cos(radians);
      var yPos = tempRadius * bc.sin(radians);   
      points[i] = bc.createVector(xPos, yPos);
    }

    points[numPoints] = points[0];
    points[numPoints + 1] = points[1];
    points[numPoints + 2] = points[2];
  }


  function drawBase() {
    bc.push();
    bc.translate(width/2, height/2);
    bc.fill(steelColor);
    bc.beginShape();
    for (var i = 0; i < points.length; i++) {
      bc.curveVertex(points[i].x, points[i].y);
    }  
    bc.endShape();
    bc.pop();
  }


  function drawGuiLabels() {
    var guiLabelSize = 15;
    bc.textSize(guiLabelSize);
    bc.text("Width", sliderX, xSliderY - guiLabelSize/3);
    bc.text("Height", sliderX, ySliderY - guiLabelSize/3);
    bc.text("Wiggliness", sliderX, wiggleSliderY - guiLabelSize/3);
  }


  function drawAxes() {
    var offset = scaleFactor;
    var arrowLen = scaleFactor * 1.5;

    bc.push();
    bc.translate(width/2, height/2);

    // Draw the x axis
    var xAxisStart = {x: -xSlider.val * scaleFactor, y: ySlider.val * scaleFactor};
    var xAxisEnd = {x: xSlider.val * scaleFactor, y: ySlider.val * scaleFactor};
    if (axisToOffset == 'x') {
      xAxisStart.y += offset;
      xAxisEnd.y += offset;
    }
    bc.line(xAxisStart.x, xAxisStart.y, xAxisEnd.x, xAxisEnd.y);

    // Draw the x axis arrows
    bc.line(xAxisStart.x, xAxisStart.y, xAxisStart.x + arrowLen, xAxisStart.y - arrowLen);
    bc.line(xAxisStart.x, xAxisStart.y, xAxisStart.x + arrowLen, xAxisStart.y + arrowLen);
    bc.line(xAxisEnd.x, xAxisEnd.y, xAxisEnd.x - arrowLen, xAxisEnd.y - arrowLen);
    bc.line(xAxisEnd.x, xAxisEnd.y, xAxisEnd.x - arrowLen, xAxisEnd.y + arrowLen);



    var yAxisStart = {x: xSlider.val * scaleFactor, y: -ySlider.val * scaleFactor};
    var yAxisEnd = {x: xSlider.val * scaleFactor, y: ySlider.val * scaleFactor};
    if (axisToOffset == 'y') {
      yAxisStart.x += offset;
      yAxisEnd.x += offset;
    }
    bc.line(yAxisStart.x, yAxisStart.y, yAxisEnd.x, yAxisEnd.y);

    // Draw the y axis arrows
    bc.line(yAxisStart.x, yAxisStart.y, yAxisStart.x - arrowLen, yAxisStart.y + arrowLen);
    bc.line(yAxisStart.x, yAxisStart.y, yAxisStart.x + arrowLen, yAxisStart.y + arrowLen);
    bc.line(yAxisEnd.x, yAxisEnd.y, yAxisEnd.x - arrowLen, yAxisEnd.y - arrowLen);
    bc.line(yAxisEnd.x, yAxisEnd.y, yAxisEnd.x + arrowLen, yAxisEnd.y - arrowLen);

    // Label axes
    bc.textAlign(CENTER);
    bc.text(xSlider.val.toFixed(1) + '\"', 0, xAxisEnd.y + axisLabelSize);
    bc.textAlign(LEFT);
    bc.text(ySlider.val.toFixed(1) + '\"', xAxisEnd.x + axisLabelSize/8, axisLabelSize/2);

    bc.pop();
  }


  bc.draw = () => {
    bc.background(bgColor);
    generateBase();
    drawBase();
    drawGuiLabels();
    drawAxes();
    this.drawGui();
  }

};

let baseCreatorP5 = new p5(baseCreatorSketch);