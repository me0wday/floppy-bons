// Character Management for FlappyRoo Game

/**
 * Character Class
 * Manages the game character including movement, animation, and customization
 */
class Character {
    constructor(element, config = {}) {
        this.element = element;
        this.defaultSvgContent = null; // Will be loaded from bonnie.svg
        
        // Character state
        this.position = { x: 0, y: 0 };
        this.velocity = 0;
        this.dimensions = { width: 0, height: 0 };
        
        // Configuration
        this.config = {
            customSvg: config.customSvg || '',
            useCustomSvg: config.useCustomSvg || false,
            flipHorizontal: config.flipHorizontal || false,
            rotationAngle: config.rotationAngle || 0
        };
        
        // Animation state
        this.currentRotation = 0;
        this.isAnimating = false;
        
        // Initialize will be called externally
    }

    /**
     * Initialize character
     */
    async initialize() {
        this.updateDimensions();
        await this.loadDefaultSvg();
        this.applyCharacterSvg();
        this.resetPosition();
    }

    /**
     * Load default SVG from bonnie.svg file
     */
    async loadDefaultSvg() {
        try {
            const response = await fetch('bonnie.svg');
            if (response.ok) {
                this.defaultSvgContent = await response.text();
            } else {
                console.warn('Could not load bonnie.svg, using fallback');
                this.defaultSvgContent = DEFAULT_CHARACTER_SVG; // Fallback to constants
            }
        } catch (error) {
            console.warn('Error loading bonnie.svg:', error);
            this.defaultSvgContent = DEFAULT_CHARACTER_SVG; // Fallback to constants
        }
    }

    /**
     * Update character dimensions based on screen size
     */
    updateDimensions() {
        const screenDimensions = GameUtils.getResponsiveDimensions();
        
        this.dimensions = {
            width: screenDimensions.characterWidth,
            height: screenDimensions.characterSize
        };
        
        this.position.x = screenDimensions.characterLeft;
        
        // Update CSS dimensions and ensure consistent container styling
        if (this.element) {
            this.element.style.width = `${this.dimensions.width}px`;
            this.element.style.height = `${this.dimensions.height}px`;
            this.element.style.left = `${this.position.x}px`;
            
            // Ensure container properties for consistent SVG sizing
            this.element.style.overflow = 'visible';
            this.element.style.display = 'block';
            this.element.style.position = 'absolute';
            
            // If SVG is already loaded, reconfigure it to ensure proper sizing
            const svg = this.element.querySelector('svg');
            if (svg) {
                this.configureSvgElement(svg);
            }
        }
    }

    /**
     * Reset character position to starting position
     */
    resetPosition() {
        const screenDimensions = GameUtils.getResponsiveDimensions();
        this.position.y = screenDimensions.height * 0.4; // Start at 40% of screen height
        this.velocity = 0;
        this.currentRotation = CHARACTER_ROTATION.NEUTRAL;
        
        this.updatePosition();
        this.updateRotation(CHARACTER_ROTATION.NEUTRAL);
    }

    /**
     * Update character position on screen
     */
    updatePosition() {
        if (this.element) {
            this.element.style.bottom = `${this.position.y}px`;
        }
    }

    /**
     * Update character rotation
     */
    updateRotation(angle, smooth = true) {
        if (!this.element) return;
        
        this.currentRotation = angle;
        
        // Get the SVG element
        const svg = this.element.querySelector('svg');
        if (!svg) return;
        
        // Build transform string
        let transform = '';
        
        // Add custom rotation if configured
        if (this.config.rotationAngle !== 0) {
            transform += `rotate(${this.config.rotationAngle}deg) `;
        }
        
        // Add current state rotation
        if (angle !== 0) {
            transform += `rotate(${angle}deg) `;
        }
        
        // Add horizontal flip if configured
        if (this.config.flipHorizontal) {
            transform += 'scaleX(-1) ';
        }
        
        // Apply transform
        svg.style.transform = transform.trim();
        
        // Apply transition for smooth animation
        if (smooth) {
            svg.style.transition = `transform ${ANIMATION.TRANSITION_FAST}`;
        } else {
            svg.style.transition = 'none';
        }
    }

    /**
     * Jump action
     */
    jump(jumpStrength) {
        this.velocity = jumpStrength;
        this.updateRotation(CHARACTER_ROTATION.JUMP);
        
        // Reset rotation after a short delay
        setTimeout(() => {
            if (this.velocity > -CHARACTER_ROTATION.FALL_VELOCITY_THRESHOLD) {
                this.updateRotation(CHARACTER_ROTATION.NEUTRAL);
            }
        }, GAME_CONSTANTS.ROTATION_ANIMATION_DURATION);
    }

