var bgColor = '#FF7C7B';
var steelColor = '#B4D0DE'; 

var baseCreatorSketch = function( bc ) {
  //window.bcp5 = new p5();
  //new p5();

  //let gui;
  let guiFont;
  let xSlider;
  let ySlider;
  let wiggleSlider;
  let lockButton;

  var sliderWidth = 180;
  var sliderHeight = 32;
  var sliderX = 15;
  var xSliderY = 15;
  var guiInc = sliderHeight + xSliderY;
  var ySliderY = xSliderY + guiInc;
  var wiggleSliderY = ySliderY + guiInc;
  var lockButtonY = wiggleSliderY + guiInc;

  var points = [];

  var noiseX = 0.0;
  var noiseXInc = .01; // How squiggly is the shape
  var noiseY = 0.0;
  var noiseYInc = .002; // How quickly does the shape change

  //var bgColor = '#FF7C7B';
  //var steelColor = '#B4D0DE';

  var scaleFactor = 20;
  var axisToOffset;

  var axisLabelSize;

  var unlockedFlag = true;

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

    //gui = this.createGui();

    //var sliderWidth = 128;
    //var sliderHeight = 32;
    //xSlider = this.createSlider("width", sliderX, xSliderY, sliderWidth, sliderHeight, 6, 40);
    //ySlider = this.createSlider("height", sliderX, ySliderY, sliderWidth, sliderHeight, 6, 30);
    //wiggleSlider = this.createSlider("wiggle", sliderX, wiggleSliderY, sliderWidth, sliderHeight, sqrt(1000), sqrt(5)); 
    xSlider = createSlider("width", sliderX, xSliderY, 6, 40);
    ySlider = createSlider("height", sliderX, ySliderY, 6, 30);
    wiggleSlider = createSlider("wiggle", sliderX, wiggleSliderY, bc.sqrt(1000), bc.sqrt(5)); 
    lockButton = createButton("lockBase", sliderX, lockButtonY);

    var scaleMargin = .9;
    //var xScale = (width / (2*xSlider.max)) * scaleMargin;
    //var yScale = (height / (2*ySlider.max)) * scaleMargin;
    var xScale = (bc.width / (2*xSlider.maxVal)) * scaleMargin;
    var yScale = (bc.height / (2*ySlider.maxVal)) * scaleMargin;

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
    bc.textFont('Arial'); // TODO: some google fonts stuff
    axisLabelSize = bc.width/50;
    if (axisLabelSize < 12) {
      axisLabelSize = 12;
    }
    bc.textSize(axisLabelSize);
  }


  function generateBase() {
    var origin = {x: bc.width/2, y: bc.height/2};
    var numPoints = 30;
    var degInc = 360.0 / numPoints;

    //var xRefRadius = xSlider.val * scaleFactor;
    //var yRefRadius = ySlider.val * scaleFactor;
    var xRefRadius = xSlider.currentVal * scaleFactor;
    var yRefRadius = ySlider.currentVal * scaleFactor;
    //var refRadius = 300;
    noiseX = 0.0;
    noiseY += noiseYInc;
    var smoothFactor = 20;
  
    for (var i = 0; i < numPoints; i++) {
      var deg = i * degInc;
      var radians = deg * bc.PI / 180.0;

      var tempRefRadius = (xRefRadius * yRefRadius) / bc.sqrt(xRefRadius * xRefRadius * bc.sin(radians) * bc.sin(radians) + yRefRadius * yRefRadius * bc.cos(radians) * bc.cos(radians));
      var tempMinRadius = tempRefRadius * .6;
      var radiusOffset = tempRefRadius - tempMinRadius;
      var tempRadius = tempMinRadius + radiusOffset * bc.noise(deg * noiseX / smoothFactor, noiseY);
      //noiseX += noiseXInc;
      //console.log(1 / (wiggleSlider.val * wiggleSlider.val));
      noiseX += 1 / (wiggleSlider.currentVal * wiggleSlider.currentVal);
    
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
    bc.translate(bc.width/2, bc.height/2);
    bc.fill(steelColor);
    bc.stroke(0);
    bc.beginShape();
    for (var i = 0; i < points.length; i++) {
      bc.curveVertex(points[i].x, points[i].y);
    }  
    bc.endShape();
    bc.pop();
  }


  function drawAxes() {
    var offset = scaleFactor;
    var arrowLen = scaleFactor * 1.5;

    bc.push();
    bc.translate(bc.width/2, bc.height/2);
    bc.stroke(0);

    // Draw the x axis
    var xAxisStart = {x: -xSlider.currentVal * scaleFactor, y: ySlider.currentVal * scaleFactor};
    var xAxisEnd = {x: xSlider.currentVal * scaleFactor, y: ySlider.currentVal * scaleFactor};
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



    var yAxisStart = {x: xSlider.currentVal * scaleFactor, y: -ySlider.currentVal * scaleFactor};
    var yAxisEnd = {x: xSlider.currentVal * scaleFactor, y: ySlider.currentVal * scaleFactor};
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
    bc.noStroke();
    bc.textAlign(bc.CENTER);
    bc.text(xSlider.currentVal.toFixed(1) + '\"', 0, xAxisEnd.y + axisLabelSize);
    bc.textAlign(bc.LEFT);
    bc.text(ySlider.currentVal.toFixed(1) + '\"', xAxisEnd.x + axisLabelSize/8, axisLabelSize/2);

    bc.pop();
  }


  bc.draw = () => {
    if (baseUnlockedFlag) {
      bc.background(bgColor);
      generateBase();
      drawBase();
      drawAxes();
      drawGui();
    }
    else {
      var textBoxWidth = bc.width / 3;
      var textBoxHeight = 300;
      bc.fill(255);
      bc.rect(bc.width/2 - textBoxWidth/2, bc.height/2 - textBoxHeight/2, textBoxWidth, textBoxHeight);
    }
  }

  function createSlider(_name, _xPos, _yPos, _minVal, _maxVal) {
    var sliderRange = _maxVal - _minVal;
    var midVal = (_maxVal + _minVal)/2;
    //return {name: _name, xPos: _xPos, yPos: _yPos, minVal: _minVal, maxVal: _maxVal, currentVal: (_maxVal + _minVal)/2 };
    return {name: _name, 
            xPos: _xPos, 
            yPos: _yPos, 
            minVal: _minVal, 
            maxVal: _maxVal, 
            currentVal: midVal + bc.random(-sliderRange / 4, sliderRange / 4) };
    // TODO: random(range*.25 + minVal, range * .75 * minVal)?
  }

  function createButton(_name, _xPos, _yPos) {
    return {name: _name, xPos: _xPos, yPos: _yPos};
  }

  var sliderStart = sliderX + 83;
  var sliderEnd = sliderX + sliderWidth - 5;
  function drawGui() {
    // Draw button/ slider rectangles
    bc.stroke(0);
    bc.fill(steelColor);
    bc.rect(xSlider.xPos, xSlider.yPos, sliderWidth, sliderHeight);
    bc.rect(ySlider.xPos, ySlider.yPos, sliderWidth, sliderHeight);
    bc.rect(wiggleSlider.xPos, wiggleSlider.yPos, sliderWidth, sliderHeight);
    bc.rect(lockButton.xPos, lockButton.yPos, sliderWidth, sliderHeight);

    // Label buttons/ sliders
    bc.noStroke();
    bc.fill(0);
    var guiLabelSize = 15;
    bc.textSize(guiLabelSize);
    var textOffset = sliderHeight - (sliderHeight - guiLabelSize) / 2 - 2;
    bc.text("Width:", sliderX + 3, xSliderY + textOffset);
    bc.text("Height:", sliderX + 3, ySliderY + textOffset);
    bc.text("Wiggliness:", sliderX + 3, wiggleSliderY + textOffset);
    bc.text("Lock in shape", sliderX + 3, lockButton.yPos + textOffset);

    // Draw the sliders
    bc.stroke(0);
    bc.line(sliderStart, xSlider.yPos + sliderHeight/2, sliderEnd, xSlider.yPos + sliderHeight/2);
    bc.line(sliderStart, ySlider.yPos + sliderHeight/2, sliderEnd, ySlider.yPos + sliderHeight/2);
    bc.line(sliderStart, wiggleSlider.yPos + sliderHeight/2, sliderEnd, wiggleSlider.yPos + sliderHeight/2);

    bc.strokeWeight(3);
    var sliderPadding = 5;
    var xSliderTickPos = bc.map(xSlider.currentVal, xSlider.minVal, xSlider.maxVal, sliderStart, sliderEnd);
    bc.line(xSliderTickPos, xSliderY + sliderPadding, xSliderTickPos, xSliderY + sliderHeight - sliderPadding);
    var ySliderTickPos = bc.map(ySlider.currentVal, ySlider.minVal, ySlider.maxVal, sliderStart, sliderEnd);
    bc.line(ySliderTickPos, ySliderY + sliderPadding, ySliderTickPos, ySliderY + sliderHeight - sliderPadding);
    var wiggleSliderTickPos = bc.map(wiggleSlider.currentVal, wiggleSlider.minVal, wiggleSlider.maxVal, sliderStart, sliderEnd);
    bc.line(wiggleSliderTickPos, wiggleSliderY + sliderPadding, wiggleSliderTickPos, wiggleSliderY + sliderHeight - sliderPadding);

    bc.strokeWeight(1);
  }

  bc.mouseDragged = () => {
    sliders();
  }

  bc.mouseClicked = () => {
    sliders();
    buttons();
  }

  function sliders() {
    if (bc.mouseX >= sliderStart && bc.mouseX <= sliderEnd) {

      // xSlider
      if (bc.mouseY >= xSlider.yPos && bc.mouseY <= xSlider.yPos + sliderHeight) {
        xSlider.currentVal = bc.map(bc.mouseX, sliderStart, sliderEnd, xSlider.minVal, xSlider.maxVal);
      }

      // ySlider
      if (bc.mouseY >= ySlider.yPos && bc.mouseY <= ySlider.yPos + sliderHeight) {
        ySlider.currentVal = bc.map(bc.mouseX, sliderStart, sliderEnd, ySlider.minVal, ySlider.maxVal);
      }

      // wiggleSlider
      if (bc.mouseY >= wiggleSlider.yPos && bc.mouseY <= wiggleSlider.yPos + sliderHeight) {
        wiggleSlider.currentVal = bc.map(bc.mouseX, sliderStart, sliderEnd, wiggleSlider.minVal, wiggleSlider.maxVal);
      }
    }
  }

  function buttons() {
    if (bc.mouseX >= sliderX && bc.mouseX <= sliderX + sliderWidth) {
      if (bc.mouseY >= lockButton.yPos && bc.mouseY <= lockButton.yPos + sliderHeight) {
        baseUnlockedFlag = false;
        window.basePoints = points;
        window.scaleFactor = scaleFactor;
      }
    }
  }

  //TODO: touch stuff

};

var baseUnlockedFlag = true;
let baseCreatorP5 = new p5(baseCreatorSketch);