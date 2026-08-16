// robot compiler: assembles the three faces an embodied agent must keep as one
// character — how it ACTS (behavior weights), how it SOUNDS (prosody), and what
// it SAYS (dialogue prompt). This is not a new psychometric mapping: it composes
// the npc, voice and chat outputs into a single build sheet, so a robot/android
// stack gets one coherent personality from one persona file.
import { behaviorWeights } from './npc.js';
import { prosodyRows, label3 } from './voice.js';
import { compileChat } from './chat.js';

export function compileRobot(p, { lang = 'en', level = 'full' } = {}) {
  const out = [];
  out.push(`# ROBOT / ANDROID — ${p.name}`);
  if (p.identity?.summary) out.push(p.identity.summary.trim());
  out.push('An embodied agent is three faces of one character. All three compile from this one persona.');

  const act = ['# HOW IT ACTS — behavior weights (0–100, for the behavior policy)'];
  for (const [k, v] of Object.entries(behaviorWeights(p))) {
    act.push(`- ${k.replace(/_/g, ' ').padEnd(18)} ${String(v).padStart(3)}`);
  }
  out.push(act.join('\n'));

  const snd = ['# HOW IT SOUNDS — prosody (0–100, map to your TTS engine)'];
  for (const [name, val, labels] of prosodyRows(p)) {
    snd.push(`- ${name}: ${String(val).padStart(3)}  (${label3(val, labels)})`);
  }
  out.push(snd.join('\n'));

  out.push('# WHAT IT SAYS — dialogue prompt for the language model\n' + compileChat(p, { lang, level, medium: 'voice' }).trim());

  return out.join('\n\n') + '\n';
}
