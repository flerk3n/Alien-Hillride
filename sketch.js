//Hill Climb Racing - Manual Control Version with Levels

// Initialize Box2D variables immediately
var Vec2, b2BodyDef, b2Body, b2FixtureDef, b2Fixture, b2World, b2MassData;
var b2PolygonShape, b2CircleShape, b2EdgeChainDef, b2DebugDraw;
var b2StaticBody, b2DynamicBody, b2RevoluteJoint, b2RevoluteJointDef;
var b2PrismaticJoint, b2PrismaticJointDef, b2FilterData;
var b2DistanceJoint, b2DistanceJointDef, b2WeldJoint, b2WeldJointDef;

// Initialize Box2D as soon as possible
function initBox2D() {
  if (typeof Box2D === 'undefined') {
    console.error('Box2D library not loaded!');
    return false;
  }
  
  Vec2 = Box2D.Common.Math.b2Vec2;
  b2BodyDef = Box2D.Dynamics.b2BodyDef;
  b2Body = Box2D.Dynamics.b2Body;
  b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
  b2Fixture = Box2D.Dynamics.b2Fixture;
  b2World = Box2D.Dynamics.b2World;
  b2MassData = Box2D.Collision.Shapes.b2MassData;
  b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
  b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
  b2EdgeChainDef = Box2D.Collision.Shapes.b2EdgeChainDef;

  b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
  b2StaticBody = Box2D.Dynamics.b2Body.b2_staticBody;
  b2DynamicBody = Box2D.Dynamics.b2Body.b2_dynamicBody;
  b2RevoluteJoint = Box2D.Dynamics.Joints.b2RevoluteJoint;
  b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;

  b2PrismaticJoint = Box2D.Dynamics.Joints.b2PrismaticJoint;
  b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;
  b2FilterData = Box2D.Dynamics.b2FilterData;
  b2DistanceJoint = Box2D.Dynamics.Joints.b2DistanceJoint;
  b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef;
  b2WeldJoint = Box2D.Dynamics.Joints.b2WeldJoint;
  b2WeldJointDef = Box2D.Dynamics.Joints.b2WeldJointDef;
  
  return true;
}

// Call initBox2D immediately when script loads, but handle the case where Box2D isn't ready yet
if (typeof Box2D !== 'undefined') {
  initBox2D();
} else {
  console.log('Box2D not yet loaded, will initialize in setup()');
}

//------------------------------------------GLOBALS
var SCALE = 30;
var groundBody;
var wheels = [];
var groundTemplate;
var difficulty = 50; // Default difficulty level for terrain generation

var panX = 0;
var targetPanX = 0;
var maxPanSpeed = 100;
var panSpeed = 150;
var panAcc = 10;
var panY = 0;

var listener = new Box2D.Dynamics.b2ContactListener;

var carSprite;
var headSprite;
var cbHead = false;
var wheelSprite;
var shownGround = false;

var spawningY = 0;

//collision categories
var WHEEL_CATEGORY = 0x0001;
var CHASSIS_CATEGORY = 0X0002;
var GRASS_CATEGORY = 0X0004;
var DIRT_CATEGORY = 0x0008;
var PERSON_CATEGORY = 0x0010;
var FLAG_CATEGORY = 0x0020;

//collision Masks
var WHEEL_MASK = (GRASS_CATEGORY);
var CHASSIS_MASK = (DIRT_CATEGORY | FLAG_CATEGORY);
var GRASS_MASK = (WHEEL_CATEGORY | PERSON_CATEGORY);
var DIRT_MASK = (CHASSIS_CATEGORY);
var PERSON_MASK = (GRASS_CATEGORY);
var FLAG_MASK = (CHASSIS_CATEGORY);

// Game variables
var world;
var ground;
var car;
var finishFlag;
var gameStarted = false;
var gameOver = false;
var levelCompleted = false;
var finalScore = 0;
var bestScore = 0;

// Level system
var currentLevel = 0;
var maxLevel = 10;
var levelDistance = 2000; // Each level is 2000m
var flagSprite;

var skySprite;
var darknessSprite;
var grassSprites = [];

