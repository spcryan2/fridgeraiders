
const sounds = {
  click: new Audio("/sounds/click.mp3"),
  pop: new Audio("/sounds/pop.mp3"),
  ding: new Audio("/sounds/ding.mp3"),
};

// turn this off if you add a mute button later
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function playSound(name, volume = 0.5) {
  if (muted) return;
  const original = sounds[name];
  if (!original) return;

  // cloneNode lets the same sound overlap if someone clicks fast
  const sound = original.cloneNode();
  sound.volume = volume;
  sound.play().catch(() => {
    // browsers block audio until the user has interacted with the page,
    // so we just ignore that error instead of crashing
  });
}