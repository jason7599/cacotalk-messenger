export const REACTIONS = {
    BLOOD: "🩸",
    SKULL: "💀",
    CANDLE: "🕯️",
    HEART: "🖤",
    FIRE: "🔥",
} as const;

export type ReactionType = keyof typeof REACTIONS;

// object key order is insertion order for string keys, so this matches the enum order
export const REACTION_TYPES = Object.keys(REACTIONS) as ReactionType[];