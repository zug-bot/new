// main.js
// Entry point: boot renderer, then enable combat/parry prototype

import { createRenderer } from './renderer.js'
import { setupParrySystem } from './combat.js'

async function boot() {
  const scene = await createRenderer()
  setupParrySystem(scene)
}

boot()
