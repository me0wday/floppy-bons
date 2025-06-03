// Game Constants Configuration
// 
// ⚡ SINGLE SOURCE OF TRUTH ⚡
// All configuration form values, ranges, and defaults are controlled from this file.
// The HTML form elements are dynamically configured based on these constants.
// 
// To modify configuration options:
// - Update DEFAULTS for new default values
// - Update VALIDATION ranges for new min/max limits
// - The sliderMin/sliderMax control the slider range (subset of full range)
// - The min/max control the number input range (full range)
//
const GAME_CONSTANTS = {
    // Environment
    CEILING_HEIGHT_PERCENT: 0.05,   // 5% of screen height
    GROUND_HEIGHT_PERCENT: 0.15,   // 15% of screen height
    GRASS_HEIGHT_PERCENT: 0.02,    // 2% of screen height
    
    // Character
    CHARACTER_SIZE_VH: 0.10,        // 10vh
    CHARACTER_WIDTH_VH: 0.12,       // 12vh
    CHARACTER_LEFT_PERCENT: 0.15,   // 15% from left
    CHARACTER_START_HEIGHT: 50,     // pixels above ground
    CHARACTER_HITBOX_SCALE: 0.6,    // 60% of visual size for better gameplay
    
    // Physics
    GRAVITY_BASE: 0.0006,           // Base gravity relative to screen height
    JUMP_STRENGTH_BASE: 0.012,      // Base jump strength relative to screen height
    GAME_SPEED_BASE: 0.003,         // Base game speed relative to screen width
    
    // Obstacles
    OBSTACLE_WIDTH_VH: 0.10,        // 10vh
    CACTUS_WIDTH_VH: 0.06,          // 6vh
    OBSTACLE_FREQUENCY_BASE: 2000,  // Base interval in ms
    OBSTACLE_HEIGHT_VARIATION: 0.15, // 15% initial height variation
    OBSTACLE_SPAWN_DELAY: 1500,     // Delay before spawning obstacles (ms)
    
    // Clouds
    CLOUD_MAX_COUNT: 8,
    CLOUD_SIZE_MIN_VH: 0.05,        // 5vh
    CLOUD_SIZE_MAX_VH: 0.08,        // 8vh
    CLOUD_SPAWN_INTERVAL: 5000,     // 5 seconds
    CLOUD_SPEED_MIN: 0.0005,        // Relative to screen width
    CLOUD_SPEED_MAX: 0.001,         // Relative to screen width
    
    // Birds (collectibles)
    BIRD_SPAWN_CHANCE: 0.2,         // 20% chance per obstacle spawn (for testing - was 0.005)
    BIRD_SIZE_VH: 0.04,             // 4vh
    BIRD_SPEED_MULTIPLIER: 0.7,     // 70% of game speed
    BIRD_POINTS: 20,                // Points awarded for collecting
    BIRD_MIN_DISTANCE_FROM_OBSTACLES: 150, // Minimum distance from obstacles
    BIRD_LIFETIME: 15000,           // Bird disappears after 15 seconds
    
    // Scoring
    SCORE_UPDATE_DISTANCE: 100,     // Distance to travel for score update
    DEFAULT_LEVEL_THRESHOLD: 200,   // Points per level
    
    // Level progression
    SPEED_INCREASE_PER_LEVEL: 0.1,  // 20% speed increase per level
    OBSTACLE_FREQUENCY_DECREASE: 200, // ms decrease per level
    HEIGHT_VARIATION_INCREASE: 0.03, // 3% increase per level
    MAX_HEIGHT_VARIATION: 0.3,      // 30% maximum
    
    // UI Animation
    LEVEL_UP_DURATION: 2000,        // Level up notification duration (ms)
    DEATH_FLASH_DURATION: 500,      // Death indicator flash (ms)
    ROTATION_ANIMATION_DURATION: 200, // Character rotation (ms)
    
    // Configuration defaults
    DEFAULTS: {
        GRAVITY_MULTIPLIER: 0.5,
        JUMP_MULTIPLIER: 0.5,
        GAME_SPEED_MULTIPLIER: 1.0,
        LEVEL_THRESHOLD: 20,
        STARTING_LEVEL: 1,
        ROTATION_ANGLE: 0,
        USE_CUSTOM_SVG: false,
        FLIP_HORIZONTAL: false
    },
    
    // Input validation ranges
    VALIDATION: {
        GRAVITY: { min: 0.1, max: 5.0, sliderMin: 0.1, sliderMax: 5.0 },
        JUMP: { min: 0.1, max: 5.0, sliderMin: 0.1, sliderMax: 5.0 },
        SPEED: { min: 0.1, max: 5.0, sliderMin: 0.1, sliderMax: 2.0 },
        ROTATION: { min: -180, max: 180 },
        STARTING_LEVEL: { min: 1, max: 1000 },
        LEVEL_THRESHOLD: { min: 1, max: 2000, sliderMin: 1, sliderMax: 1000 }
    },
    
    // Local storage keys
    STORAGE_KEYS: {
        HIGH_SCORE: 'flappyRooHighScore',
        CUSTOM_SVG: 'flappyRooCustomSvg',
        USE_CUSTOM_SVG: 'flappyRooUseCustomSvg',
        FLIP_HORIZONTAL: 'flappyRooFlipHorizontal',
        ROTATION_ANGLE: 'flappyRooRotationAngle',
        GRAVITY: 'flappyRooGravity',
        JUMP: 'flappyRooJump',
        GAME_SPEED: 'flappyRooGameSpeed',
        LEVEL_THRESHOLD: 'flappyRooLevelThreshold',
        STARTING_LEVEL: 'flappyRooStartingLevel'
    },
    
    // Game states
    STATES: {
        START: 'start',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameOver',
        CONFIG: 'config'
    },
    
    // Z-index layers
    Z_INDEX: {
        GROUND: 2,
        CHARACTER: 3,
        UI: 5,
        DEATH_INDICATOR: 8,
        SCREENS: 10,
        CONFIG_OVERLAY: 15,
        CONFIG_MODAL: 20
    }
};