// Level system variables
var levels = [
  { name: "Beginner Hills", difficulty:50, maxDistance: 10000 },
  { name: "Rocky Roads", difficulty: 70, maxDistance: 15000 },
  { name: "Mountain Pass", difficulty: 80, maxDistance: 18000 },
  { name: "Extreme Cliffs", difficulty: 110, maxDistance: 20000 },
  { name: "Death Valley", difficulty: 130, maxDistance: 25000 }
];

var maxDistanceReached = 0;
var levelBestScores = new Array(levels.length).fill(0);

// UI elements
var gasBtn, brakeBtn;
var levelInfoDiv, levelCompleteScreen, gameOverScreen;

// Game state variables
var lastCarX = 0;

// Control variables
var gasPressed = false;
var brakePressed = false;

// Controller support variables
var gamepadConnected = false;
var gamepadIndex = -1;

// Touch/mouse control state tracking
var touchGasPressed = false;
var touchBrakePressed = false;

// Gas and brake intensity tracking (0-100%)
var gasIntensity = 0;
var brakeIntensity = 0;

// UI elements for indicators
var gasFill, gasPercentage, brakeFill, brakePercentage;

// Load best level from localStorage
function loadProgress() {
  const savedLevel = localStorage.getItem('hillClimbCurrentLevel');
  const savedBestScores = localStorage.getItem('levelBestScores');
  
  if (savedLevel) {
    currentLevel = Math.min(parseInt(savedLevel), levels.length - 1);
  }
  if (savedBestScores) {
    levelBestScores = JSON.parse(savedBestScores);
  }
}

// Flag class for finish line
class FinishFlag {
  constructor(x, y, world) {
    this.x = x;
    this.y = y;
    this.world = world;
    this.id = "flag";
    this.body;
    this.width = 20;
    this.height = 60;
    this.makeBody();
  }
  
  makeBody() {
    var bodyDef = new b2BodyDef();
    bodyDef.type = b2StaticBody;
    bodyDef.position.x = this.x / SCALE;
    bodyDef.position.y = this.y / SCALE;
    
    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.3;
    fixDef.restitution = 0.2;
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(this.width / 2 / SCALE, this.height / 2 / SCALE);
    
    this.body = this.world.CreateBody(bodyDef);
    this.body.SetUserData(this);
    
    var filtData = new b2FilterData();
    filtData.categoryBits = FLAG_CATEGORY;
    filtData.maskBits = FLAG_MASK;
    this.body.CreateFixture(fixDef).SetFilterData(filtData);
  }
  
  show() {
    let x = this.body.GetPosition().x * SCALE;
    let y = this.body.GetPosition().y * SCALE;
    
    push();
    translate(x - panX, y - panY);
    
    // Flag pole
    fill(139, 69, 19); // Brown
    rect(-2, -this.height/2, 4, this.height);
    
    // Flag
    fill(255, 0, 0); // Red flag
    rect(2, -this.height/2, 30, 20);
    
    // Flag text
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(8);
    text("FINISH", 17, -this.height/2 + 10);
    
    pop();
  }
}

listener.BeginContact = function(contact) {
  var userData1 = contact.GetFixtureA().GetBody().GetUserData();
  var userData2 = contact.GetFixtureB().GetBody().GetUserData();
  
  // Check for head collision with ground
  if (userData1 && userData1.id == "head" && userData2 && userData2.id == "ground") {
    if (contact.GetFixtureA().GetBody().GetJointList() == null) return;
    gameOver = true;
    showGameOverScreen();
  }
  
  if (userData2 && userData2.id == "head" && userData1 && userData1.id == "ground") {
    if (contact.GetFixtureB().GetBody().GetJointList() == null) return;
    gameOver = true;
    showGameOverScreen();
  }
  
  // Check for car collision with finish flag
  if (userData1 && userData1.id == "chassis" && userData2 && userData2.id == "flag") {
    levelCompleted = true;
    showLevelCompleteScreen();
  }
  
  if (userData2 && userData2.id == "chassis" && userData1 && userData1.id == "flag") {
    levelCompleted = true;
    showLevelCompleteScreen();
  }

  // Wheel collision with ground
  if (userData1 && userData1.id == "wheel" && userData2 && userData2.id == "ground") {
    userData1.onGround = true;
  }

  if (userData2 && userData2.id == "wheel" && userData1 && userData1.id == "ground") {
    userData2.onGround = true;
  }
}

