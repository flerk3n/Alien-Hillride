// Custom Play Screen Module
// This file creates a custom play screen overlay using PNG images

class PlayScreen {
  constructor() {
    this.visible = false; // Start hidden until game is ready
    this.playButtonX = 0;
    this.playButtonY = 0;
    this.playButtonWidth = 250;
    this.playButtonHeight = 100;
    this.isHovered = false;
    this.buttonScale = 1.0;
    this.targetScale = 1.0;
    this.initialized = false;
  }

  preload() {
    // No images to preload - using custom graphics only
    console.log("Play screen: Preload called - using custom graphics");
  }

  setup() {
    console.log("Play screen: Setup called - no images to load");
    
    // Show play screen by default when setting up
    this.visible = true;
    console.log("Play screen: Setting up, visible =", this.visible);
    
    // Only hide if game has already started
    if (typeof gameStarted !== 'undefined' && gameStarted) {
      this.visible = false;
      console.log("Play screen: Game already started, hiding play screen");
    }
    
    // Calculate button position (center of screen)
    if (typeof width !== 'undefined' && typeof height !== 'undefined') {
      this.playButtonX = width / 2;
      this.playButtonY = height / 2 - 50; // Slightly above center
      console.log("Play screen: Button positioned at", this.playButtonX, this.playButtonY);
    }
    this.initialized = true;
    console.log("Play screen: Initialization complete");
  }

  update() {
    if (!this.initialized || !this.visible) return;
    
    // Smooth scaling animation for button hover effect
    this.buttonScale = lerp(this.buttonScale, this.targetScale, 0.1);
    
    // Check if mouse is over the play button
    let mouseOverButton = this.isMouseOverButton();
    if (mouseOverButton && !this.isHovered) {
      this.isHovered = true;
      this.targetScale = 1.15; // Increased from 1.1 for better hover effect
    } else if (!mouseOverButton && this.isHovered) {
      this.isHovered = false;
      this.targetScale = 1.0; // Scale back to normal
    }
  }

  draw() {
    if (!this.visible || !this.initialized) {
      console.log("Play screen: Not drawing - visible:", this.visible, "initialized:", this.initialized);
      return;
    }

    console.log("Play screen: Drawing play screen");

    // Draw the play screen background
    push();
    fill(20, 30, 60); // Dark blue background
    rect(0, 0, width, height);
    
    // Add some stars for atmosphere
    fill(255, 255, 255);
    for (let i = 0; i < 50; i++) {
      let x = (i * 123.4567) % width; // Pseudo-random positions
      let y = (i * 78.9012) % height;
      ellipse(x, y, 2, 2);
    }
    pop();

    // Draw the play button
    push();
    translate(this.playButtonX, this.playButtonY);
    scale(this.buttonScale);
    
    // Add a subtle glow effect when hovered
    if (this.isHovered) {
      drawingContext.shadowColor = 'rgba(0, 255, 0, 0.6)';
      drawingContext.shadowBlur = 25;
    }
    
    // Button background
    fill(0, 150, 0); // Green button
    stroke(255);
    strokeWeight(3);
    rectMode(CENTER);
    rect(0, 0, this.playButtonWidth, this.playButtonHeight, 15);
    
    // Button text
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    textStyle(BOLD);
    text("PLAY", 0, 0);
    
    // Reset shadow
    drawingContext.shadowColor = 'transparent';
    drawingContext.shadowBlur = 0;
    
    pop();

    // Draw level information below the button
    this.drawLevelInfo();
  }

  drawLevelInfo() {
    if (typeof currentLevel === 'undefined' || typeof levels === 'undefined') return;
    
    push();
    // Style for level info text
    textAlign(CENTER, CENTER);
    textSize(24);
    fill(255, 255, 255);
    stroke(0, 0, 0);
    strokeWeight(2);

    // Level name and number
    let levelText = `Level ${currentLevel + 1}: ${levels[currentLevel].name}`;
    text(levelText, width / 2, this.playButtonY + 80);

    // Additional info in smaller text
    textSize(16);
    fill(255, 255, 0);
    text("Use arrow keys, pedals, or controller triggers", width / 2, this.playButtonY + 120);
    
    // Reset to level 1 instruction
    textSize(14);
    fill(200, 200, 200);
    text("Press '1' to reset to Level 1", width / 2, this.playButtonY + 150);

    // Best score for current level
    if (typeof localStorage !== 'undefined') {
      let bestKey = `bestScore_level_${currentLevel}`;
      let currentBest = localStorage.getItem(bestKey) || 0;
      if (currentBest > 0) {
        textSize(18);
        fill(0, 255, 0);
        text(`Best Score: ${currentBest}m`, width / 2, this.playButtonY + 180);
      }
    }
    pop();
  }

