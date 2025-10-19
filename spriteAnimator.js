// spriteAnimator.js
// Sprite animation system for PixiJS

import * as PIXI from 'pixi.js';

export class SpriteAnimator {
  constructor(spritesheet, animationSpeed = 0.1) {
    this.spritesheet = spritesheet;
    this.animationSpeed = animationSpeed;
    this.currentAnimation = null;
    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.isPlaying = false;
    this.loop = true;
    
    // Create animated sprite container
    this.sprite = new PIXI.Container();
    this.currentSprite = null;
    
    // Parse animations from spritesheet
    this.animations = {};
    if (spritesheet.data && spritesheet.data.animations) {
      for (const [name, frames] of Object.entries(spritesheet.data.animations)) {
        this.animations[name] = frames.map(frameName => spritesheet.textures[frameName]);
      }
    }
  }
  
  play(animationName, loop = true) {
    if (!this.animations[animationName]) {
      console.warn(`Animation "${animationName}" not found`);
      return;
    }
    
    if (this.currentAnimation === animationName && this.isPlaying) {
      return; // Already playing this animation
    }
    
    this.currentAnimation = animationName;
    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.isPlaying = true;
    this.loop = loop;
    
    this.updateSprite();
  }
  
  stop() {
    this.isPlaying = false;
  }
  
  updateSprite() {
    if (!this.currentAnimation || !this.animations[this.currentAnimation]) return;
    
    const frames = this.animations[this.currentAnimation];
    const texture = frames[this.currentFrame];
    
    if (this.currentSprite) {
      this.sprite.removeChild(this.currentSprite);
    }
    
    this.currentSprite = new PIXI.Sprite(texture);
    this.currentSprite.anchor.set(0.5, 0.9); // Anchor at bottom center
    this.sprite.addChild(this.currentSprite);
  }
  
  update(deltaTime) {
    if (!this.isPlaying || !this.currentAnimation) return;
    
    const frames = this.animations[this.currentAnimation];
    if (!frames || frames.length === 0) return;
    
    this.elapsedTime += deltaTime;
    
    const frameDuration = 1 / (this.animationSpeed * 60); // Convert to seconds
    if (this.elapsedTime >= frameDuration) {
      this.elapsedTime = 0;
      this.currentFrame++;
      
      if (this.currentFrame >= frames.length) {
        if (this.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = frames.length - 1;
          this.isPlaying = false;
        }
      }
      
      this.updateSprite();
    }
  }
  
  setAnchor(x, y) {
    if (this.currentSprite) {
      this.currentSprite.anchor.set(x, y);
    }
  }
  
  get x() { return this.sprite.x; }
  set x(value) { this.sprite.x = value; }
  
  get y() { return this.sprite.y; }
  set y(value) { this.sprite.y = value; }
}

// Character controller that manages animations based on state
export class CharacterController {
  constructor(animator) {
    this.animator = animator;
    this.state = 'idle';
    this.direction = 'down'; // down, up, left, right
    this.isMoving = false;
    this.isAttacking = false;
  }
  
  update(deltaTime) {
    this.animator.update(deltaTime);
    
    // Update animation based on state
    if (this.isAttacking) {
      this.animator.play('attack', false);
    } else if (this.isMoving) {
      this.animator.play('walk');
    } else {
      this.animator.play('idle');
    }
  }
  
  move(dx, dy) {
    this.isMoving = dx !== 0 || dy !== 0;
    
    // Update direction based on movement
    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = dx > 0 ? 'right' : 'left';
    } else if (dy !== 0) {
      this.direction = dy > 0 ? 'down' : 'up';
    }
    
    // Flip sprite based on direction
    if (this.direction === 'left') {
      this.animator.sprite.scale.x = -1;
    } else if (this.direction === 'right') {
      this.animator.sprite.scale.x = 1;
    }
  }
  
  attack() {
    if (!this.isAttacking) {
      this.isAttacking = true;
      this.animator.play('attack', false);
      
      // Reset attack state after animation
      setTimeout(() => {
        this.isAttacking = false;
      }, 600); // Adjust based on animation duration
    }
  }
  
  stopMoving() {
    this.isMoving = false;
  }
}