listener.EndContact = function(contact) {
  var userData1 = contact.GetFixtureA().GetBody().GetUserData();
  var userData2 = contact.GetFixtureB().GetBody().GetUserData();
  
  if (userData1 && userData1.id == "wheel" && userData2 && userData2.id == "ground") {
    userData1.onGround = false;
  }

  if (userData2 && userData2.id == "wheel" && userData1 && userData1.id == "ground") {
    userData2.onGround = false;
  }
}

function preload() {
  carSprite = loadImage("Pics/car.png");
  headSprite = loadImage("Pics/head.png");
  wheelSprite = loadImage("Pics/wheel.png");
  skySprite = loadImage("Pics/sky.png");
  darknessSprite = loadImage("Pics/darkness.png");

  // Load the available grass sprites
  grassSprites[0] = loadImage("Pics/grass.png");
  grassSprites[1] = loadImage("Pics/grass2.png");
  grassSprites[2] = loadImage("Pics/grass3.png");
  grassSprites[3] = loadImage("Pics/grass4.png");
  grassSprites[4] = loadImage("Pics/grass5.png");
}

function setup() {
  canvas = createCanvas(window.innerWidth, window.innerHeight);
  canvas.parent('gameCanvas');
  
  // Ensure Box2D is initialized
  if (typeof Vec2 === 'undefined') {
    if (!initBox2D()) {
      console.error('Failed to initialize Box2D');
      return;
    }
  }
  
  // Initialize UI elements
  gasBtn = document.getElementById('gasBtn');
  brakeBtn = document.getElementById('brakeBtn');
  levelInfoDiv = document.getElementById('levelInfo');
  levelCompleteScreen = document.getElementById('levelCompleteScreen');
  gameOverScreen = document.getElementById('gameOverScreen');
  
  // Initialize indicator elements
  gasFill = document.getElementById('gasFill');
  gasPercentage = document.getElementById('gasPercentage');
  brakeFill = document.getElementById('brakeFill');
  brakePercentage = document.getElementById('brakePercentage');
  
  // Load saved progress
  loadProgress();
  
  // Set up gamepad event listeners
  setupGamepadSupport();
  
  initializeGame();
}

// Gamepad support functions
function setupGamepadSupport() {
  window.addEventListener('gamepadconnected', function(e) {
    gamepadConnected = true;
    gamepadIndex = e.gamepad.index;
    console.log('Gamepad connected:', e.gamepad.id);
  });
  
  window.addEventListener('gamepaddisconnected', function(e) {
    if (e.gamepad.index === gamepadIndex) {
      gamepadConnected = false;
      gamepadIndex = -1;
      console.log('Gamepad disconnected');
    }
  });
}

function pollGamepad() {
  // Reset controller inputs each frame
  var gasFromController = false;
  var brakeFromController = false;
  
  if (gamepadConnected && gamepadIndex !== -1) {
    var gamepads = navigator.getGamepads();
    if (gamepads && gamepads[gamepadIndex]) {
      var gamepad = gamepads[gamepadIndex];
      
      // Right trigger (index 7) for gas - threshold 0.1 to avoid drift
      var rightTrigger = gamepad.buttons[7] ? gamepad.buttons[7].value : 0;
      if (rightTrigger > 0.1) {
        gasFromController = true;
        // For controller, set intensity directly (no smoothing needed)
        gasIntensity = Math.max(0, Math.min(100, rightTrigger * 100));
      }
      
      // Left trigger (index 6) for brake - threshold 0.1 to avoid drift  
      var leftTrigger = gamepad.buttons[6] ? gamepad.buttons[6].value : 0;
      if (leftTrigger > 0.1) {
        brakeFromController = true;
        // For controller, set intensity directly (no smoothing needed)
        brakeIntensity = Math.max(0, Math.min(100, leftTrigger * 100));
      }
    }
  }
  
  // Update global control states (combine with existing keyboard/touch controls)
  gasPressed = gasPressed || gasFromController;
  brakePressed = brakePressed || brakeFromController;
}