    /**
     * Apply gravity and update position
     */
    applyGravity(gravity, groundHeight, ceilingHeight, gameHeight) {
        this.velocity += gravity;
        this.position.y -= this.velocity;
        
        // Check ceiling collision
        const ceilingLimit = gameHeight - ceilingHeight - this.dimensions.height;
        if (this.position.y > ceilingLimit) {
            this.position.y = ceilingLimit;
            this.velocity = 0;
            return 'ceiling';
        }
        
        // Check ground collision
        if (this.position.y <= groundHeight) {
            this.position.y = groundHeight;
            this.velocity = 0;
            return 'ground';
        }
        
        // Update rotation based on velocity
        if (this.velocity > CHARACTER_ROTATION.FALL_VELOCITY_THRESHOLD) {
            this.updateRotation(CHARACTER_ROTATION.FALL);
        }
        
        this.updatePosition();
        return null; // No collision
    }

    /**
     * Get character hitbox for collision detection
     */
    getHitbox() {
        return GameUtils.getCharacterHitbox(
            this.position.x,
            this.position.y,
            this.dimensions.width,
            this.dimensions.height
        );
    }

    /**
     * Apply custom or default character SVG
     */
    applyCharacterSvg() {
        if (!this.element) return;
        
        if (this.config.useCustomSvg && this.config.customSvg) {
            // Use custom SVG - validate it first
            if (ValidationUtils.validateSVG(this.config.customSvg)) {
                this.element.innerHTML = this.config.customSvg;
                
                // Get the SVG element and ensure it fills the container
                const svg = this.element.querySelector('svg');
                if (svg) {
                    this.configureSvgElement(svg);
                }
            } else {
                console.warn('Invalid custom SVG, falling back to default');
                this.applyDefaultCharacter();
            }
        } else {
            // Use default bonnie.svg content
            this.applyDefaultCharacter();
        }
        
        // Apply initial transformations
        this.updateRotation(this.currentRotation, false);
    }

    /**
     * Apply default character (loaded from bonnie.svg)
     */
    applyDefaultCharacter() {
        if (this.defaultSvgContent) {
            this.element.innerHTML = this.defaultSvgContent;
            
            // Configure the SVG element
            const svg = this.element.querySelector('svg');
            if (svg) {
                this.configureSvgElement(svg);
            }
        } else {
            console.warn('Default SVG content not loaded yet');
        }
    }

    /**
     * Configure SVG element for proper display
     */
    configureSvgElement(svg) {
        // Force consistent sizing for both custom and default SVG
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.display = 'block';
        svg.style.position = 'relative';
        
        // Remove any existing size-related attributes that might interfere
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.removeAttribute('style');
        
        // Re-apply the forced styles after removing the style attribute
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.display = 'block';
        svg.style.position = 'relative';
        
        // Ensure viewBox exists for proper scaling
        if (!svg.getAttribute('viewBox')) {
            // Try to get dimensions from various possible sources
            const width = svg.getAttribute('width') || 
                         svg.getBoundingClientRect().width || 
                         100;
            const height = svg.getAttribute('height') || 
                          svg.getBoundingClientRect().height || 
                          100;
            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        }
        
        // Set preserveAspectRatio for consistent scaling
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
        // Remove any nested elements that might have fixed sizing
        const nestedSvgs = svg.querySelectorAll('svg');
        nestedSvgs.forEach(nestedSvg => {
            nestedSvg.removeAttribute('width');
            nestedSvg.removeAttribute('height');
        });
    }

    /**
     * Update character configuration
     */
    updateConfig(newConfig) {
        const configChanged = 
            this.config.customSvg !== newConfig.customSvg ||
            this.config.useCustomSvg !== newConfig.useCustomSvg ||
            this.config.flipHorizontal !== newConfig.flipHorizontal ||
            this.config.rotationAngle !== newConfig.rotationAngle;
        
        this.config = { ...this.config, ...newConfig };
        
        if (configChanged) {
            this.applyCharacterSvg();
        }
    }

    /**
     * Get character center position
     */
    getCenterPosition() {
        return {
            x: this.position.x + this.dimensions.width / 2,
            y: this.position.y + this.dimensions.height / 2
        };
    }

    /**
     * Set character visibility
     */
    setVisibility(visible) {
        if (this.element) {
            this.element.style.display = visible ? 'block' : 'none';
        }
    }

