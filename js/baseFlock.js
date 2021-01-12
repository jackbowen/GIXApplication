var flockSketch = function ( f ) {
  var loadedBaseFlag = false;
  var unscaledRodDiameter = .375;
  var scaledRodDiameter;
  var rods = [];

  //var numRods = 12;

  f.preload = () => {
  }

  f.setup = () => {
    var flockWidth = $('.projectContent').width();
    var flockHeight = flockWidth * .67;

    //if (flockHeight > f.windowWidth * .9) {
    //  flockHeight = f.windowWidth * .9;
    //}

    var flockCanvas = f.createCanvas(flockWidth, flockHeight);
    flockCanvas.parent('flock-holder');
  }

  f.draw = () => {
    if (baseUnlockedFlag) {
      f.background(255, 125, 0);
      f.text("waiting on base sketch", f.width/2, f.height/2);
    }
    else if (!loadedBaseFlag) {
      loadBase();
      for (var i = 0; i < 2; i++) {
        rods[i] = createRod();
      }
    }
    else {
      //f.background(f.random(255));
      f.background(0, 0, 255);
      drawBase();
      updateRods();
      drawRods();
    }
  }

  rodNoise = 0;
  rodNoiseInc = .1;
  rodSpeed = 1;
  function updateRods() {
    for (var i = 0; i < rods.length; i++) {
      var tempRod = rods[i];
      // Add random wander
      //rod.x += rodSpeed * (f.noise(rodNoise)-.5);
      //rod.y += rodSpeed * (f.noise(rodNoise+20)-.5);
      //var wander = f.createVector()
      //rodNoise += rodNoiseInc;

      // Avoid shape edge 
      // Determine closest edge
      var closestEdge = [0,1];
      var closestDist = 10000000;
      for (var j = 0; j < basePoints.length - 1; j++) {
        //console.log("gh");
        var p1Dist = f.dist(tempRod.loc.x, tempRod.loc.y, basePoints[j].x, basePoints[j].y);
        var p2Dist = f.dist(tempRod.loc.x, tempRod.loc.y, basePoints[j+1].x, basePoints[j+1].y);
        var totalDist = p1Dist + p2Dist;
        //console.log(totalDist);
        if (totalDist < closestDist) {
          closestEdge = [j, j+1];
          closestDist = totalDist;
        }
      }

      // DEBUGGING
      f.push();
      f.translate(f.width/2, f.height/2);
      console.log(closestEdge);
      f.strokeWeight(3);
      f.stroke(255, 0, 0);
      f.line(basePoints[closestEdge[0]].x, basePoints[closestEdge[0]].y, basePoints[closestEdge[1]].x, basePoints[closestEdge[1]].y);
      f.strokeWeight(1);
      f.stroke(0);
      f.pop();

      // Add vel
      tempRod.loc.add(tempRod.vel);
    }
  }

  function drawRods() {
    f.push();
    f.translate(f.width/2, f.height/2);
    for (var i = 0; i < rods.length; i++) {
      var tempRod = rods[i];
      f.ellipse(tempRod.loc.x, tempRod.loc.y, scaledRodDiameter, scaledRodDiameter);
    }
    f.pop();
  }

  function createRod() {
    return {loc: f.createVector(f.random(-10, 10), f.random(-10, 10)), 
            vel: f.createVector(f.random(-.2,.2), f.random(-.2,.2))};
  }

  function loadBase() {
    loadedBaseFlag = true;
    scaledRodDiameter = unscaledRodDiameter * 2 * scaleFactor;
  }

  function drawBase() {
    f.push();
    f.translate(f.width/2, f.height/2);
    f.fill(200);
    f.stroke(0);
    f.beginShape();
    for (var i = 0; i < basePoints.length; i++) {
      f.curveVertex(basePoints[i].x, basePoints[i].y);
    }  
    f.endShape();

    for (var i = 0; i < basePoints.length - 1; i++) {
      f.line(basePoints[i].x, basePoints[i].y, basePoints[i+1].x, basePoints[i+1].y);
    }  

    f.pop();
  }
};

let baseFlockP5 = new p5(flockSketch);