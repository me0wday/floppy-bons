// Utility Functions for FlappyRoo Game

/**
 * DOM Utility Functions
 */
const DOMUtils = {
    /**
     * Get element by ID with error handling
     */
    getElementById(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with ID '${id}' not found`);
        }
        return element;
    },

    /**
     * Set element display style
     */
    setDisplay(element, display) {
        if (element) {
            element.style.display = display;
        }
    },

    /**
     * Show element with appropriate display style
     */
    show(element) {
        if (!element) return;
        
        // Check if element should use flex display based on class names
        // Only game screens need flex for content centering
        const flexElements = ['start-screen', 'game-over'];
        const shouldUseFlex = flexElements.some(className => 
            element.classList && element.classList.contains(className)
        );
        
        this.setDisplay(element, shouldUseFlex ? 'flex' : 'block');
    },

    /**
     * Hide element
     */
    hide(element) {
        this.setDisplay(element, 'none');
    },

    /**
     * Toggle element visibility
     */
    toggle(element, show) {
        this.setDisplay(element, show ? 'block' : 'none');
    },

    /**
     * Set text content safely
     */
    setText(element, text) {
        if (element) {
            element.textContent = text;
        }
    },

    /**
     * Add class to element
     */
    addClass(element, className) {
        if (element && element.classList) {
            element.classList.add(className);
        }
    },

    /**
     * Remove class from element
     */
    removeClass(element, className) {
        if (element && element.classList) {
            element.classList.remove(className);
        }
    },

    /**
     * Check if element has class
     */
    hasClass(element, className) {
        return element && element.classList && element.classList.contains(className);
    }
};

/**
 * Math Utility Functions
 */
const MathUtils = {
    /**
     * Clamp value between min and max
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Linear interpolation
     */
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    /**
     * Map value from one range to another
     */
    map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    /**
     * Random number between min and max
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Random integer between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Calculate distance between two points
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Normalize angle to -180 to 180 range
     */
    normalizeAngle(angle) {
        while (angle > 180) angle -= 360;
        while (angle < -180) angle += 360;
        return angle;
    },

    /**
     * Round to specified decimal places
     */
    roundTo(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }
};

/**
 * Game Utility Functions
 */
const GameUtils = {
    /**
     * Calculate responsive dimensions based on screen size
     */
    getResponsiveDimensions() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        return {
            width,
            height,
            groundHeight: height * GAME_CONSTANTS.GROUND_HEIGHT_PERCENT,
            ceilingHeight: height * GAME_CONSTANTS.CEILING_HEIGHT_PERCENT,
            characterSize: height * GAME_CONSTANTS.CHARACTER_SIZE_VH,
            characterWidth: height * GAME_CONSTANTS.CHARACTER_WIDTH_VH,
            characterLeft: width * GAME_CONSTANTS.CHARACTER_LEFT_PERCENT,
            isPortrait: height > width
        };
    },

    /**
     * Calculate physics values based on current settings
     */
    calculatePhysics(multipliers, dimensions) {
        return {
            gravity: dimensions.height * GAME_CONSTANTS.GRAVITY_BASE * multipliers.gravity,
            jumpStrength: -dimensions.height * GAME_CONSTANTS.JUMP_STRENGTH_BASE * multipliers.jump,
            gameSpeed: dimensions.width * GAME_CONSTANTS.GAME_SPEED_BASE * multipliers.speed
        };
    },

    /**
     * Check collision between two rectangular objects
     */
    checkCollision(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    },

    /**
     * Get character hitbox
     */
    getCharacterHitbox(characterLeft, characterBottom, characterWidth, characterSize) {
        const padding = COLLISION.HITBOX_PADDING;
        const paddingX = characterWidth * padding;
        const paddingY = characterSize * padding;
        
        return {
            left: characterLeft + paddingX,
            right: characterLeft + characterWidth - paddingX,
            top: characterBottom + paddingY,
            bottom: characterBottom + characterSize - paddingY
        };
    },

    /**
     * Get obstacle hitbox
     */
    getObstacleHitbox(obstacle) {
        const padding = COLLISION.OBSTACLE_PADDING;
        const paddingX = obstacle.width * padding;
        const paddingY = obstacle.height * padding;
        
        return {
            left: obstacle.left + paddingX,
            right: obstacle.left + obstacle.width - paddingX,
            top: obstacle.bottom + paddingY,
            bottom: obstacle.bottom + obstacle.height - paddingY
        };
    },

    /**
     * Calculate level-based difficulty
     */
    calculateDifficulty(level, startingLevel) {
        const levelDiff = level - startingLevel;
        return {
            speedMultiplier: 1 + (levelDiff * GAME_CONSTANTS.SPEED_INCREASE_PER_LEVEL),
            obstacleFrequency: Math.max(800, 
                GAME_CONSTANTS.OBSTACLE_FREQUENCY_BASE - (levelDiff * GAME_CONSTANTS.OBSTACLE_FREQUENCY_DECREASE)),
            heightVariation: Math.min(GAME_CONSTANTS.MAX_HEIGHT_VARIATION,
                GAME_CONSTANTS.OBSTACLE_HEIGHT_VARIATION + (levelDiff * GAME_CONSTANTS.HEIGHT_VARIATION_INCREASE))
        };
    },

    /**
     * Format number with commas for display
     */
    formatScore(score) {
        return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    /**
     * Debounce function calls
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function calls
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

/**
 * Animation Utility Functions
 */
const AnimationUtils = {
    /**
     * Animate element with CSS transitions
     */
    animate(element, properties, duration = 300, easing = 'ease') {
        if (!element) return Promise.resolve();
        
        return new Promise(resolve => {
            const originalTransition = element.style.transition;
            element.style.transition = `all ${duration}ms ${easing}`;
            
            Object.assign(element.style, properties);
            
            setTimeout(() => {
                element.style.transition = originalTransition;
                resolve();
            }, duration);
        });
    },

    /**
     * Fade element in
     */
    fadeIn(element, duration = 300) {
        if (!element) return Promise.resolve();
        
        element.style.opacity = '0';
        element.style.display = 'block';
        
        return this.animate(element, { opacity: '1' }, duration);
    },

    /**
     * Fade element out
     */
    fadeOut(element, duration = 300) {
        if (!element) return Promise.resolve();
        
        return this.animate(element, { opacity: '0' }, duration)
            .then(() => {
                element.style.display = 'none';
            });
    },

    /**
     * Slide element up
     */
    slideUp(element, duration = 300) {
        if (!element) return Promise.resolve();
        
        const height = element.offsetHeight;
        return this.animate(element, { 
            height: '0px', 
            paddingTop: '0px', 
            paddingBottom: '0px' 
        }, duration);
    },

    /**
     * Slide element down
     */
    slideDown(element, duration = 300) {
        if (!element) return Promise.resolve();
        
        element.style.display = 'block';
        const height = element.scrollHeight;
        element.style.height = '0px';
        
        return this.animate(element, { height: `${height}px` }, duration);
    }
};

/**
 * Validation Utility Functions
 */
const ValidationUtils = {
    /**
     * Validate number within range
     */
    validateNumber(value, min, max, defaultValue = min) {
        const num = Number(value);
        if (isNaN(num)) return defaultValue;
        return MathUtils.clamp(num, min, max);
    },

    /**
     * Validate SVG string
     */
    validateSVG(svgString) {
        if (!svgString || typeof svgString !== 'string') return false;
        
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svgString.trim();
            const svgElement = tempDiv.querySelector('svg');
            return svgElement !== null;
        } catch (error) {
            return false;
        }
    },

    /**
     * Sanitize input string
     */
    sanitizeString(str, maxLength = 1000) {
        if (!str || typeof str !== 'string') return '';
        return str.trim().substring(0, maxLength);
    }
};

/**
 * Performance Utility Functions
 */
const PerformanceUtils = {
    /**
     * Request animation frame with fallback
     */
    requestAnimationFrame(callback) {
        if (window.requestAnimationFrame) {
            return window.requestAnimationFrame(callback);
        } else if (window.webkitRequestAnimationFrame) {
            return window.webkitRequestAnimationFrame(callback);
        } else {
            return setTimeout(callback, 16);
        }
    },

    /**
     * Cancel animation frame
     */
    cancelAnimationFrame(id) {
        if (window.cancelAnimationFrame) {
            return window.cancelAnimationFrame(id);
        } else if (window.webkitCancelAnimationFrame) {
            return window.webkitCancelAnimationFrame(id);
        } else {
            return clearTimeout(id);
        }
    },

    /**
     * Measure function execution time
     */
    measureTime(func, label = 'Function') {
        const start = performance.now();
        const result = func();
        const end = performance.now();
        console.log(`${label} execution time: ${end - start} milliseconds`);
        return result;
    },

    /**
     * Check if device has high performance
     */
    isHighPerformance() {
        return window.devicePixelRatio <= 2 && 
               window.innerWidth * window.innerHeight <= 1920 * 1080;
    }
};

// Export utilities for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DOMUtils,
        MathUtils,
        GameUtils,
        AnimationUtils,
        ValidationUtils,
        PerformanceUtils
    };
} 