function initializeGame() {
  // Reset game state
  gameStarted = false;
  gameOver = false;
  levelCompleted = false;
  maxDistanceReached = 0;
  hideGameOverScreen();
  hideLevelCompleteScreen();
  
  // Create Box2D world
  let gravity = new Vec2(0, 5);
  world = new b2World(gravity, true);
  
  // Generate terrain for current level
  ground = new Ground(world);
  ground.generateLevelTerrain(levels[currentLevel].difficulty, currentLevel, levels[currentLevel].maxDistance);
  ground.setBodies(world);
  
  // Create finish flag at the end of the level
  finishFlag = new FinishFlag(levels[currentLevel].maxDistance - 100, spawningY - 100, world);
  
  // Use the spawningY that was already calculated by Ground.js
  console.log("Car spawning at Y:", spawningY);
  
  // Create car at the beginning of the terrain (x=300 to be safely on terrain with more clearance)
  car = new Car(300, spawningY, world);
  
  // Set collision handler
  world.SetContactListener(listener);
  
  // Reset camera to follow car from the beginning
  panX = -300; // Follow the car's starting position at x=300
  panY = -canvas.height / 2;
  
  // Reset UI
  updateUI();
}

function draw() {
  if (!gameStarted && !gameOver && !levelCompleted) {
    background(135, 206, 235); // Sky blue
    
    // Show start screen
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Hill Climb Racing", width/2, height/2 - 100);
    textSize(18);
    text(`Level ${currentLevel + 1}: ${levels[currentLevel].name}`, width/2, height/2 - 50);
    text("Press SPACE to start or use the gas pedal", width/2, height/2);
    text("Use gas and brake pedals, arrow keys, or controller triggers", width/2, height/2 + 50);
    return;
  }
  
  if (gameOver || levelCompleted) {
    return; // Don't update game when over or completed
  }
  
  // Reset control states each frame
  gasPressed = false;
  brakePressed = false;
  
  // Smooth intensity changes (gradual increase/decrease)
  var targetGasIntensity = 0;
  var targetBrakeIntensity = 0;
  
  // Check keyboard input
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(32)) { // Right arrow or spacebar for gas
    gasPressed = true;
    targetGasIntensity = 100; // Target full intensity for keyboard
  }
  if (keyIsDown(LEFT_ARROW)) { // Left arrow for brake
    brakePressed = true;
    targetBrakeIntensity = 100; // Target full intensity for keyboard
  }
  
  // Check touch/mouse input
  if (touchGasPressed) {
    gasPressed = true;
    targetGasIntensity = 100; // Target full intensity for touch
  }
  if (touchBrakePressed) {
    brakePressed = true;
    targetBrakeIntensity = 100; // Target full intensity for touch
  }
  
  // Poll gamepad for trigger input (this will override targets if controller is used)
  var controllerActive = false;
  if (gamepadConnected && gamepadIndex !== -1) {
    var gamepads = navigator.getGamepads();
    if (gamepads && gamepads[gamepadIndex]) {
      var gamepad = gamepads[gamepadIndex];
      var rightTrigger = gamepad.buttons[7] ? gamepad.buttons[7].value : 0;
      var leftTrigger = gamepad.buttons[6] ? gamepad.buttons[6].value : 0;
      controllerActive = rightTrigger > 0.1 || leftTrigger > 0.1;
    }
  }
  
  pollGamepad();
  
  // Smooth transitions for intensity values (only when controller is not active)
  if (!controllerActive) {
    var intensityChangeSpeed = 3; // Slower change for more visible control
    
    if (targetGasIntensity > gasIntensity) {
      gasIntensity = Math.min(targetGasIntensity, gasIntensity + intensityChangeSpeed);
    } else if (targetGasIntensity < gasIntensity) {
      gasIntensity = Math.max(targetGasIntensity, gasIntensity - intensityChangeSpeed);
    }
    
    if (targetBrakeIntensity > brakeIntensity) {
      brakeIntensity = Math.min(targetBrakeIntensity, brakeIntensity + intensityChangeSpeed);
    } else if (targetBrakeIntensity < brakeIntensity) {
      brakeIntensity = Math.max(targetBrakeIntensity, brakeIntensity - intensityChangeSpeed);
    }
  }
  
  // Update visual indicators
  updateIndicators();
  
  // Update physics
  world.Step(1 / 60, 10, 10);
  world.ClearForces();
  
  // Update car
  car.update();
  
  // Check for car death
  if (car.dead) {
    gameOver = true;
    showGameOverScreen();
    return;
  }
  
  // Handle manual controls
  if (gasPressed) {
    car.motorOn(true);
  } else if (brakePressed) {
    car.motorOn(false);
  } else {
    car.motorOff();
  }
  
  // Calculate distance traveled
  let carX = car.chassisBody.GetPosition().x * SCALE;
  maxDistanceReached = Math.max(maxDistanceReached, Math.floor(carX / 100 * 10) / 10);
  
  // Check for level completion
  if (maxDistanceReached >= levels[currentLevel].maxDistance / 100) {
    levelCompleted = true;
    showLevelCompleteScreen();
    return;
  }
  
  // Update camera to follow car
  targetPanX = carX - width / 2;
  panX = lerp(panX, targetPanX, 0.1);
  
  // Keep panY relatively stable
  let carY = car.chassisBody.GetPosition().y * SCALE;
  panY = lerp(panY, carY - height * 0.7, 0.05);
  
  // Draw background
  background(135, 206, 235); // Sky blue
  
  // Draw terrain
  ground.show();
  
  // Draw finish flag
  finishFlag.show();
  
  // Draw car
  car.show();
  
  // Update UI
  updateUI();
}