    /**
     * Flash character (for collision feedback)
     */
    flash(duration = 200, color = 'rgba(255, 0, 0, 0.5)') {
        if (!this.element) return;
        
        const originalFilter = this.element.style.filter;
        this.element.style.filter = `drop-shadow(0 0 10px ${color})`;
        
        setTimeout(() => {
            if (this.element) {
                this.element.style.filter = originalFilter;
            }
        }, duration);
    }

    /**
     * Stop character movement immediately (for game over)
     */
    stop() {
        this.velocity = 0;
        this.updateRotation(CHARACTER_ROTATION.NEUTRAL, false);
        this.updatePosition();
    }

    /**
     * Destroy character (cleanup)
     */
    destroy() {
        if (this.element) {
            this.element.innerHTML = '';
            this.element.style.transform = '';
            this.element.style.transition = '';
        }
    }
}

/**
 * Character Preview Class
 * For showing character preview in configuration modal
 */
class CharacterPreview {
    constructor(previewElement) {
        this.element = previewElement;
        this.rotationControl = null;
        this.rotationLine = null;
        this.rotationValue = null;
        this.isDragging = false;
        this.centerX = 0;
        this.centerY = 0;
        
        this.setupRotationControls();
    }

    /**
     * Setup rotation controls for preview
     */
    setupRotationControls() {
        if (!this.element) return;
        
        const container = this.element.closest('.svg-preview-container');
        if (!container) return;
        
        this.rotationControl = container.querySelector('.rotation-control');
        this.rotationLine = container.querySelector('.rotation-line');
        this.rotationValue = container.querySelector('.rotation-value');
        
        if (this.rotationControl) {
            this.setupDragEvents();
        }
    }

    /**
     * Setup drag events for rotation control
     */
    setupDragEvents() {
        const startDrag = (e) => {
            e.preventDefault();
            this.isDragging = true;
            
            const rect = this.element.getBoundingClientRect();
            this.centerX = rect.left + rect.width / 2;
            this.centerY = rect.top + rect.height / 2;
            
            if (this.rotationValue) {
                this.rotationValue.style.display = 'block';
            }
        };
        
        const drag = (e) => {
            if (!this.isDragging) return;
            
            e.preventDefault();
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            if (!clientX || !clientY) return;
            
            const dx = clientX - this.centerX;
            const dy = clientY - this.centerY;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            const normalizedAngle = MathUtils.normalizeAngle(Math.round(angle));
            this.updateRotation(normalizedAngle);
            
            // Dispatch custom event for parent to handle
            this.element.dispatchEvent(new CustomEvent('rotationChange', {
                detail: { angle: normalizedAngle }
            }));
        };
        
        const endDrag = () => {
            this.isDragging = false;
            
            setTimeout(() => {
                if (!this.isDragging && this.rotationValue) {
                    this.rotationValue.style.display = 'none';
                }
            }, 1000);
        };
        
        // Mouse events
        this.rotationControl.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        
        // Touch events
        this.rotationControl.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', endDrag);
    }

    /**
     * Update preview with new SVG
     */
    updatePreview(svgCode, config = {}) {
        if (!this.element) return;
        
        if (svgCode && ValidationUtils.validateSVG(svgCode)) {
            this.element.innerHTML = '';
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svgCode;
            const svgElement = tempDiv.querySelector('svg');
            
            if (svgElement) {
                const previewSvg = svgElement.cloneNode(true);
                this.applyTransforms(previewSvg, config);
                this.element.appendChild(previewSvg);
            }
        } else {
            this.element.innerHTML = '<span>Preview</span>';
        }
    }

    /**
     * Apply transforms to preview SVG
     */
    applyTransforms(svg, config) {
        let transform = '';
        
        if (config.rotationAngle && config.rotationAngle !== 0) {
            transform += `rotate(${config.rotationAngle}deg) `;
        }
        
        if (config.flipHorizontal) {
            transform += 'scaleX(-1) ';
        }
        
        if (transform) {
            svg.style.transform = transform.trim();
        }
    }

    /**
     * Update rotation visuals
     */
    updateRotation(angle) {
        if (this.rotationLine) {
            this.rotationLine.style.transform = `rotate(${angle}deg)`;
        }
        
        if (this.rotationValue) {
            this.rotationValue.textContent = `${angle}°`;
            this.rotationValue.style.display = 'block';
        }
    }

    /**
     * Set rotation angle
     */
    setRotation(angle) {
        this.updateRotation(angle);
        
        if (!this.isDragging && this.rotationValue) {
            setTimeout(() => {
                if (this.rotationValue) {
                    this.rotationValue.style.display = 'none';
                }
            }, 1000);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Character,
        CharacterPreview
    };
} 