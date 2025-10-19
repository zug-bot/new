// combat.js
// Simple parry-timing prototype: press Space just before enemy 'attack' to parry.

export function setupParrySystem({ app, hero, enemy }) {
  let enemyWindup = 2000; // ms between attacks
  let timeSinceAttack = 0;
  let parryWindow = 200;  // ms window where Space counts as parry
  let parryActive = false;
  let parrySuccessFlash = 0;
  let telegraphTime = 350; // ms telegraph before impact
  let telegraphActive = 0; // 0..1 for visual tint

  const onKey = (e) => {
    if (e.code === 'Space') {
      if (parryActive) {
        parrySuccessFlash = 200;
        // You could stun enemy here, apply knockback, etc.
        // console.log('PARRY!');
        telegraphActive = 0; // reset telegraph on success
      } else {
        // console.log('Missed parry');
      }
    }
  };
  window.addEventListener('keydown', onKey);

  app.ticker.add((frame) => {
    const dt = frame.deltaMS;
    timeSinceAttack += dt;
    const impactTime = enemyWindup;
    const telegraphStart = Math.max(0, impactTime - telegraphTime);
    const parryStart = Math.max(0, impactTime - parryWindow);

    // Telegraph buildup
    if (timeSinceAttack >= telegraphStart && timeSinceAttack < impactTime) {
      telegraphActive = Math.min(1, (timeSinceAttack - telegraphStart) / telegraphTime);
      // Slight red tint as the attack nears
      enemy.tint = 0xFFFFFF - Math.floor(telegraphActive * 0x330000);
      enemy.scale.set(1 + telegraphActive * 0.05);
    } else {
      telegraphActive = 0;
      enemy.tint = 0xFFFFFF;
      enemy.scale.set(1);
    }

    // Parry window
    parryActive = timeSinceAttack >= parryStart && timeSinceAttack < impactTime;
    if (timeSinceAttack >= impactTime) {
      // Resolve attack
      if (!parrySuccessFlash) {
        // A simple hit flash if not parried
        app.renderer.background.color = 0x220e0e;
      }
      timeSinceAttack = 0;
      parrySuccessFlash = 0;
      parryActive = false;
    }

    // Visual feedback (flash the screen on parry success)
    if (parrySuccessFlash > 0) {
      parrySuccessFlash -= dt;
      const f = Math.max(0, parrySuccessFlash / 200);
      app.renderer.background.color = (0x102238 + Math.floor(0x1000 * f));
    } else {
      app.renderer.background.color = 0x0e1220;
    }
  });

  return () => window.removeEventListener('keydown', onKey);
}
