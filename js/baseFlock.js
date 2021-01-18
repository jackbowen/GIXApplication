var rods = [];
var scaledRodDiameter;

var flockSketch = function ( f ) {
  var loadedBaseFlag = false;
  var unscaledRodDiameter = .375;
  

  var numRodsSlider;

  var maxSpeed = .15;
  var maxForce = 0.03;

  f.preload = () => {
  }

  function clickInteraction() {
    flockSliders();
    //baseButtons();
  }

  function mouseMoveInteraction() {
    if (f.mouseIsPressed) {
      flockSliders();
    }
  }

  f.setup = () => {
    var flockWidth = $('.projectContent').width();
    var flockHeight = flockWidth * .67;

    if (flockHeight > window.windowHeight * .9) {
      flockHeight = window.windowHeight * .9;
    }

    var flockCanvas = f.createCanvas(flockWidth, flockHeight);
    flockCanvas.parent('flock-holder');

    flockCanvas.mouseClicked(clickInteraction);
    flockCanvas.mouseMoved(mouseMoveInteraction);
    //TODO: touch stuff

    //textFont(guiFont);
    f.textFont('Roboto'); 
  }

  function drawWaitBox() {
    f.background(bgColor);

    f.fill(255);
    f.stroke(0);
    f.strokeWeight(1);
    f.rect(f.width/2 - holdTextBoxWidth/2, f.height/2 - holdTextBoxHeight/2, holdTextBoxWidth, holdTextBoxHeight);

    f.fill(0);
    f.noStroke();
    f.textSize(holdTextBoxTextSize);
    f.textAlign(f.CENTER);
    f.text("Waiting to determine base shape.\nSelect 'Lock in shape' in first sketch.", f.width/2, f.height/2 - holdTextBoxTextSize * .7);
  }

  var darkenedBackgroundFlag = false;
  f.draw = () => {
    if (baseUnlockedFlag) {
      f.background(bgColor);
      drawWaitBox();
      loadedBaseFlag = false;
    }
    else if (!loadedBaseFlag) {
      loadBase();
      generateRods(numRodsSlider.currentVal);
    }
    else if (!purchasedFlag) {
      //f.background(f.random(255));
      f.background(bgColor);
      drawBase();
      updateRods();
      drawRods();
      drawGui();
      darkenedBackgroundFlag = false;
    }
    else if (!darkenedBackgroundFlag) {
      f.fill(0, 40);
      f.noStroke();
      f.rect(0, 0, f.width, f.height);
      //TODO: textbox?
      darkenedBackgroundFlag = true;
    }
  }

  function generateRods(numRods) {
    rods = [];
    for (var i = 0; i < numRods; i++) {
      rods[i] = createRod();
    }
  }

  //rodNoise = 0;
  var rodNoiseInc = .01;
  //rodSpeed = 1;
  function updateRods() {
    for (var i = 0; i < rods.length; i++) {
      var tempRod = rods[i];
      
      var wan = wander(tempRod);
      wan.mult(.2); // The wander part of things was just being a little pushy
      tempRod.acc.add(wan);
      
      var edge = avoidEdge(tempRod);
      tempRod.acc.add(edge);
      
      var sep = separate(tempRod);
      tempRod.acc.add(sep);

      // Add vel
      tempRod.vel.add(tempRod.acc);
      tempRod.vel.limit(maxSpeed);
      tempRod.loc.add(tempRod.vel);
      //tempRod.loc.add(tempRod.vel);
    }
  }

  function wander(rod) {
    // Add random wander
    //rod.x += rodSpeed * (f.noise(rodNoise)-.5);
    //rod.y += rodSpeed * (f.noise(rodNoise+20)-.5);
    //var wander = f.createVector()
    //rodNoise += rodNoiseInc;
    var steer = f.createVector(f.noise(rod.wanderNoise)-.48, f.noise(rod.wanderNoise+20)-.48);
    rod.wanderNoise += rodNoiseInc;

    f.push();
    f.translate(f.width/2, f.height/2);
    steer.normalize();
    steer.mult(scaleFactor);
    f.strokeWeight(3);
    f.stroke(255, 0, 0);
    f.line(rod.loc.x, rod.loc.y, rod.loc.x + steer.x, rod.loc.y + steer.y);
    f.pop();

    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(maxSpeed);
      steer.sub(rod.vel);
      steer.limit(maxForce);
    }
    return steer;
  }

  // Avoid shape edge 
  function avoidEdge(rod) {
    // Determine closest edge
    var closestEdge = [0,1];
    var closestDist = 10000000;
      
    for (var j = 0; j < basePoints.length - 1; j++) {
      //console.log("gh");
      var p1Dist = f.dist(rod.loc.x, rod.loc.y, basePoints[j].x, basePoints[j].y);
      var p2Dist = f.dist(rod.loc.x, rod.loc.y, basePoints[j+1].x, basePoints[j+1].y);
      var totalDist = p1Dist + p2Dist;
      //console.log(totalDist);
      if (totalDist < closestDist) {
        closestEdge = [j, j+1];
        closestDist = totalDist;
      }
    }
    var p1 = {x: basePoints[closestEdge[0]].x, y: basePoints[closestEdge[0]].y};
    var p2 = {x: basePoints[closestEdge[1]].x, y: basePoints[closestEdge[1]].y}
    var distToLine = distanceToLine(rod.loc.x, rod.loc.y, p1.x, p1.y, p2.x, p2.y);

    var steer = f.createVector(0, 0);
    var desiredMargin = scaleFactor * 4;
    if (distToLine < desiredMargin) {
      var diff = f.createVector(p1.y - p2.y, -(p1.x - p2.x));
      diff.normalize();
      diff.div(distToLine);
      steer.add(diff);
    }

    // Show it
    if (distToLine < desiredMargin) {
      f.push();
      f.translate(f.width/2, f.height/2);
      //console.log(closestEdge);
      f.strokeWeight(3);
      f.stroke(0, 255, 0);
      var normalVector = f.createVector(p1.y - p2.y, -(p1.x - p2.x));
      f.line(rod.loc.x, rod.loc.y, rod.loc.x + normalVector.x, rod.loc.y + normalVector.y);
      f.line(p1.x, p1.y, p2.x, p2.y);
      f.strokeWeight(1);
      f.stroke(0);
      f.pop();
    }



    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(maxSpeed);
      steer.sub(rod.vel);
      steer.limit(maxForce);
    }
    return steer;
  }

  function separate(rod) {
    // Minimum distance between two rods should be 2" - that's scaleFactor * 2 * 2
    // Increase that number a bit just to give us some room;
    var desiredSeparation = scaleFactor * 5;
    var steer = f.createVector(0, 0);
    var count = 0;

    f.push();
    f.translate(f.width/2, f.height/2);
    f.strokeWeight(1);
    f.stroke(0, 0, 255);
    // For every rod in the system, check if it's too close
    for (var i = 0; i < rods.length; i++) {
      var other = rods[i]
      var d = f.dist(rod.loc.x, rod.loc.y, other.loc.x, other.loc.y);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < desiredSeparation)) {
        // Calculate vector pointing away from neighbor
        f.line(rod.loc.x, rod.loc.y, other.loc.x, other.loc.y);
        var diff = p5.Vector.sub(rod.loc, other.loc);
        diff.normalize();
        diff.div(d);        // Weight by distance
        steer.add(diff);
        count++;            // Keep track of how many
      }
    }
    f.pop();
    // Average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(maxSpeed);
      steer.sub(rod.vel);
      steer.limit(maxForce);
    }
    return steer;
  }

  function distanceToLine(x0, y0, x1, y1, x2, y2) {
    //console.log(x0 + ', ' + y0 + ', ' + x1 + ', ' + y1 + ', ' + x2 + ', ' + y2);
    return (f.abs((x2-x1)*(y1-y0) - (x1-x0)*(y2-y1))) / (f.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1)));
  }

  function drawRods() {
    f.push();
    f.stroke(0);
    f.strokeWeight(1);
    f.fill(steelColor);
    f.translate(f.width/2, f.height/2);
    for (var i = 0; i < rods.length; i++) {
      var tempRod = rods[i];
      f.ellipse(tempRod.loc.x, tempRod.loc.y, scaledRodDiameter, scaledRodDiameter);
    }
    f.pop();
  }

  function createRod() {
    return {loc: f.createVector(f.random(-40, 40), f.random(-40, 40)), 
            vel: f.createVector(f.random(-.2,.2), f.random(-.2,.2)),
            acc: f.createVector(0, 0),
            wanderNoise: f.random(100),
            heightNoiseSeed: f.random(50)};
  }

  function loadBase() {
    scaledRodDiameter = Math.round(unscaledRodDiameter * 2 * scaleFactor);
    if (scaledRodDiameter % 2 != 0) {
      scaledRodDiameter += 1;
    }
    var maxRods = Math.floor(roughBaseArea / 55);
    numRodsSlider = createSlider("# of elements:", guiMargins, guiMargins, 3, maxRods);

    loadedBaseFlag = true;
  }

  function drawBase() {
    f.push();
    f.translate(f.width/2, f.height/2);

    f.fill(steelColor);
    f.stroke(0);
    f.strokeWeight(1);

    f.beginShape();
    for (var i = 0; i < basePoints.length; i++) {
      f.curveVertex(basePoints[i].x, basePoints[i].y);
    }  
    f.endShape();

    f.pop();
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
            currentVal: Math.floor(midVal) + Math.round(f.random(-sliderRange / 4, sliderRange / 4)) 
    };
  }

  function createButton(_name, _xPos, _yPos) {
    return {name: _name, xPos: _xPos, yPos: _yPos};
  }

  function drawGui() {
    // Draw button/ slider rectangles
    f.stroke(0);
    f.strokeWeight(1);
    f.fill(steelColor);
    f.rect(numRodsSlider.xPos, numRodsSlider.yPos, sliderWidth, sliderHeight);

    // Label buttons/ sliders
    f.noStroke();
    f.fill(0);
    f.textSize(guiLabelSize);
    f.textAlign(f.LEFT);
    var textOffset = sliderHeight - (sliderHeight - guiLabelSize) / 2 - 2;
    f.text("# of elements:", numRodsSlider.xPos + guiTextPadding + 1, numRodsSlider.yPos + textOffset);
  
    // Draw the sliders
    f.stroke(0);
    f.line(sliderStart, numRodsSlider.yPos + sliderHeight/2, sliderEnd, numRodsSlider.yPos + sliderHeight/2);
  
    f.strokeWeight(3);
    var numRodsSliderTickPos = f.map(numRodsSlider.currentVal, numRodsSlider.minVal, numRodsSlider.maxVal, sliderStart, sliderEnd);
    //console.log(numRodsSlider.currentVal + ", " + numRodsSliderTickPos);
    f.line(numRodsSliderTickPos, numRodsSlider.yPos + sliderTickPadding, 
           numRodsSliderTickPos, numRodsSlider.yPos + sliderHeight - sliderTickPadding);

  }


  

  function flockSliders() {
    if (f.mouseX >= sliderStart && f.mouseX <= sliderEnd) {

      // numRodsSlider
      if (f.mouseY >= numRodsSlider.yPos && f.mouseY <= numRodsSlider.yPos + sliderHeight) {
        numRodsSlider.currentVal = Math.round(f.map(f.mouseX, sliderStart, sliderEnd, numRodsSlider.minVal, numRodsSlider.maxVal));
        generateRods(numRodsSlider.currentVal);
      }
    }
  }
};

let baseFlockP5 = new p5(flockSketch);