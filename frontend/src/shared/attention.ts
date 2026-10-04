/**
 * Is the user actually looking at CacoTalk right now?
 * Tab visible AND window focused. CacoTalk open on a second monitor while you type
 * somewhere else does NOT count. Same rule Discord/Slack use for marking things read.
 */
export const isAttending = () => document.visibilityState === "visible" && document.hasFocus();
