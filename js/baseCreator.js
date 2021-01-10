let gui;
let guiFont;
let xSlider;
let ySlider;

var points = [];

var noiseX = 0.0;
var noiseXInc = 0.1; // How squiggly is the shape
var noiseY = 0.0;
var noiseYInc = .001; // How quickly does the shape change

var bgColor = '#FF7C7B';
var steelColor = '#B4D0DE';

var scaleFactor = 20;
var axisToOffset;

function preload() {
  guiFont = loadFont('../resources/fonts/QldKNThLqRwH-OJ1UHjlKGlW5qhExfHwNJU.woff2');
}

function setup() {
  var baseCreatorWidth = $('.projectContent').width();
  var baseCreatorHeight = baseCreatorWidth * .67;

  if (baseCreatorHeight > windowWidth * .9) {
    baseCreatorHeight = windowWidth * .9;
  }

  var baseCreatorCanvas = createCanvas(baseCreatorWidth, baseCreatorHeight);
  baseCreatorCanvas.parent('base-creator-holder');

  gui = createGui();
  var sliderWidth = 128;
  var sliderHeight = 32;
  xSlider = createSlider("width", 50, 50, sliderWidth, sliderHeight, 6, 40);
  ySlider = createSlider("height", 50, 100, sliderWidth, sliderHeight, 6, 30);

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

  textFont(guiFont);

  generateBase();
  drawBase();
}


function generateBase() {
  var origin = {x: width/2, y: height/2};
  var numPoints = 30;
  var degInc = 360.0 / numPoints;

  //var xRefRadius = 600;
  //var yRefRadius = 300;
  var xRefRadius = xSlider.val * scaleFactor;
  var yRefRadius = ySlider.val * scaleFactor;
  var refRadius = 300;
  //time += timeInc;
  noiseX = 0.1;
  noiseY += noiseYInc;
  var smoothFactor = 20;
  //PVector origin = new PVector(width/2, height/2, 0);
  
  for (var i = 0; i < numPoints; i++) {
    var deg = i * degInc;
    var radians = deg * PI / 180.0;

    var tempRefRadius = (xRefRadius * yRefRadius) / sqrt(xRefRadius * xRefRadius * sin(radians) * sin(radians) + yRefRadius * yRefRadius * cos(radians) * cos(radians));
    var tempMinRadius = tempRefRadius * .6;
    var radiusOffset = tempRefRadius - tempMinRadius;
    var tempRadius = tempMinRadius + radiusOffset * noise(deg * noiseX / smoothFactor, noiseY);
    noiseX += noiseXInc;
    
    var xPos = tempRadius * cos(radians);
    var yPos = tempRadius * sin(radians);   
    points[i] = createVector(xPos, yPos);
  }

  points[numPoints] = points[0];
  points[numPoints + 1] = points[1];
  points[numPoints + 2] = points[2];
}


function drawBase() {
  push();
  translate(width/2, height/2);
  fill(steelColor);
  beginShape();
  for (var i = 0; i < points.length; i++) {
    curveVertex(points[i].x, points[i].y);
  }  
  endShape();
  pop();
}


function drawGuiLabels() {

}


function drawAxes() {
  var offset = scaleFactor;
  var arrowLen = scaleFactor * 1.5;

  push();
  translate(width/2, height/2);

  // Draw the x axis
  var xAxisStart = {x: -xSlider.val * scaleFactor, y: ySlider.val * scaleFactor};
  var xAxisEnd = {x: xSlider.val * scaleFactor, y: ySlider.val * scaleFactor};
  if (axisToOffset == 'x') {
    xAxisStart.y += offset;
    xAxisEnd.y += offset;
  }
  line(xAxisStart.x, xAxisStart.y, xAxisEnd.x, xAxisEnd.y);

  // Draw the x axis arrows
  line(xAxisStart.x, xAxisStart.y, xAxisStart.x + arrowLen, xAxisStart.y - arrowLen);
  line(xAxisStart.x, xAxisStart.y, xAxisStart.x + arrowLen, xAxisStart.y + arrowLen);
  line(xAxisEnd.x, xAxisEnd.y, xAxisEnd.x - arrowLen, xAxisEnd.y - arrowLen);
  line(xAxisEnd.x, xAxisEnd.y, xAxisEnd.x - arrowLen, xAxisEnd.y + arrowLen);

  text(xSlider.val + '\"', 0, xAxisEnd.y);

  var yAxisStart = {x: xSlider.val * scaleFactor, y: -ySlider.val * scaleFactor};
  var yAxisEnd = {x: xSlider.val * scaleFactor, y: ySlider.val * scaleFactor};
  if (axisToOffset == 'y') {
    yAxisStart.x += offset;
    yAxisEnd.x += offset;
  }
  line(yAxisStart.x, yAxisStart.y, yAxisEnd.x, yAxisEnd.y);

   // Draw the y axis arrows
  line(yAxisStart.x, yAxisStart.y, yAxisStart.x - arrowLen, yAxisStart.y + arrowLen);
  line(yAxisStart.x, yAxisStart.y, yAxisStart.x + arrowLen, yAxisStart.y + arrowLen);
  line(yAxisEnd.x, yAxisEnd.y, yAxisEnd.x - arrowLen, yAxisEnd.y - arrowLen);
  line(yAxisEnd.x, yAxisEnd.y, yAxisEnd.x + arrowLen, yAxisEnd.y - arrowLen);

  pop();
}


function draw() {
  background(bgColor);
  generateBase();
  drawBase();
  drawGui();
  drawAxes();
}