// Local Storage Management for FlappyRoo Game

/**
 * Storage Manager Class
 * Handles all localStorage operations with error handling and validation
 */
class StorageManager {
    constructor() {
        this.isSupported = this.checkStorageSupport();
        this.cache = new Map(); // In-memory cache as fallback
    }

    /**
     * Check if localStorage is supported and available
     */
    checkStorageSupport() {
        try {
            const test = 'storageTest';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('localStorage not supported, using in-memory storage');
            return false;
        }
    }

    /**
     * Get value from storage with fallback
     */
    get(key, defaultValue = null) {
        try {
            if (this.isSupported) {
                const value = localStorage.getItem(key);
                return value !== null ? value : defaultValue;
            } else {
                return this.cache.get(key) || defaultValue;
            }
        } catch (error) {
            console.warn(`Error reading from storage: ${key}`, error);
            return defaultValue;
        }
    }

    /**
     * Set value in storage with error handling
     */
    set(key, value) {
        try {
            if (this.isSupported) {
                localStorage.setItem(key, value);
            } else {
                this.cache.set(key, value);
            }
            return true;
        } catch (error) {
            console.warn(`Error writing to storage: ${key}`, error);
            return false;
        }
    }

    /**
     * Remove value from storage
     */
    remove(key) {
        try {
            if (this.isSupported) {
                localStorage.removeItem(key);
            } else {
                this.cache.delete(key);
            }
            return true;
        } catch (error) {
            console.warn(`Error removing from storage: ${key}`, error);
            return false;
        }
    }

    /**
     * Clear all game-related storage
     */
    clear() {
        try {
            if (this.isSupported) {
                // Only remove FlappyRoo related items
                Object.values(GAME_CONSTANTS.STORAGE_KEYS).forEach(key => {
                    localStorage.removeItem(key);
                });
            } else {
                this.cache.clear();
            }
            return true;
        } catch (error) {
            console.warn('Error clearing storage', error);
            return false;
        }
    }

    /**
     * Get numeric value with validation
     */
    getNumber(key, defaultValue = 0, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
        const value = this.get(key, defaultValue);
        const num = Number(value);
        
        if (isNaN(num)) {
            return defaultValue;
        }
        
        return MathUtils.clamp(num, min, max);
    }

    /**
     * Get boolean value with validation
     */
    getBoolean(key, defaultValue = false) {
        const value = this.get(key, defaultValue);
        
        if (typeof value === 'boolean') {
            return value;
        }
        
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        
        return Boolean(value);
    }

    /**
     * Get string value with validation
     */
    getString(key, defaultValue = '', maxLength = 10000) {
        const value = this.get(key, defaultValue);
        
        if (typeof value !== 'string') {
            return defaultValue;
        }
        
        return ValidationUtils.sanitizeString(value, maxLength);
    }

    /**
     * Set numeric value
     */
    setNumber(key, value) {
        if (typeof value === 'number' && !isNaN(value)) {
            return this.set(key, value.toString());
        }
        return false;
    }

    /**
     * Set boolean value
     */
    setBoolean(key, value) {
        return this.set(key, Boolean(value).toString());
    }

    /**
     * Check if key exists in storage
     */
    has(key) {
        try {
            if (this.isSupported) {
                return localStorage.getItem(key) !== null;
            } else {
                return this.cache.has(key);
            }
        } catch (error) {
            return false;
        }
    }

    /**
     * Get storage size information
     */
    getStorageInfo() {
        if (!this.isSupported) {
            return {
                supported: false,
                used: this.cache.size,
                total: 'unlimited',
                available: 'unlimited'
            };
        }

        try {
            let used = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    used += localStorage[key].length + key.length;
                }
            }

            return {
                supported: true,
                used: used,
                total: 'unknown',
                available: 'unknown'
            };
        } catch (error) {
            return {
                supported: true,
                used: 0,
                total: 'unknown',
                available: 'unknown'
            };
        }
    }
}

/**
 * Game Configuration Storage
 * Handles game-specific configuration persistence
 */
class GameConfigStorage {
    constructor(storageManager) {
        this.storage = storageManager;
        this.defaults = GAME_CONSTANTS.DEFAULTS;
        this.validation = GAME_CONSTANTS.VALIDATION;
        this.keys = GAME_CONSTANTS.STORAGE_KEYS;
    }

    /**
     * Load all game configuration
     */
    loadConfig() {
        return {
            // Character settings
            customSvg: this.storage.getString(this.keys.CUSTOM_SVG, ''),
            useCustomSvg: this.storage.getBoolean(this.keys.USE_CUSTOM_SVG, this.defaults.USE_CUSTOM_SVG),
            flipHorizontal: this.storage.getBoolean(this.keys.FLIP_HORIZONTAL, this.defaults.FLIP_HORIZONTAL),
            rotationAngle: this.storage.getNumber(
                this.keys.ROTATION_ANGLE, 
                this.defaults.ROTATION_ANGLE,
                this.validation.ROTATION.min,
                this.validation.ROTATION.max
            ),

            // Physics settings
            gravityMultiplier: this.storage.getNumber(
                this.keys.GRAVITY,
                this.defaults.GRAVITY_MULTIPLIER,
                this.validation.GRAVITY.min,
                this.validation.GRAVITY.max
            ),
            jumpMultiplier: this.storage.getNumber(
                this.keys.JUMP,
                this.defaults.JUMP_MULTIPLIER,
                this.validation.JUMP.min,
                this.validation.JUMP.max
            ),
            gameSpeedMultiplier: this.storage.getNumber(
                this.keys.GAME_SPEED,
                this.defaults.GAME_SPEED_MULTIPLIER,
                this.validation.SPEED.min,
                this.validation.SPEED.max
            ),

            // Difficulty settings
            startingLevel: this.storage.getNumber(
                this.keys.STARTING_LEVEL,
                this.defaults.STARTING_LEVEL,
                this.validation.STARTING_LEVEL.min,
                this.validation.STARTING_LEVEL.max
            ),
            levelThreshold: this.storage.getNumber(
                this.keys.LEVEL_THRESHOLD,
                this.defaults.LEVEL_THRESHOLD,
                this.validation.LEVEL_THRESHOLD.min,
                this.validation.LEVEL_THRESHOLD.max
            ),

            // Score
            highScore: this.storage.getNumber(this.keys.HIGH_SCORE, 0, 0, Number.MAX_SAFE_INTEGER)
        };
    }