// Character rotation angles for different states
const CHARACTER_ROTATION = {
    NEUTRAL: 0,
    JUMP: -15,
    FALL: 15,
    FALL_VELOCITY_THRESHOLD: 5
};

// Collision detection settings
const COLLISION = {
    HITBOX_PADDING: 0.2,  // Reduce hitbox by 20% on each side
    OBSTACLE_PADDING: 0.2  // Reduce obstacle hitbox by 20%
};

// Animation easing and timing
const ANIMATION = {
    EASE_OUT_CUBIC: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    EASE_IN_OUT: 'ease-in-out',
    TRANSITION_FAST: '0.1s',
    TRANSITION_MEDIUM: '0.3s',
    TRANSITION_SLOW: '0.5s'
};

// Default character SVG (as fallback if bonnie.svg fails to load)
const DEFAULT_CHARACTER_SVG = `
<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="45" rx="20" ry="15" fill="#D2B48C" />
    <ellipse cx="85" cy="30" rx="12" ry="10" fill="#D2B48C" />
    <path d="M85,20 L90,10 L95,20" fill="#D2B48C" stroke="#A0522D" stroke-width="1" />
    <path d="M75,20 L80,5 L85,20" fill="#D2B48C" stroke="#A0522D" stroke-width="1" />
    <circle cx="90" cy="28" r="2" fill="black" />
    <ellipse cx="95" cy="33" rx="5" ry="3" fill="#C19A6B" />
    <path d="M65,40 Q75,30 85,30" fill="#D2B48C" />
    <path d="M30,45 Q15,55 10,70" stroke="#A0522D" stroke-width="6" fill="none" />
    <path d="M65,50 Q70,60 75,65" stroke="#A0522D" stroke-width="3" fill="none" />
    <path d="M70,50 Q75,60 80,65" stroke="#A0522D" stroke-width="3" fill="none" />
    <path d="M30,50 Q25,65 35,80" stroke="#A0522D" stroke-width="6" fill="none" />
    <path d="M35,80 Q45,85 55,75" stroke="#A0522D" stroke-width="5" fill="none" />
    <ellipse cx="55" cy="75" rx="5" ry="3" fill="#A0522D" />
    <path d="M40,50 Q50,55 60,50" stroke="#A0522D" stroke-width="1" fill="none" />
    <ellipse cx="50" cy="45" rx="15" ry="10" fill="#E6C9A8" opacity="0.5" />
</svg>`;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GAME_CONSTANTS,
        CHARACTER_ROTATION,
        COLLISION,
        ANIMATION,
        DEFAULT_CHARACTER_SVG
    };
} 