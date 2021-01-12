var flockSketch = function ( f ) {
  var loadedBaseFlag = false;
  var unscaledRodDiameter = .375;
  var scaledRodDiameter;
  var rods = [];

  var maxSpeed = .5;
  var maxForce = 0.03;

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
      for (var i = 0; i < 10; i++) {
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
      //wander(tempRod);
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


    // DEBUGGING
    f.push();
    f.translate(f.width/2, f.height/2);
    //console.log(closestEdge);
    f.strokeWeight(3);
    f.stroke(255, 0, 0);
    if (distToLine < 50) {
      f.stroke(0, 255, 0);
      var normalVector = f.createVector(p1.y - p2.y, -(p1.x - p2.x));
      f.line(rod.loc.x, rod.loc.y, rod.loc.x + normalVector.x, rod.loc.y + normalVector.y);
    }
    f.line(p1.x, p1.y, p2.x, p2.y);
    f.strokeWeight(1);
    f.stroke(0);
    f.pop();

    var steer = f.createVector(0, 0);
    var desiredMargin = scaleFactor * 4;
    if (distToLine < desiredMargin) {
      var diff = f.createVector(p1.y - p2.y, -(p1.x - p2.x));
      diff.normalize();
      diff.div(distToLine);
      steer.add(diff);
    }

     if (steer.mag() > 0) {
      // First two lines of code below could be condensed with new PVector setMag() method
      // Not using this method until Processing.js catches up
      // steer.setMag(maxspeed);

      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(maxSpeed);
      steer.sub(rod.vel);
      steer.limit(maxForce);
    }
    return steer;
  }

  function separate(rod) {
    var desiredSeparation = scaleFactor * 3;
    var steer = f.createVector(0, 0);
    var count = 0;

    // For every rod in the system, check if it's too close
    for (var i = 0; i < rods.length; i++) {
      var other = rods[i]
      var d = f.dist(rod.loc.x, rod.loc.y, other.loc.x, other.loc.y);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < desiredSeparation)) {
        // Calculate vector pointing away from neighbor
        var diff = p5.Vector.sub(rod.loc, other.loc);
        diff.normalize();
        diff.div(d);        // Weight by distance
        steer.add(diff);
        count++;            // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // First two lines of code below could be condensed with new PVector setMag() method
      // Not using this method until Processing.js catches up
      // steer.setMag(maxspeed);

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
    f.translate(f.width/2, f.height/2);
    for (var i = 0; i < rods.length; i++) {
      var tempRod = rods[i];
      f.ellipse(tempRod.loc.x, tempRod.loc.y, scaledRodDiameter, scaledRodDiameter);
    }
    f.pop();
  }

  function createRod() {
    return {loc: f.createVector(f.random(-10, 10), f.random(-10, 10)), 
            vel: f.createVector(f.random(-.2,.2), f.random(-.2,.2)),
            acc: f.createVector(0, 0)};
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