function updateUI() {
  // Update distance display
  document.getElementById('distance').textContent = maxDistanceReached.toFixed(1) + 'm';
  
  // Update speed (simple calculation based on velocity)
  let speed = Math.abs(car.chassisBody.GetLinearVelocity().x * 3.6 * SCALE / 100);
  document.getElementById('speed').textContent = speed.toFixed(0) + ' km/h';
  
  // Update remaining distance
  let remaining = Math.max(0, (levels[currentLevel].maxDistance / 100) - maxDistanceReached);
  document.getElementById('remainingDistance').textContent = remaining.toFixed(0) + 'm';
}

function updateLevelUI() {
  document.getElementById('currentLevelNum').textContent = currentLevel + 1;
  document.getElementById('currentLevelName').textContent = levels[currentLevel].name;
  document.getElementById('levelBestScore').textContent = levelBestScores[currentLevel].toFixed(1) + 'm';
}

function showGameOverScreen() {
  let gameOverScreen = document.getElementById('gameOverScreen');
  let finalDistance = document.getElementById('finalDistance');
  let bestScore = document.getElementById('bestScore');
  
  let distance = Math.floor(car.maxDistance);
  finalDistance.textContent = distance + 'm';
  
  // Save best score for this level
  let bestKey = `bestScore_level_${currentLevel}`;
  let currentBest = localStorage.getItem(bestKey) || 0;
  if (distance > currentBest) {
    localStorage.setItem(bestKey, distance);
    bestScore.textContent = distance + 'm (NEW BEST!)';
  } else {
    bestScore.textContent = currentBest + 'm';
  }
  
  gameOverScreen.style.display = 'flex';
}

function hideGameOverScreen() {
  let gameOverScreen = document.getElementById('gameOverScreen');
  gameOverScreen.style.display = 'none';
}

function showLevelCompleteScreen() {
  let levelCompleteScreen = document.getElementById('levelCompleteScreen');
  let completedLevelName = document.getElementById('completedLevelName');
  let completedDistance = document.getElementById('completedDistance');
  let completedBestScore = document.getElementById('completedBestScore');
  let nextLevelBtn = document.getElementById('nextLevelBtn');
  
  let distance = Math.floor(car.maxDistance);
  completedLevelName.textContent = `Level ${currentLevel + 1} Complete!`;
  completedDistance.textContent = distance + 'm';
  
  // Save best score for this level
  let bestKey = `bestScore_level_${currentLevel}`;
  let currentBest = localStorage.getItem(bestKey) || 0;
  if (distance > currentBest) {
    localStorage.setItem(bestKey, distance);
    completedBestScore.textContent = distance + 'm (NEW BEST!)';
  } else {
    completedBestScore.textContent = currentBest + 'm';
  }
  
  // Show/hide next level button based on available levels
  if (currentLevel < levels.length - 1) {
    nextLevelBtn.style.display = 'block';
  } else {
    nextLevelBtn.style.display = 'none';
  }
  
  levelCompleteScreen.style.display = 'flex';
}

