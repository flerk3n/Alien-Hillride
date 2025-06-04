# Hill Climb Racing - Manual Control

A simplified manual control version of the classic Hill Climb Racing game built with p5.js and Box2D physics.

## Features
- Manual gas and brake pedal controls
- Realistic physics simulation
- Randomly generated terrain
- Distance and speed tracking
- Game over detection (when driver's head hits the ground)

## Controls
- **GAS**: Click and hold the green GAS pedal to accelerate forward
- **BRAKE**: Click and hold the red BRAKE pedal to brake/reverse
- **SPACE**: Restart game after game over

## How to Play
1. Open `index.html` in a web browser
2. Use the gas pedal to accelerate and climb hills
3. Try to drive as far as possible without flipping over
4. Your goal is to maximize distance traveled

## Technical Details
- Built with p5.js for graphics and Box2D for physics
- Procedurally generated terrain using Perlin noise
- Real-time physics simulation at 60 FPS
