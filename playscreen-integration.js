// Play Screen Integration
// This file integrates the custom play screen with the existing game
// It minimally overrides functions to avoid disrupting physics

(function() {
  'use strict';
  
  // Store original functions
  let originalPreload = null;
  let originalDraw = null;
  let originalMousePressed = null;
  let originalTouchStarted = null;
  let originalWindowResized = null;

  // Flag to track if we've replaced the functions
  let functionsReplaced = false;
  let gameInitialized = false;

  function replaceGameFunctions() {
    if (functionsReplaced) return;

    // Store original functions if they exist
    if (typeof window.preload === 'function') {
      originalPreload = window.preload;
    }
    if (typeof window.draw === 'function') {
      originalDraw = window.draw;
    }
    if (typeof window.mousePressed === 'function') {
      originalMousePressed = window.mousePressed;
    }
    if (typeof window.touchStarted === 'function') {
      originalTouchStarted = window.touchStarted;
    }
    if (typeof window.windowResized === 'function') {
      originalWindowResized = window.windowResized;
    }

    // Replace preload function - but call original first
    window.preload = function() {
      console.log("Play screen integration: Preload function called");
      
      // ALWAYS call original preload first to ensure proper initialization
      if (originalPreload) {
        console.log("Play screen integration: Calling original preload");
        originalPreload();
      }
      
      // Then initialize custom play screen
      if (typeof initCustomPlayScreen === 'function') {
        console.log("Play screen integration: Initializing custom play screen");
        initCustomPlayScreen();
      }
      if (typeof preloadCustomPlayScreen === 'function') {
        console.log("Play screen integration: Preloading custom play screen");
        preloadCustomPlayScreen();
      }
    };

    // Replace draw function - but be careful not to interfere with physics
    window.draw = function() {
      // Always call original draw first to ensure physics updates
      if (originalDraw) originalDraw();
      
      // Draw play screen overlay if it exists and is visible
      if (typeof customPlayScreen !== 'undefined' && 
          customPlayScreen && 
          customPlayScreen.visible) {
        
        // Draw play screen as an overlay on top
        if (typeof updateCustomPlayScreen === 'function') {
          updateCustomPlayScreen();
        }
        if (typeof drawCustomPlayScreen === 'function') {
          drawCustomPlayScreen();
        }
      }
    };

    // Replace mousePressed function
    window.mousePressed = function() {
      // Check if custom play screen handles the click first
      if (typeof handleCustomPlayScreenClick === 'function' && 
          handleCustomPlayScreenClick(mouseX, mouseY)) {
        return; // Click was handled by play screen
      }
      
      // Call original mousePressed function
      if (originalMousePressed) originalMousePressed();
    };

    // Replace touchStarted function
    window.touchStarted = function() {
      // Check if custom play screen handles the touch
      if (typeof handleCustomPlayScreenTouch === 'function' && 
          touches && touches.length > 0) {
        let touch = touches[0];
        if (handleCustomPlayScreenTouch(touch.x, touch.y)) {
          return; // Touch was handled by play screen
        }
      }
      
      // Call original touchStarted function
      if (originalTouchStarted) originalTouchStarted();
    };

    // Replace windowResized function
    window.windowResized = function() {
      if (originalWindowResized) originalWindowResized();
      
      // Resize custom play screen
      if (typeof resizeCustomPlayScreen === 'function') {
        resizeCustomPlayScreen();
      }
    };

    functionsReplaced = true;
    console.log('Play screen integration: Functions replaced successfully');
  }

  // Function to show play screen when game restarts
  function onGameRestart() {
    if (typeof showCustomPlayScreen === 'function') {
      showCustomPlayScreen();
    }
  }

  // Function to hide play screen when game starts
  function onGameStart() {
    if (typeof hideCustomPlayScreen === 'function') {
      hideCustomPlayScreen();
    }
  }

  // Monitor game state changes
  function monitorGameState() {
    let lastGameStarted = false;
    let lastGameOver = false;
    
    setInterval(function() {
      if (typeof gameStarted !== 'undefined' && typeof gameOver !== 'undefined') {
        // Game was restarted
        if (lastGameOver && !gameOver && !gameStarted) {
          onGameRestart();
        }
        
        // Game was started
        if (!lastGameStarted && gameStarted) {
          onGameStart();
        }
        
        lastGameStarted = gameStarted;
        lastGameOver = gameOver;
      }
    }, 100);
  }

  // Wait for the page to load and then replace functions
  function initialize() {
    console.log("Play screen integration: Starting initialization");
    
    // Wait for DOM and scripts to be ready
    setTimeout(function() {
      replaceGameFunctions();
      
      // Setup play screen after a brief delay to ensure game is initialized
      setTimeout(function() {
        console.log("Play screen integration: Setting up custom play screen");
        
        if (typeof initCustomPlayScreen === 'function') {
          initCustomPlayScreen();
          console.log("Play screen integration: Custom play screen initialized");
        }
        
        if (typeof setupCustomPlayScreen === 'function') {
          setupCustomPlayScreen();
          console.log("Play screen integration: Custom play screen setup complete");
        }
        
        // Force show the play screen initially
        if (typeof showCustomPlayScreen === 'function') {
          showCustomPlayScreen();
          console.log("Play screen integration: Forced play screen to show");
        }
        
        monitorGameState();
        gameInitialized = true;
        console.log("Play screen integration: Initialization complete");
      }, 500); // Increased delay
    }, 100);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})(); 