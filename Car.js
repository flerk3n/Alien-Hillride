class Car {
  constructor(x, y, world, player = null) {
    this.x = x;
    this.y = y;
    this.world = world;
    this.player = player;
    
    // Default shirt colors if no player provided
    if (!this.player) {
      this.player = {
        shirtColorR: 100,
        shirtColorG: 255,
        shirtColorB: 100,
        dead: false
      };
    }

    this.dead = false;
    this.id = "chassis";
    this.chassisWidth = 50;
    this.chassisHeight = 30;
    this.wheelSize = 20;
    this.motorState = 0;
    this.shapes = [];
    this.wheels = [];
    this.maxDistance = x;
    this.changeCount = 0;

    this.makeBody();
  }

  makeBody() {
    this.wheels = [];
    this.startingPosition = createVector(this.x, this.y);
    this.chassisBody;
    this.chassisWidth = 125;
    this.chassisHeight = 40;
    this.wheelSize = 17;
    this.changeDiff = 0;
    this.carDensity = 1;
    this.carRestitution = 0.01;

    var bodyDef = new b2BodyDef();
    bodyDef.type = b2DynamicBody;
    bodyDef.position.x = this.x / SCALE;
    bodyDef.position.y = this.y / SCALE;
    bodyDef.angle = 0;

    var fixDef = new b2FixtureDef();
    fixDef.density = this.carDensity;
    fixDef.friction = 0.5;
    fixDef.restitution = this.carRestitution;
    fixDef.shape = new b2PolygonShape();

    let vectors = [];
    vectors.push(new Vec2(-this.chassisWidth / 2, 0 - this.chassisHeight / 2));
    vectors.push(new Vec2(this.chassisWidth / 4 + 5, 0 - this.chassisHeight / 2));

    vectors.push(new Vec2(this.chassisWidth / 2, 0 - this.chassisHeight / 2 + 5));
    vectors.push(new Vec2(this.chassisWidth / 2, this.chassisHeight / 2));
    vectors.push(new Vec2(-this.chassisWidth / 2, this.chassisHeight / 2));
    for (var vect of vectors) {
      vect.x /= SCALE;
      vect.y /= SCALE;
    }

    fixDef.shape.SetAsArray(vectors, vectors.length);
    this.shapes.push(vectors);

    this.chassisBody = this.world.CreateBody(bodyDef);

    var filtData = new b2FilterData();
    filtData.categoryBits = CHASSIS_CATEGORY;
    filtData.maskBits = CHASSIS_MASK;

    this.chassisBody.CreateFixture(fixDef).SetFilterData(filtData);

    var fixDef2 = new b2FixtureDef();
    fixDef2.density = this.carDensity;;
    fixDef2.friction = 0.5;
    fixDef2.restitution = this.carRestitution;
    fixDef2.shape = new b2PolygonShape();

    var vectors2 = [];
    vectors2.push(new Vec2(this.chassisWidth / 4, 0 - this.chassisHeight / 2));
    vectors2.push(new Vec2(this.chassisWidth / 4 - 15, 0 - this.chassisHeight / 2 - 20));
    vectors2.push(new Vec2(this.chassisWidth / 4 - 5, 0 - this.chassisHeight / 2 - 20));
    vectors2.push(new Vec2(this.chassisWidth / 4 + 10, 0 - this.chassisHeight / 2));
    for (var vect of vectors2) {
      vect.x /= SCALE;
      vect.y /= SCALE;
    }
    fixDef2.shape.SetAsArray(vectors2, vectors2.length);
    this.chassisBody.CreateFixture(fixDef2).SetFilterData(filtData);;
    this.shapes.push(vectors2);

    var fixDef3 = new b2FixtureDef();
    fixDef3.density = this.carDensity;;
    fixDef3.friction = 0.1;
    fixDef3.restitution = 0.1;
    fixDef3.shape = new b2PolygonShape();

    var vectors3 = [];
    vectors3.push(new Vec2(this.chassisWidth / 2, 0 - this.chassisHeight / 2 + 5));
    vectors3.push(new Vec2(this.chassisWidth / 2 + 5, 0 - this.chassisHeight / 2 + 8));
    vectors3.push(new Vec2(this.chassisWidth / 2 + 5, this.chassisHeight / 2 - 5));
    vectors3.push(new Vec2(this.chassisWidth / 2, this.chassisHeight / 2));
    for (var vect of vectors3) {
      vect.x /= SCALE;
      vect.y /= SCALE;
    }
    fixDef3.shape.SetAsArray(vectors3, vectors3.length);
    this.chassisBody.CreateFixture(fixDef3).SetFilterData(filtData);;
    this.shapes.push(vectors3);

    this.wheels.push(new Wheel(this.x - this.chassisWidth / 2 + this.wheelSize * 1.2, this.y + this.chassisHeight / 2 + this.wheelSize / 4, this.wheelSize, this.chassisBody, this.world));
    this.wheels.push(new Wheel(this.x + this.chassisWidth / 2 - this.wheelSize * 1.2, this.y + this.chassisHeight / 2 + this.wheelSize / 4, this.wheelSize, this.chassisBody, this.world));

    this.person = new Person(this.x, this.y, 15, 30, this.world);
    this.person.torso.colour = color(this.player.shirtColorR, this.player.shirtColorG, this.player.shirtColorB);
    var revJointDef = new b2RevoluteJointDef();
    var jointPos = new Vec2(this.x / SCALE, this.y / SCALE);
    revJointDef.Initialize(this.person.torso.body, this.chassisBody, jointPos);
    this.revJoint = this.world.CreateJoint(revJointDef);

    var distJointDef = new b2DistanceJointDef();
    var anchorPerson = new Vec2(this.x / SCALE, (this.y - this.person.height * 2 / 3) / SCALE);
    var anchorCar = new Vec2((this.x + this.chassisWidth / 2) / SCALE, (this.y - this.chassisHeight / 2) / SCALE);
    distJointDef.Initialize(this.person.torso.body, this.chassisBody, anchorPerson, anchorCar);
    distJointDef.frequencyHz = 5;
    distJointDef.dampingRatio = 0.1;
    distJointDef.length *= 1.1;
    this.distJoint = this.world.CreateJoint(distJointDef);

    this.chassisBody.SetAngularDamping(0.1);

    this.rotationTorque = 1;

    this.chassisBody.SetUserData(this);
  }

  setShirt() {
    this.person.torso.colour = color(this.player.shirtColorR, this.player.shirtColorG, this.player.shirtColorB);
  }

  show() {
    let x = this.chassisBody.GetPosition().x * SCALE;
    let y = this.chassisBody.GetPosition().y * SCALE;
    let angle = this.chassisBody.GetAngle();
    this.person.show();
    for (var i of this.wheels) {
      i.show();
    }
    push();
    translate(x - panX, y - panY);
    rotate(angle);

    image(carSprite, -this.chassisWidth / 2 - 7, -this.chassisHeight - 20, this.chassisWidth + 23, this.chassisHeight * 2 + 10);
    fill(255, 255, 0, 20);

    textAlign(CENTER, CENTER);
    textSize(15);
    stroke(255, 255, 255, 20);
    strokeWeight(1);
    pop();
  }

  update() {
    let x = this.chassisBody.GetPosition().x * SCALE;
    let y = this.chassisBody.GetPosition().y * SCALE;
    let angle = this.chassisBody.GetAngle();
    
    // Normalize angle to -PI to PI range
    while (angle > PI) angle -= TWO_PI;
    while (angle < -PI) angle += TWO_PI;
    
    this.changeCount++;

    if (x > this.maxDistance) {
      this.maxDistance = x;
      if (floor(this.maxDistance) % 50 == 0) {
        this.changeCount = 0;
      }
    } else {
      // Only trigger death if car has made significant progress (>500m) AND has been stuck for a very long time
      // This prevents idle death at the starting position
      let hasMovedSignificantly = this.maxDistance > this.startingPosition.x + 500;
      if (hasMovedSignificantly && this.changeCount > 900) {
        console.log("Car died: stuck for too long after making progress");
        this.dead = true;
        if (this.player) this.player.dead = true;
      }
    }

    // Get current velocity for crash detection
    let velocity = this.chassisBody.GetLinearVelocity();
    let speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    let angularVelocity = Math.abs(this.chassisBody.GetAngularVelocity());

    // Check if car is upside down (angle between 90 and 270 degrees)
    let isUpsideDown = Math.abs(angle) > PI/2;
    
    // IMMEDIATE CRASH CONDITIONS
    // 1. Violent spinning (high angular velocity + upside down)
    if (isUpsideDown && angularVelocity > 8) {
      console.log("Car died: violent spinning crash", angularVelocity, angle);
      this.dead = true;
      if (this.player) this.player.dead = true;
      return;
    }
    
    // 2. Extreme angle (nearly completely upside down)
    if (Math.abs(angle) > PI * 0.85) { // ~153 degrees
      console.log("Car died: extreme flip", angle);
      this.dead = true;
      if (this.player) this.player.dead = true;
      return;
    }
    
    // 3. High speed + upside down combination
    if (isUpsideDown && speed > 8) {
      console.log("Car died: high speed flip", speed, angle);
      this.dead = true;
      if (this.player) this.player.dead = true;
      return;
    }
    
    // TIMED UPSIDE DOWN DETECTION (reduced from 3 seconds to 1 second)
    if (isUpsideDown) {
      if (!this.upsideDownTimer) {
        this.upsideDownTimer = 0;
      }
      this.upsideDownTimer++;
      
      // Car dies if upside down for more than 1 second (60 frames at 60fps)
      if (this.upsideDownTimer > 60) {
        console.log("Car died: upside down for too long", angle);
        this.dead = true;
        if (this.player) this.player.dead = true;
        return;
      }
    } else {
      // Reset timer if car is right-side up
      this.upsideDownTimer = 0;
    }

    // IMPACT DETECTION
    // Store previous speed for impact detection
    if (!this.lastSpeed) this.lastSpeed = speed;
    let speedChange = Math.abs(speed - this.lastSpeed);
    
    // Detect sudden deceleration (impact)
    if (speedChange > 5 && speed < 3 && isUpsideDown) {
      console.log("Car died: sudden impact crash", speedChange, speed, angle);
      this.dead = true;
      if (this.player) this.player.dead = true;
      return;
    }
    
    this.lastSpeed = speed;

    // Check for high-speed impacts
    if (speed > 15) { // High speed threshold
      if (!this.lastHighSpeedTime) {
        this.lastHighSpeedTime = millis();
      }
    } else {
      // If we suddenly went from high speed to low speed, check for crash
      if (this.lastHighSpeedTime && (millis() - this.lastHighSpeedTime < 100)) {
        // Sudden deceleration from high speed - likely a crash
        if (speed < 2 && isUpsideDown) {
          console.log("Car died: high-impact crash", speed, angle);
          this.dead = true;
          if (this.player) this.player.dead = true;
          return;
        }
      }
      this.lastHighSpeedTime = null;
    }

    // Only trigger death if car falls way below the visible screen
    if (!this.dead && y > canvas.height + 500) {
      console.log("Car died: fell off screen");
      this.dead = true;
      if (this.player) this.player.dead = true;
    }
  }

  motorOn(forward) {
    var motorSpeed = 6;
    this.wheels[0].joint.EnableMotor(true);
    this.wheels[1].joint.EnableMotor(true);
    var oldState = this.motorState;
    if (forward) {
      this.motorState = 1;
      this.wheels[0].joint.SetMotorSpeed(-motorSpeed * PI);
      this.wheels[1].joint.SetMotorSpeed(-motorSpeed * PI);
      
      // Set normal motor torque for acceleration
      this.wheels[0].joint.SetMaxMotorTorque(250);
      this.wheels[1].joint.SetMaxMotorTorque(250);
      
      // Removed torque application that was causing excessive rotation

    } else {
      // Gentler braking with reduced speed and torque
      this.motorState = -1;
      var brakeSpeed = motorSpeed * 0.4; // Much gentler braking speed
      this.wheels[0].joint.SetMotorSpeed(brakeSpeed * PI);
      this.wheels[1].joint.SetMotorSpeed(brakeSpeed * PI);
      
      // Much lower torque for softer braking
      this.wheels[0].joint.SetMaxMotorTorque(80);
      this.wheels[1].joint.SetMaxMotorTorque(80);
    }
    
    if (oldState + this.motorState == 0) {
      if (oldState == 1) {
        this.applyTorque(this.motorState * -1);
      }
    }
  }

  applyTorque(direction) {
    this.chassisBody.ApplyTorque(direction * this.rotationTorque);
  }
  motorOff() {
    switch (this.motorState) {
      case 1:
        this.chassisBody.ApplyTorque(this.motorState * this.rotationTorque);
        break;
    }
    this.motorState = 0;

    // Add gentle natural deceleration (air resistance/friction)
    var currentVelocity = this.chassisBody.GetLinearVelocity();
    var dampingForce = -0.1; // Small damping force
    this.chassisBody.ApplyForce(
      new Vec2(currentVelocity.x * dampingForce, 0), 
      this.chassisBody.GetPosition()
    );

    this.wheels[0].joint.EnableMotor(false);
    this.wheels[1].joint.EnableMotor(false);
  }
}