function hideLevelCompleteScreen() {
  let levelCompleteScreen = document.getElementById('levelCompleteScreen');
  levelCompleteScreen.style.display = 'none';
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function keyPressed() {
  if (key === ' ' || keyCode === UP_ARROW) {
    if (!gameStarted && !gameOver && !levelCompleted) {
      gameStarted = true;
    }
    // Gas control now handled in draw loop
  } else if (key === 'r' || key === 'R') {
    restartLevel();
  } else if (key === 'n' || key === 'N') {
    if (levelCompleted && currentLevel < levels.length - 1) {
      nextLevel();
    }
  }
}

function keyReleased() {
  // Control input now handled in draw loop with keyIsDown()
  // No need to manually track key releases
}

function restartLevel() {
  gameOverScreen.style.display = 'none';
  levelCompleteScreen.style.display = 'none';
  initializeGame();
}

function nextLevel() {
  if (currentLevel < levels.length - 1) {
    currentLevel++;
    localStorage.setItem('hillClimbCurrentLevel', currentLevel.toString());
    levelCompleteScreen.style.display = 'none';
    initializeGame();
  }
}

// Event listeners for UI controls
document.addEventListener('DOMContentLoaded', function() {
  // Gas pedal controls
  const gasBtn = document.getElementById('gasBtn');
  if (gasBtn) {
    gasBtn.addEventListener('mousedown', function() {
      if (!gameStarted && !gameOver && !levelCompleted) {
        gameStarted = true;
      } else {
        touchGasPressed = true;
      }
    });
    
    gasBtn.addEventListener('mouseup', function() {
      touchGasPressed = false;
    });
    
    gasBtn.addEventListener('mouseleave', function() {
      touchGasPressed = false;
    });
    
    gasBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      if (!gameStarted && !gameOver && !levelCompleted) {
        gameStarted = true;
      } else {
        touchGasPressed = true;
      }
    });
    
    gasBtn.addEventListener('touchend', function(e) {
      e.preventDefault();
      touchGasPressed = false;
    });
  }
  
  // Brake pedal controls
  const brakeBtn = document.getElementById('brakeBtn');
  if (brakeBtn) {
    brakeBtn.addEventListener('mousedown', function() {
      touchBrakePressed = true;
    });
    
    brakeBtn.addEventListener('mouseup', function() {
      touchBrakePressed = false;
    });
    
    brakeBtn.addEventListener('mouseleave', function() {
      touchBrakePressed = false;
    });
    
    brakeBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      touchBrakePressed = true;
    });
    
    brakeBtn.addEventListener('touchend', function(e) {
      e.preventDefault();
      touchBrakePressed = false;
    });
  }
  
  // Restart button
  const restartBtn = document.getElementById('restartBtn');
  if (restartBtn) {
    restartBtn.addEventListener('click', restartLevel);
  }
  
  // Next level button
  const nextLevelBtn = document.getElementById('nextLevelBtn');
  if (nextLevelBtn) {
    nextLevelBtn.addEventListener('click', nextLevel);
  }
  
  // Restart current level button
  const restartCurrentBtn = document.getElementById('restartCurrentBtn');
  if (restartCurrentBtn) {
    restartCurrentBtn.addEventListener('click', restartLevel);
  }
});

// Function to update the visual indicators
function updateIndicators() {
  if (gasFill && gasPercentage && brakeFill && brakePercentage) {
    // Update gas indicator
    gasFill.style.height = gasIntensity + '%';
    gasPercentage.textContent = Math.round(gasIntensity) + '%';
    
    // Update brake indicator
    brakeFill.style.height = brakeIntensity + '%';
    brakePercentage.textContent = Math.round(brakeIntensity) + '%';
  }
}