  isMouseOverButton() {
    if (typeof mouseX === 'undefined' || typeof mouseY === 'undefined') return false;
    
    return mouseX >= this.playButtonX - this.playButtonWidth / 2 &&
           mouseX <= this.playButtonX + this.playButtonWidth / 2 &&
           mouseY >= this.playButtonY - this.playButtonHeight / 2 &&
           mouseY <= this.playButtonY + this.playButtonHeight / 2;
  }

  handleClick(mouseX, mouseY) {
    if (!this.visible || !this.initialized) return false;
    
    if (this.isMouseOverButton()) {
      this.startGame();
      return true; // Click was handled
    }
    return false; // Click was not handled
  }

  handleTouch(touchX, touchY) {
    if (!this.visible || !this.initialized) return false;
    
    // Convert touch coordinates to button area check
    if (touchX >= this.playButtonX - this.playButtonWidth / 2 &&
        touchX <= this.playButtonX + this.playButtonWidth / 2 &&
        touchY >= this.playButtonY - this.playButtonHeight / 2 &&
        touchY <= this.playButtonY + this.playButtonHeight / 2) {
      this.startGame();
      return true; // Touch was handled
    }
    return false; // Touch was not handled
  }

  startGame() {
    // Hide the play screen and start the game
    this.visible = false;
    
    // Set the game as started (this connects to the existing game logic)
    if (typeof window.gameStarted !== 'undefined') {
      window.gameStarted = true;
    }
    
    // Also ensure the game initializes if needed
    if (typeof window.initializeGame === 'function' && !window.gameStarted) {
      window.initializeGame();
    }
    
    console.log("Play screen: Starting game!");
  }

  show() {
    this.visible = true;
    // Reset game started state when showing play screen
    if (typeof window.gameStarted !== 'undefined') {
      window.gameStarted = false;
    }
  }

  hide() {
    this.visible = false;
  }

  resize() {
    // Recalculate button position when window is resized
    if (typeof width !== 'undefined' && typeof height !== 'undefined') {
      this.playButtonX = width / 2;
      this.playButtonY = height / 2 - 50;
    }
  }
}

// Global play screen instance
let customPlayScreen;

// Integration functions to connect with existing game code
function initCustomPlayScreen() {
  if (!customPlayScreen) {
    customPlayScreen = new PlayScreen();
  }
}

function preloadCustomPlayScreen() {
  if (customPlayScreen) {
    customPlayScreen.preload();
  }
}

function setupCustomPlayScreen() {
  if (customPlayScreen) {
    customPlayScreen.setup();
  }
}

function updateCustomPlayScreen() {
  if (customPlayScreen && customPlayScreen.visible) {
    customPlayScreen.update();
  }
}

function drawCustomPlayScreen() {
  if (customPlayScreen && customPlayScreen.visible) {
    customPlayScreen.draw();
  }
}

function handleCustomPlayScreenClick(mouseX, mouseY) {
  if (customPlayScreen) {
    return customPlayScreen.handleClick(mouseX, mouseY);
  }
  return false;
}

function handleCustomPlayScreenTouch(touchX, touchY) {
  if (customPlayScreen) {
    return customPlayScreen.handleTouch(touchX, touchY);
  }
  return false;
}

function showCustomPlayScreen() {
  if (customPlayScreen) {
    customPlayScreen.show();
  }
}

function hideCustomPlayScreen() {
  if (customPlayScreen) {
    customPlayScreen.hide();
  }
}

function resizeCustomPlayScreen() {
  if (customPlayScreen) {
    customPlayScreen.resize();
  }
} 