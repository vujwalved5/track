/**
 * Focus Notes Collection & Working Citations
 * Memorable Moments — Home Desk Environment (Task 16)
 *
 * Rules:
 * - 7 loose paper sheets on the right of the desk:
 *   1. Single-tasking
 *   2. Attention residue
 *   3. Deep work
 *   4. Time-boxing
 *   5. Breaks
 *   6. Sleep and attention
 *   7. Phone-free sessions
 * - Each sheet: title, calm non-preachy body (80 to 120 words), "Try this today" line, working source URL.
 * - Any quote strictly under 15 words and attributed; otherwise paraphrased.
 * - Pure L6 palette, L5 fonts, zero emoji.
 */

export interface FocusNote {
  id: string
  title: string
  topic: string
  body: string
  wordCount: number
  tryThisToday: string
  sourceLabel: string
  sourceUrl: string
}

export const FOCUS_NOTES: readonly FocusNote[] = [
  {
    id: 'single-tasking',
    title: 'Single-Tasking',
    topic: 'single-tasking',
    body: 'When the mind attempts to juggle multiple tasks at once, executive control mechanisms must repeatedly discard and reload internal rules. This constant switching expends significant mental energy, introducing delays and increasing friction in our thinking. Rather than saving time, multitasking fractures your focus and reduces the depth of your reflection. By committing your attention to a single activity, your thoughts settle naturally, allowing deeper contemplation and clearer expression. Give yourself permission to do exactly one thing at a time with patience and care.',
    wordCount: 85,
    tryThisToday: 'Choose one entry to write and close all unrelated tasks until your pen rests.',
    sourceLabel: 'Rubinstein, Meyer, & Evans (2001). Task Switching.',
    sourceUrl: 'https://doi.org/10.1037/0096-1523.27.4.763',
  },
  {
    id: 'attention-residue',
    title: 'Attention Residue',
    topic: 'attention residue',
    body: 'Shifting away from an unfinished task leaves a lingering trace of cognitive engagement behind. Even when your eyes move to a fresh page, your working memory continues quietly processing the unresolved obligations of your previous work. This attention residue divides your mental capacity and prevents thorough immersion in the present moment. A tranquil writing environment requires setting those unfinished loops aside beforehand. Acknowledging pending tasks by recording them elsewhere frees your prefrontal cortex, clearing room for calm and unhurried journaling.',
    wordCount: 80,
    tryThisToday: 'Jot down unresolved obligations on a scrap slip before opening your journal.',
    sourceLabel: 'Leroy (2009). Attention Residue.',
    sourceUrl: 'https://doi.org/10.1016/j.obhdp.2009.04.002',
  },
  {
    id: 'deep-work',
    title: 'Deep Work',
    topic: 'deep work',
    body: 'Meaningful introspection and high-value reflection thrive only in extended stretches of undisturbed focus. When digital distractions and persistent alerts are eliminated, the mind enters a state of deep concentration where ideas develop with clarity and nuance. True contemplation cannot be rushed in thirty-second intervals between notifications. Shielding your reading and writing space from external interruptions creates a quiet sanctuary for your personal memories. Conclude each session with an intentional closing ritual to signify that your reflective practice for the day is complete and honored.',
    wordCount: 86,
    tryThisToday: 'Dedicate an uninterrupted twenty-minute block solely to recording your day.',
    sourceLabel: 'Newport (2016). Deep Work.',
    sourceUrl: 'https://www.hachettebookgroup.com/titles/cal-newport/deep-work/9781455586691/',
  },
  {
    id: 'time-boxing',
    title: 'Time-Boxing',
    topic: 'time-boxing',
    body: 'An activity tends to expand to fill whatever time is allotted to it. Without intentional boundaries, a brief reflection can dissolve into prolonged rumination or aimless wandering. Setting a gentle, defined boundary creates a calm container for your thoughts. When you decide in advance to dedicate fifteen or twenty minutes to your journal, your mind focuses on what truly matters rather than agonizing over perfection. Fixed boundaries encourage succinct, genuine entries, helping you record the essence of your days with ease and quiet confidence.',
    wordCount: 86,
    tryThisToday: 'Set your sandglass for fifteen minutes and stop when the last grain settles.',
    sourceLabel: 'Wu et al. (2022). Time Pressure & Exploration.',
    sourceUrl: 'https://doi.org/10.1038/s41598-022-07901-1',
  },
  {
    id: 'breaks',
    title: 'Deliberate Breaks',
    topic: 'breaks',
    body: 'Human cognitive performance operates on an endogenous biological rhythm of roughly ninety minutes. Sustaining intense focus beyond this natural threshold leads to mental fatigue and diminished emotional clarity. Genuine rest is not passive distraction on another screen; it is giving your sensory and attentional faculties time to recover. Stepping away into quiet, natural surroundings or simply looking out a window replenishes depleted executive reserves. Honor your natural rhythms by pausing regularly between demanding tasks to let your mind wander freely and recover its natural equilibrium.',
    wordCount: 87,
    tryThisToday: 'Step away from all screens for five unhurried minutes after writing.',
    sourceLabel: 'Kleitman (1982). Basic Rest-Activity Cycle.',
    sourceUrl: 'https://doi.org/10.1093/sleep/5.4.311',
  },
  {
    id: 'sleep-and-attention',
    title: 'Sleep & Attention',
    topic: 'sleep and attention',
    body: 'Restorative sleep is the bedrock of sustained attention and emotional balance. Even modest sleep deprivation significantly impairs prefrontal inhibitory control, increasing vulnerability to distraction and mental fatigue throughout the day. When sleep is compromised, everyday demands feel heavier, and contemplative focus becomes harder to sustain. Tracking your sleep patterns without self-criticism brings gentle awareness to the profound connection between your nightly rest and your daily state of mind. Protecting your sleep schedule is one of the most effective ways to nurture a peaceful, attentive mind.',
    wordCount: 87,
    tryThisToday: 'Record your rest quality calmly beside your habits without judgment.',
    sourceLabel: 'Lim & Dinges (2010). Sleep Deprivation.',
    sourceUrl: 'https://doi.org/10.1037/a0018883',
  },
  {
    id: 'phone-free-sessions',
    title: 'Phone-Free Sessions',
    topic: 'phone-free sessions',
    body: 'The physical presence of a smartphone within your field of view subtly drains cognitive capacity. Even when silenced or turned face down, the brain expends continuous subconscious effort to suppress the impulse to check it. This constant background inhibition reduces the working memory available for your immediate reflection. By physically placing your phone in another room or out of sight, you release that cognitive strain instantly. Your writing space becomes an authentic refuge where your mind can breathe, contemplate, and focus without unseen friction.',
    wordCount: 87,
    tryThisToday: 'Place your phone in another room before opening your notebook.',
    sourceLabel: 'Ward et al. (2017). Brain Drain.',
    sourceUrl: 'https://doi.org/10.1086/691462',
  },
] as const
