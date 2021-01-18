var purchasedFlag = false;

var axonSketch = function ( a ) {
  var axonAngle = -a.PI/4;
  var loadedBaseFlag = false;
  var finalFlag = false;

  var maxHeightSliderY = guiMargins;
  var purchaseButtonY = maxHeightSliderY + guiInc;
  var finalButtonY = guiMargins;
  var goBackButtonY = finalButtonY + guiInc;
  var axonOrigin; 

  function clickInteraction() {
    axonSliders();
    axonButtons();
  }

  function mouseMoveInteraction() {
    if (a.mouseIsPressed) {
      axonSliders();
    }
  }

  a.setup = () => {
    var flockWidth = $('.projectContent').width();
    var flockHeight = flockWidth * .67;

    if (flockHeight > window.windowHeight * .9) {
      flockHeight = window.windowHeight * .9;
    }

    var axonCanvas = a.createCanvas(flockWidth, flockHeight);
    axonCanvas.parent('axon-holder');

    axonOrigin = {x: a.width/2, y: a.height * .67};

    axonCanvas.mouseClicked(clickInteraction);
    axonCanvas.mouseMoved(mouseMoveInteraction);
    //TODO: touch stuff

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
      a.text("Waiting to determine base shape.\nSelect 'Lock in shape' in first sketch.", a.width/2, a.height/2 - holdTextBoxTextSize * .7);

      loadedBaseFlag = false;
    }
    else if (!loadedBaseFlag) {
      loadBase();
    }
    else if (!purchasedFlag) {
      axonAngle = -a.PI/4;
      a.background(bgColor);
      drawBase();
      drawRods();
      drawGui();
      drawAxis();
    }
    else if (!finalFlag) {
      //revolve
      axonAngle += .005;

      a.background(bgColor);
      drawBase();
      drawRods();
      drawGui();
      drawAxis();
      drawGui();
      finalTextDrawn = false;
    }
    else if (finalFlag) {
      if (!finalTextDrawn) {
        drawFinalText();
      }
    }
  }

  var finalTextDrawn = false;
  function drawFinalText() {
    // Grey out sketch
    a.fill(0, 40);
    a.rect(0, 0, a.width, a.height);

    // Draw bounding box as well as button
    a.fill(255);
    a.stroke(0);
    a.rect(a.width/2 - holdTextBoxWidth/2, a.height/2 - holdTextBoxHeight/2, 
           holdTextBoxWidth, holdTextBoxHeight);

    a.fill(0);
    a.noStroke();
    a.textSize(holdTextBoxTextSize);
    a.textAlign(a.CENTER);
    a.text("Item added to cart.\nThank you!", a.width/2, a.height/2 - holdTextBoxTextSize * .7);

    //TODO: start over button

    finalTextDrawn = true;
  }

  var maxRodHeight;
  var minRodHeight;
  function loadBase() {
    minRodHeight = scaledRodDiameter * 4;
    maxHeightSlider = createSlider("maxHeight", guiMargins, maxHeightSliderY, scaledRodDiameter * 20, scaledRodDiameter * 50);
    purchaseButton = createButton("addToCart", guiMargins, purchaseButtonY);
    finalButton = createButton("final", guiMargins, finalButtonY);
    goBackButton = createButton("goBack", guiMargins, goBackButtonY);
    loadedBaseFlag = true;
  }

  function drawBase() {
    var baseThickness = scaledRodDiameter / 3;
    var baseOffsetX = baseThickness * a.sin(axonAngle); 
    var baseOffsetY = baseThickness * a.cos(axonAngle);
    a.push();
    a.translate(axonOrigin.x, axonOrigin.y);
    a.rotate(axonAngle);
    a.fill(steelColor);
    a.stroke(0);
    a.strokeWeight(1);

    a.beginShape();
    for (var i = 0; i < basePoints.length; i++) {
      a.curveVertex(basePoints[i].x + baseOffsetX, basePoints[i].y + baseOffsetY);
    }  
    a.endShape();

    //a.translate(0, -baseThickness);

    a.beginShape();
    for (var i = 0; i < basePoints.length; i++) {
      a.curveVertex(basePoints[i].x, basePoints[i].y);
    }  
    a.endShape();

    a.pop();
  }

  
  var zeroOrigin = a.createVector(0, 0);
  var heightNoise = 0.0;
  var heightNoiseInc = 0.005;
  function drawRods() {
    var translatedRods = [];

    if (!purchasedFlag) {
      heightNoise += heightNoiseInc;
    }
    
    for (var i = 0; i < rods.length; i++) {
      var tempRod = rods[i];
      var rotatedPoint = rotatePoint(tempRod.loc, zeroOrigin, axonAngle);
      //var rHeight = maxRodHeight - a.dist(tempRod.loc.x, tempRod.loc.y, 0, 0);

      var localMaxHeight = a.map(a.dist(tempRod.loc.x, tempRod.loc.y, 0, 0), 0, largerRadius, maxHeightSlider.currentVal, minRodHeight);
      var localMinHeight = localMaxHeight * .6;
      if (localMinHeight < scaledRodDiameter * 3) {
        localMinHeight = scaledRodDiameter * 3;
      }
      var rHeight = a.map(a.noise(tempRod.heightNoiseSeed + heightNoise), 0, 1, localMinHeight, localMaxHeight);
      translatedRods[i] = {loc:a.createVector(rotatedPoint.x + axonOrigin.x, rotatedPoint.y + axonOrigin.y),
                           rodHeight: rHeight};
    }

    

    //This function is so that the rods closest to us are drawn first 
    translatedRods.sort(rodSorter);

    a.strokeWeight(1);
    a.fill(steelColor);
    
    for (var i = 0; i < translatedRods.length; i++) {
      var tempRod = translatedRods[i];
      var barrelAngle = a.atan2(tempRod.loc.y - axonOrigin.y, tempRod.loc.x - axonOrigin.x);
      if (barrelAngle > 0) { //atan2 returns values between PI and 2*PI as being -PI to 0
        drawRod(tempRod);
        drawBarrel(tempRod, barrelAngle);
      }
      else {
        drawBarrel(tempRod, barrelAngle);
        drawRod(tempRod);
      }
    }

    calcCost(translatedRods);
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

  function drawAxis() {
    a.push();
    a.translate(axonOrigin.x, axonOrigin.y);

    // Draw axis
    var arrowLen = scaleFactor * 1.5;
    var axisStart = {x: largerRadius, y: 0};
    var axisEnd = {x: largerRadius, y: -maxHeightSlider.currentVal};
    a.line(axisStart.x, axisStart.y, axisEnd.x, axisEnd.y);
    a.line(axisStart.x, axisStart.y, axisStart.x - arrowLen, axisStart.y - arrowLen);
    a.line(axisStart.x, axisStart.y, axisStart.x + arrowLen, axisStart.y - arrowLen);
    a.line(axisEnd.x, axisEnd.y, axisEnd.x - arrowLen, axisEnd.y + arrowLen);
    a.line(axisEnd.x, axisEnd.y, axisEnd.x + arrowLen, axisEnd.y + arrowLen);

    // Label axis
    a.noStroke();
    a.fill(0);
    a.text((maxHeightSlider.currentVal/(scaleFactor*2)).toFixed(1) + '\"', axisStart.x, axisStart.y - maxHeightSlider.currentVal/2);

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

  function createSlider(_name, _xPos, _yPos, _minVal, _maxVal) {
    var sliderRange = _maxVal - _minVal;
    var midVal = (_maxVal + _minVal)/2;
    //return {name: _name, xPos: _xPos, yPos: _yPos, minVal: _minVal, maxVal: _maxVal, currentVal: (_maxVal + _minVal)/2 };
    return {name: _name, 
            xPos: _xPos, 
            yPos: _yPos, 
            minVal: _minVal, 
            maxVal: _maxVal, 
            currentVal: midVal + a.random(-sliderRange / 4, sliderRange / 4) 
    };
  }

  function createButton(_name, _xPos, _yPos) {
    return {name: _name, xPos: _xPos, yPos: _yPos};
  }

  function rotatePoint(myPoint, center, angle) {
    var rotatedX = (myPoint.x - center.x)*a.cos(angle) - (myPoint.y - center.y)*a.sin(angle) + center.x;
    var rotatedY = (myPoint.x - center.x)*a.sin(angle) + (myPoint.y - center.y)*a.cos(angle) + center.y;
    return {x: rotatedX, y: rotatedY};
  }

  function drawGui() {
    if (!purchasedFlag) {
      // Draw button/ slider rectangles
      a.stroke(0);
      a.fill(steelColor);
      a.rect(maxHeightSlider.xPos, maxHeightSlider.yPos, sliderWidth, sliderHeight);
      a.rect(purchaseButton.xPos, purchaseButton.yPos, sliderWidth, sliderHeight);

      // Label buttons/ sliders
      a.noStroke();
      a.fill(0);
      a.textSize(guiLabelSize);
      a.textAlign(a.LEFT);
      var textOffset = sliderHeight - (sliderHeight - guiLabelSize) / 2 - 2;
      a.text("Max height:", guiMargins + guiTextPadding, maxHeightSlider.yPos + textOffset);
      a.text("Add to cart: $" + totalCost.toFixed(2), guiMargins + guiTextPadding, purchaseButton.yPos + textOffset);

      // Draw the sliders
      a.stroke(0);
      a.line(sliderStart, maxHeightSlider.yPos + sliderHeight/2, sliderEnd, maxHeightSlider.yPos + sliderHeight/2);
      a.strokeWeight(3);

      var maxHeightSliderTickPos = a.map(maxHeightSlider.currentVal, maxHeightSlider.minVal, maxHeightSlider.maxVal, sliderStart, sliderEnd);
      a.line(maxHeightSliderTickPos, maxHeightSliderY + sliderTickPadding, maxHeightSliderTickPos, maxHeightSliderY + sliderHeight - sliderTickPadding);
    

    }

    else {
      // Draw and label final button
      a.stroke(0);
      a.fill(0);
      a.rect(finalButton.xPos, finalButton.yPos, sliderWidth, sliderHeight);
      a.noStroke();
      a.fill(255);
      a.textSize(guiLabelSize);
      a.textAlign(a.LEFT);
      var textOffset = sliderHeight - (sliderHeight - guiLabelSize) / 2 - 2;
      a.text("Confirm purchase: $" + totalCost.toFixed(2), guiMargins + guiTextPadding, finalButton.yPos + textOffset);

      // Draw and label go back button
      a.stroke(0);
      a.fill(steelColor);
      a.rect(goBackButton.xPos, goBackButton.yPos, sliderWidth, sliderHeight);
      a.noStroke();
      a.fill(0);
      a.text("Return to editor", guiMargins + guiTextPadding, goBackButton.yPos + textOffset);
    }

    a.stroke(0);
    a.strokeWeight(1);
  }

  function axonSliders() {
    if (a.mouseX >= sliderStart && a.mouseX <= sliderEnd && !purchasedFlag) {

      // maxHeightSlider
      if (a.mouseY >= maxHeightSlider.yPos && a.mouseY <= maxHeightSlider.yPos + sliderHeight) {
        maxHeightSlider.currentVal = a.map(a.mouseX, sliderStart, sliderEnd, maxHeightSlider.minVal, maxHeightSlider.maxVal);
      }
    }
  }

  function axonButtons() {
    if (a.mouseX >= guiMargins && a.mouseX <= guiMargins + sliderWidth) {

      if (a.mouseY >= purchaseButton.yPos && a.mouseY <= purchaseButton.yPos + sliderHeight) {
        if (!purchasedFlag) {
          purchasedFlag = true;
        }
        else {
          purchasedFlag = false;
        }
      }

      if (a.mouseY >= finalButton.yPos && a.mouseY <= finalButton.yPos + sliderHeight && purchasedFlag) {
        finalFlag = true;
      }
    }
  }

  var totalCost = 0;
  function calcCost(translatedRods) {
    var baseCost = 60;
    var areaCost = roughBaseArea/40;
    var rodLaborCost = translatedRods.length * 10;
    var rodMaterialCost = 0;
    for (var i = 0; i < translatedRods.length; i++) {
      rodMaterialCost += translatedRods[i].rodHeight / 40;
    }
    totalCost = baseCost + areaCost + rodLaborCost + rodMaterialCost;
  }
};

let axonP5 = new p5(axonSketch);