var bgColor = '#FF7C7B';
var steelColor = '#B4D0DE'; 
var sliderWidth = 200;
var sliderHeight = 32;
var guiMargins = 15;
var guiInc = sliderHeight + guiMargins;
var guiLabelSize = 15;
var guiTextPadding = 4;
var sliderStart = guiMargins + 100;
var sliderEnd = guiMargins + sliderWidth - 5;
var sliderTickPadding = 5;

var holdTextBoxWidth = 350;
var holdTextBoxHeight = 200;
var holdTextBoxTextSize = 20;


var baseCreatorSketch = function( bc ) {
  //window.bcp5 = new p5();
  //new p5();

  //let gui;
  let guiFont;
  let xSlider;
  let ySlider;
  let wiggleSlider;
  let lockButton;

  //var sliderWidth = 180;
  //var sliderHeight = 32;
  var sliderX = guiMargins;
  var xSliderY = guiMargins;
  //var guiInc = sliderHeight + xSliderY;
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

  function clickInteraction() {
    baseSliders();
    baseButtons();
  }

  function mouseMoveInteraction() {
    if (bc.mouseIsPressed) {
      baseSliders();
    }
  }

  bc.setup = () => {
    var baseCreatorWidth = $('.projectContent').width();
    var baseCreatorHeight = baseCreatorWidth * .67;

    if (baseCreatorHeight > window.windowHeight * .9) {
      baseCreatorHeight = window.windowHeight * .9;
    }

    var baseCreatorCanvas = bc.createCanvas(baseCreatorWidth, baseCreatorHeight);
    baseCreatorCanvas.parent('base-creator-holder');

    baseCreatorCanvas.mouseClicked(clickInteraction);
    baseCreatorCanvas.mouseMoved(mouseMoveInteraction);
    //TODO: touch stuff
    //TODO: make lock button a darker grey whem mouse is pressed

    xSlider = createSlider("width", sliderX, xSliderY, 6, 40);
    ySlider = createSlider("height", sliderX, ySliderY, 6, 30);
    wiggleSlider = createSlider("wiggle", sliderX, wiggleSliderY, bc.sqrt(1000), bc.sqrt(5)); 
    lockButton = createButton("lockBase", sliderX, lockButtonY);

    var scaleMargin = .9;
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
    bc.textFont('Roboto'); // TODO: some google fonts stuff?
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
            currentVal: midVal + bc.random(-sliderRange / 4, sliderRange / 4) 
    };
  }

  function createButton(_name, _xPos, _yPos) {
    return {name: _name, xPos: _xPos, yPos: _yPos};
  }

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
    bc.textSize(guiLabelSize);
    var textOffset = sliderHeight - (sliderHeight - guiLabelSize) / 2 - 2;
    bc.text("Width:", sliderX + guiTextPadding, xSliderY + textOffset);
    bc.text("Height:", sliderX + guiTextPadding, ySliderY + textOffset);
    bc.text("Wiggliness:", sliderX + guiTextPadding, wiggleSliderY + textOffset);
    bc.text("Lock in shape", sliderX + guiTextPadding, lockButton.yPos + textOffset);

    // Draw the sliders
    bc.stroke(0);
    bc.line(sliderStart, xSlider.yPos + sliderHeight/2, sliderEnd, xSlider.yPos + sliderHeight/2);
    bc.line(sliderStart, ySlider.yPos + sliderHeight/2, sliderEnd, ySlider.yPos + sliderHeight/2);
    bc.line(sliderStart, wiggleSlider.yPos + sliderHeight/2, sliderEnd, wiggleSlider.yPos + sliderHeight/2);

    bc.strokeWeight(3);

    var xSliderTickPos = bc.map(xSlider.currentVal, xSlider.minVal, xSlider.maxVal, sliderStart, sliderEnd);
    bc.line(xSliderTickPos, xSliderY + sliderTickPadding, xSliderTickPos, xSliderY + sliderHeight - sliderTickPadding);
    var ySliderTickPos = bc.map(ySlider.currentVal, ySlider.minVal, ySlider.maxVal, sliderStart, sliderEnd);
    bc.line(ySliderTickPos, ySliderY + sliderTickPadding, ySliderTickPos, ySliderY + sliderHeight - sliderTickPadding);
    var wiggleSliderTickPos = bc.map(wiggleSlider.currentVal, wiggleSlider.minVal, wiggleSlider.maxVal, sliderStart, sliderEnd);
    bc.line(wiggleSliderTickPos, wiggleSliderY + sliderTickPadding, wiggleSliderTickPos, wiggleSliderY + sliderHeight - sliderTickPadding);

    bc.strokeWeight(1);
  }



  function baseSliders() {
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

  function baseButtons() {
    if (bc.mouseX >= sliderX && bc.mouseX <= sliderX + sliderWidth) {
      if (bc.mouseY >= lockButton.yPos && bc.mouseY <= lockButton.yPos + sliderHeight) {
        baseUnlockedFlag = false;
        window.basePoints = points;
        window.scaleFactor = scaleFactor;
        //window.xRadius = xSlider.currentVal;
        //window.yRadius = ySlider.currentVal;
        window.roughBaseArea = xSlider.currentVal * ySlider.currentVal * bc.PI;

        //Grey out sketch, inform user to move to next part 
        bc.fill(255);
        bc.stroke(0);
        bc.rect(bc.width/2 - holdTextBoxWidth/2, bc.height/2 - holdTextBoxHeight/2, 
                holdTextBoxWidth, holdTextBoxHeight);
        bc.fill(0);
        bc.noStroke();
        bc.textSize(holdTextBoxTextSize);
        bc.textAlign(bc.CENTER);
        bc.text("Base shape locked in.\nProceed to the next sketch.", bc.width/2, bc.height/2 - holdTextBoxTextSize * .7);
      }
    }
  }

  

};

var baseUnlockedFlag = true;
let baseCreatorP5 = new p5(baseCreatorSketch);