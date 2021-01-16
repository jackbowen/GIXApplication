var axonSketch = function ( a ) {
  var axonAngle = -a.PI/4;

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
      drawBase();
      drawRods();
    }
  }

  function drawBase() {
    var baseY = a.height/2;
    var baseThickness = a.sqrt(2) * scaledRodDiameter / 6;
    a.push();
    a.translate(a.width/2, baseY);
    a.rotate(axonAngle);
    a.fill(steelColor);
    a.stroke(0);
    a.strokeWeight(1);

    a.beginShape();
    for (var i = 0; i < basePoints.length; i++) {
      a.curveVertex(basePoints[i].x - baseThickness, basePoints[i].y + baseThickness);
    }  
    a.endShape();

    a.beginShape();
    for (var i = 0; i < basePoints.length; i++) {
      a.curveVertex(basePoints[i].x, basePoints[i].y);
    }  
    a.endShape();

    a.pop();
  }

  var rodHeight = 80;
  var zeroOrigin = a.createVector(0, 0);
  function drawRods() {

    var translatedRods = [];
    var origin = {x: a.width/2, y: a.height/2};
    for (var i = 0; i < rods.length; i++) {
      var tempRod = rods[i];
      //var rotatedX = tempRod.loc.x*a.cos(axonAngle) - tempRod.loc.y*a.sin(axonAngle);
      //var rotatedY = tempRod.loc.x*a.sin(axonAngle) + tempRod.loc.y*a.cos(axonAngle);
      var rotatedPoint = rotatePoint(tempRod.loc, zeroOrigin, axonAngle);
      var rHeight = 200 - a.dist(tempRod.loc.x, tempRod.loc.y, 0, 0);
      translatedRods[i] = {loc:a.createVector(rotatedPoint.x + origin.x, rotatedPoint.y + origin.y),
                           rodHeight: rHeight};
    }

    

    //This function is so that the rods closest to us are drawn first 
    translatedRods.sort(rodSorter);

    a.strokeWeight(1);
    a.fill(steelColor);
    
    for (var i = 0; i < translatedRods.length; i++) {
      var tempRod = translatedRods[i];
      //a.line(origin.x, origin.y, tempRod.loc.x, tempRod.loc.y);
      var barrelAngle = a.atan2(tempRod.loc.y - a.height/2, tempRod.loc.x - a.width/2);
      if (barrelAngle > 0) { //atan2 returns values between PI and 2*PI as being -PI to 0
        drawRod(tempRod);
        drawBarrel(tempRod, barrelAngle);
      }
      else {
        drawBarrel(tempRod, barrelAngle);
        drawRod(tempRod);
      }
    }
  }

  function drawRod(rod) {
    a.noStroke();
    a.rect(rod.loc.x - scaledRodDiameter/2, rod.loc.y, scaledRodDiameter, -rod.rodHeight);
    a.stroke(0);
    a.arc(rod.loc.x + .5, rod.loc.y, scaledRodDiameter, scaledRodDiameter, 0, a.PI);
    a.line(rod.loc.x - scaledRodDiameter/2, rod.loc.y, rod.loc.x - scaledRodDiameter/2, rod.loc.y - rod.rodHeight);
    a.line(rod.loc.x + scaledRodDiameter/2, rod.loc.y, rod.loc.x + scaledRodDiameter/2, rod.loc.y - rod.rodHeight);
    a.ellipse(rod.loc.x + .5, rod.loc.y - rod.rodHeight, scaledRodDiameter, scaledRodDiameter);
  }

  function drawBarrel(rod, barrelAngle) {
    var barrelOuterWidth = scaledRodDiameter * 2.67;
    var barrelInnerWidth = scaledRodDiameter * 2.29;
    var wallThickness = (barrelOuterWidth - barrelInnerWidth) / 2;
    var barrelHeight = barrelOuterWidth;
    

    a.push();
    a.translate(rod.loc.x, rod.loc.y - rod.rodHeight);
    
    var topEllipseCenter = {x: (scaledRodDiameter/2 + barrelOuterWidth/2) * a.cos(barrelAngle),
                            y: (scaledRodDiameter/2 + barrelOuterWidth/2) * a.sin(barrelAngle) - barrelHeight/2};
    
    a.noStroke();
    a.rect(topEllipseCenter.x - barrelOuterWidth/2, topEllipseCenter.y, barrelOuterWidth, barrelHeight + 1);

    a.stroke(0);    
    a.line(topEllipseCenter.x - barrelOuterWidth/2, topEllipseCenter.y, topEllipseCenter.x - barrelOuterWidth/2, topEllipseCenter.y + barrelHeight);
    a.line(topEllipseCenter.x + barrelOuterWidth/2, topEllipseCenter.y, topEllipseCenter.x + barrelOuterWidth/2, topEllipseCenter.y + barrelHeight);
    a.ellipse(topEllipseCenter.x + .5, topEllipseCenter.y, barrelOuterWidth, barrelOuterWidth);
    a.ellipse(topEllipseCenter.x + .5, topEllipseCenter.y, barrelInnerWidth, barrelInnerWidth);
    a.arc(topEllipseCenter.x + .5, topEllipseCenter.y + barrelHeight, barrelOuterWidth, barrelOuterWidth, 0, a.PI);
    
    a.pop();
  }

  function rodSorter(a, b) {
    if (a.loc.y < b.loc.y) {
      return -1;
    }
    if (a.loc.y > b.loc.y) {
      return 1;
    }
    return 0;
  }

  function rotatePoint(myPoint, center, angle) {
    var rotatedX = (myPoint.x - center.x)*a.cos(angle) - (myPoint.y - center.y)*a.sin(angle) + center.x;
    var rotatedY = (myPoint.x - center.x)*a.sin(angle) + (myPoint.y - center.y)*a.cos(angle) + center.y;
    return {x: rotatedX, y: rotatedY};
  }
};

let axonP5 = new p5(axonSketch);