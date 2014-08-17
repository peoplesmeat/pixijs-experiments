"use strict";

// create an new instance of a pixi stage
var stage = new PIXI.Stage(0x660099);

// create a renderer instance.

var width = $(window).width()-100;
var height = 450;
var renderer = PIXI.autoDetectRenderer(width, height, null, false, true);

$( window ).resize(function() {
    width = $(window).width() - 100;
    renderer.resize(width, height);
});

// add the renderer view element to the DOM
document.getElementById("render").appendChild(renderer.view);

requestAnimFrame( animate );

// create a texture from an image path
var texture = PIXI.Texture.fromImage("/images/bunny.png");
// create a new Sprite using the texture

var bunnies = [];

function drawLine(fromX, fromY, toX, toY) {
    var graphics = new PIXI.Graphics();
    graphics.beginFill(0x00FF00);
    graphics.lineStyle(3, Math.random() * 0xFFFFFF, 1);
    graphics.moveTo(fromX,fromY);
    graphics.lineTo(toX, toY);
    graphics.endFill();
    stage.addChild(graphics);
}

function angleBetweenPoints(points) {
    var p1 = {
        x: points[0].x - points[1].x,
        y: points[0].y - points[1].y
    }

    var p2 = {
        x: points[2].x - points[1].x,
        y: points[2].y - points[1].y
    }

    // angle in degrees
    var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;

    return angleDeg;
}

function cross(o, a, b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

//http://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Convex_hull/Monotone_chain
function convexHull(points) {
    var sortedPoints = _.sortBy(points, function(point) { return point.x});

    var upper = [];

    for (var i=0; i<sortedPoints.length; i++) {
        while (upper.length >= 2 && cross(upper[upper.length-2], upper[upper.length-1], sortedPoints[i]) <= 0) {
            upper.pop();
        }
        upper.push(sortedPoints[i]);
    }

    var lower = [];
    var reverseSortedPoints = sortedPoints.reverse();
    for (var i=0; i<sortedPoints.length; i++) {
        while (lower.length >= 2 && cross(lower[lower.length-2], lower[lower.length-1], reverseSortedPoints[i]) <= 0) {
            lower.pop()
        }
        lower.push(reverseSortedPoints[i]);
    }

    lower.shift();
    lower.pop();

    var hull = upper.concat(lower);

    return hull;
}


function createBunny() {
    var bunny = new PIXI.Sprite(texture);

    // center the sprites anchor point
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;

    bunny.spinFactor = Math.random()*0.4;

    // move the sprite t the center of the screen
    bunny.position.x = width * Math.random() * 0.9;
    bunny.position.y = height * Math.random() * 0.9;

    if (bunnies.length > 1) {
        var lastBunny = bunnies[bunnies.length-1];
       // drawLine(lastBunny.position.x, lastBunny.position.y, bunny.position.x, bunny.position.y)
    }

    bunnies.push(bunny)
    stage.addChild(bunny);
    return bunny;
}

createBunny();

function animate() {

    requestAnimFrame( animate );

    // just for fun, lets rotate mr rabbit a little
    bunnies.forEach(function(bunny){ bunny.rotation += bunny.spinFactor });

    // render the stage
    renderer.render(stage);
}

var listener = new window.keypress.Listener();

listener.simple_combo("a", function() {
    console.log("You pressed shift and s " + bunnies.length);
    for (var i=0; i<3; i++) {
        createBunny();
    }

    var hull = convexHull(_.map(bunnies, function(bunny) { return {
        x: bunny.position.x,
        y: bunny.position.y,
        bunny: bunny
    }}));

    for (var i=1; i<hull.length; i++) {
        drawLine(hull[i-1].x,hull[i-1].y, hull[i].x, hull[i].y);
    }
    drawLine(hull[hull.length-1].x,hull[hull.length-1].y, hull[0].x, hull[0].y);
});
