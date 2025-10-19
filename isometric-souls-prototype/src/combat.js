// combat.js
// Simple parry-timing prototype: press Space just before enemy 'attack' to parry.

export function setupParrySystem({ app, hero, enemy }) {
  let enemyWindup = 2000; // ms between attacks
  let timeSinceAttack = 0;
  let parryWindow = 200;  // ms window where Space counts as parry
  let parryActive = false;
  let parrySuccessFlash = 0;

  const onKey = (e) => {
    if (e.code === 'Space') {
      if (parryActive) {
        parrySuccessFlash = 200;
        // You could stun enemy here, apply knockback, etc.
        // console.log('PARRY!');
      } else {
        // console.log('Missed parry');
      }
    }
  };
  window.addEventListener('keydown', onKey);

  app.ticker.add((frame) => {
    const dt = frame.deltaMS;
    timeSinceAttack += dt;
    if (timeSinceAttack > enemyWindup) {
      // Enemy attacks: briefly open parry window at the end of windup
      if (timeSinceAttack > enemyWindup - parryWindow && timeSinceAttack < enemyWindup) {
        parryActive = true;
      } else if (timeSinceAttack >= enemyWindup) {
        // Damage if no parry (not implemented)
        parryActive = false;
        timeSinceAttack = 0;
      }
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
