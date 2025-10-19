// audioSystem.js
// Simple audio system with Web Audio API for sound effects

export class AudioSystem {
  constructor() {
    this.context = null;
    this.sounds = {};
    this.enabled = true;
    
    // Initialize on first user interaction
    this.initialized = false;
    this.initPromise = this.waitForUserInteraction();
  }
  
  async waitForUserInteraction() {
    return new Promise((resolve) => {
      const init = () => {
        if (!this.initialized) {
          this.initialize();
          this.initialized = true;
          window.removeEventListener('click', init);
          window.removeEventListener('keydown', init);
          resolve();
        }
      };
      window.addEventListener('click', init);
      window.addEventListener('keydown', init);
    });
  }
  
  initialize() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioContext();
      
      // Create synthesized sound effects
      this.createSounds();
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      this.enabled = false;
    }
  }
  
  createSounds() {
    // Create basic synthesized sounds
    this.sounds = {
      attack: () => this.createAttackSound(),
      parry: () => this.createParrySound(),
      hit: () => this.createHitSound(),
      block: () => this.createBlockSound(),
      death: () => this.createDeathSound(),
      victory: () => this.createVictorySound(),
      menuSelect: () => this.createMenuSound()
    };
  }
  
  async play(soundName) {
    if (!this.enabled || !this.sounds[soundName]) return;
    
    // Wait for initialization if needed
    if (!this.initialized) {
      await this.initPromise;
    }
    
    // Resume context if suspended
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    
    // Play the sound
    const sound = this.sounds[soundName]();
    if (sound) {
      sound.start();
    }
  }
  
  createAttackSound() {
    const duration = 0.1;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + duration);
    
    gain.gain.setValueAtTime(0.3, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.stop(this.context.currentTime + duration);
    
    return osc;
  }
  
  createParrySound() {
    const duration = 0.3;
    const osc1 = this.context.createOscillator();
    const osc2 = this.context.createOscillator();
    const gain = this.context.createGain();
    
    // High metallic ring
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1200, this.context.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(800, this.context.currentTime + duration);
    
    // Low impact
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(150, this.context.currentTime);
    
    gain.gain.setValueAtTime(0.5, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.context.destination);
    
    osc1.stop(this.context.currentTime + duration);
    osc2.stop(this.context.currentTime + duration);
    
    return osc1;
  }
  
  createHitSound() {
    const duration = 0.15;
    const noise = this.createNoise(duration);
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, this.context.currentTime + duration);
    
    gain.gain.setValueAtTime(0.4, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);
    
    return noise;
  }
  
  createBlockSound() {
    const duration = 0.08;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(80, this.context.currentTime);
    
    gain.gain.setValueAtTime(0.2, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.stop(this.context.currentTime + duration);
    
    return osc;
  }
  
  createDeathSound() {
    const duration = 1.5;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.context.currentTime + duration);
    
    gain.gain.setValueAtTime(0.3, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.stop(this.context.currentTime + duration);
    
    return osc;
  }
  
  createVictorySound() {
    const duration = 0.8;
    const osc1 = this.context.createOscillator();
    const osc2 = this.context.createOscillator();
    const gain = this.context.createGain();
    
    // Major chord arpeggio
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, this.context.currentTime); // C5
    osc1.frequency.setValueAtTime(659.25, this.context.currentTime + 0.2); // E5
    osc1.frequency.setValueAtTime(783.99, this.context.currentTime + 0.4); // G5
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(261.63, this.context.currentTime); // C4
    
    gain.gain.setValueAtTime(0.3, this.context.currentTime);
    gain.gain.setValueAtTime(0.3, this.context.currentTime + duration - 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.context.destination);
    
    osc1.stop(this.context.currentTime + duration);
    osc2.stop(this.context.currentTime + duration);
    
    return osc1;
  }
  
  createMenuSound() {
    const duration = 0.1;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.context.currentTime);
    osc.frequency.setValueAtTime(800, this.context.currentTime + duration/2);
    
    gain.gain.setValueAtTime(0.1, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.stop(this.context.currentTime + duration);
    
    return osc;
  }
  
  createNoise(duration) {
    const bufferSize = this.context.sampleRate * duration;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    noise.start(this.context.currentTime);
    noise.stop(this.context.currentTime + duration);
    
    return noise;
  }
}

// Global audio system instance
export const audioSystem = new AudioSystem();