    /**
     * Save game configuration
     */
    saveConfig(config) {
        const results = {};

        // Character settings
        results.customSvg = this.storage.set(this.keys.CUSTOM_SVG, 
            ValidationUtils.sanitizeString(config.customSvg || '', 50000));
        results.useCustomSvg = this.storage.setBoolean(this.keys.USE_CUSTOM_SVG, config.useCustomSvg);
        results.flipHorizontal = this.storage.setBoolean(this.keys.FLIP_HORIZONTAL, config.flipHorizontal);
        results.rotationAngle = this.storage.setNumber(this.keys.ROTATION_ANGLE, 
            ValidationUtils.validateNumber(config.rotationAngle, 
                this.validation.ROTATION.min, this.validation.ROTATION.max, 0));

        // Physics settings
        results.gravity = this.storage.setNumber(this.keys.GRAVITY,
            ValidationUtils.validateNumber(config.gravityMultiplier,
                this.validation.GRAVITY.min, this.validation.GRAVITY.max, this.defaults.GRAVITY_MULTIPLIER));
        results.jump = this.storage.setNumber(this.keys.JUMP,
            ValidationUtils.validateNumber(config.jumpMultiplier,
                this.validation.JUMP.min, this.validation.JUMP.max, this.defaults.JUMP_MULTIPLIER));
        results.speed = this.storage.setNumber(this.keys.GAME_SPEED,
            ValidationUtils.validateNumber(config.gameSpeedMultiplier,
                this.validation.SPEED.min, this.validation.SPEED.max, this.defaults.GAME_SPEED_MULTIPLIER));

        // Difficulty settings
        results.startingLevel = this.storage.setNumber(this.keys.STARTING_LEVEL,
            ValidationUtils.validateNumber(config.startingLevel,
                this.validation.STARTING_LEVEL.min, this.validation.STARTING_LEVEL.max, this.defaults.STARTING_LEVEL));
        results.levelThreshold = this.storage.setNumber(this.keys.LEVEL_THRESHOLD,
            ValidationUtils.validateNumber(config.levelThreshold,
                this.validation.LEVEL_THRESHOLD.min, this.validation.LEVEL_THRESHOLD.max, this.defaults.LEVEL_THRESHOLD));

        return results;
    }

    /**
     * Save high score
     */
    saveHighScore(score) {
        const validScore = ValidationUtils.validateNumber(score, 0, Number.MAX_SAFE_INTEGER, 0);
        return this.storage.setNumber(this.keys.HIGH_SCORE, validScore);
    }

    /**
     * Reset high score
     */
    resetHighScore() {
        return this.storage.setNumber(this.keys.HIGH_SCORE, 0);
    }

    /**
     * Reset all configuration to defaults
     */
    resetConfig() {
        const defaultConfig = {
            customSvg: '',
            useCustomSvg: this.defaults.USE_CUSTOM_SVG,
            flipHorizontal: this.defaults.FLIP_HORIZONTAL,
            rotationAngle: this.defaults.ROTATION_ANGLE,
            gravityMultiplier: this.defaults.GRAVITY_MULTIPLIER,
            jumpMultiplier: this.defaults.JUMP_MULTIPLIER,
            gameSpeedMultiplier: this.defaults.GAME_SPEED_MULTIPLIER,
            startingLevel: this.defaults.STARTING_LEVEL,
            levelThreshold: this.defaults.LEVEL_THRESHOLD
        };

        return this.saveConfig(defaultConfig);
    }

    /**
     * Check if configuration exists
     */
    hasConfig() {
        return this.storage.has(this.keys.GRAVITY) || 
               this.storage.has(this.keys.JUMP) || 
               this.storage.has(this.keys.GAME_SPEED);
    }

    /**
     * Export configuration as JSON
     */
    exportConfig() {
        const config = this.loadConfig();
        return JSON.stringify(config, null, 2);
    }

    /**
     * Import configuration from JSON
     */
    importConfig(jsonString) {
        try {
            const config = JSON.parse(jsonString);
            return this.saveConfig(config);
        } catch (error) {
            console.error('Error importing configuration:', error);
            return false;
        }
    }
}

// Create global instances
const storageManager = new StorageManager();
const gameConfigStorage = new GameConfigStorage(storageManager);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StorageManager,
        GameConfigStorage,
        storageManager,
        gameConfigStorage
    };
} 