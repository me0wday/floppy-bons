// Configuration Management for FlappyRoo Game

/**
 * Configuration Manager Class
 * Handles all configuration UI and interactions
 */
class ConfigManager {
    constructor() {
        this.elements = this.initializeElements();
        this.characterPreview = null;
        this.currentConfig = gameConfigStorage.loadConfig();
        this.sliderSyncHandlers = new Map();
        
        this.initialize();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        return {
            // Modal elements
            configButton: DOMUtils.getElementById('config-button'),
            configModal: DOMUtils.getElementById('config-modal'),
            modalOverlay: DOMUtils.getElementById('modal-overlay'),
            closeButton: DOMUtils.getElementById('close-config'),
            saveButton: DOMUtils.getElementById('save-config'),
            
            // Tab elements
            tabs: document.querySelectorAll('.config-tab'),
            sections: document.querySelectorAll('.config-section'),
            
            // Character configuration
            customSvgTextarea: DOMUtils.getElementById('custom-svg'),
            useCustomSvgCheckbox: DOMUtils.getElementById('use-custom-svg'),
            flipHorizontalCheckbox: DOMUtils.getElementById('flip-horizontal'),
            svgPreview: DOMUtils.getElementById('svg-preview'),
            
            // Rotation controls
            rotationSlider: DOMUtils.getElementById('rotation-slider'),
            rotationDisplay: DOMUtils.getElementById('rotation-display'),
            rotationInput: DOMUtils.getElementById('rotation-input'),
            
            // Physics controls
            gravitySlider: DOMUtils.getElementById('gravity-slider'),
            gravityDisplay: DOMUtils.getElementById('gravity-display'),
            gravityInput: DOMUtils.getElementById('gravity-input'),
            
            jumpSlider: DOMUtils.getElementById('jump-slider'),
            jumpDisplay: DOMUtils.getElementById('jump-display'),
            jumpInput: DOMUtils.getElementById('jump-input'),
            
            // Difficulty controls
            startingLevelInput: DOMUtils.getElementById('starting-level'),
            
            levelThresholdSlider: DOMUtils.getElementById('level-threshold-slider'),
            levelThresholdDisplay: DOMUtils.getElementById('level-threshold-display'),
            levelThresholdInput: DOMUtils.getElementById('level-threshold-input'),
            
            gameSpeedSlider: DOMUtils.getElementById('game-speed-slider'),
            gameSpeedDisplay: DOMUtils.getElementById('game-speed-display'),
            gameSpeedInput: DOMUtils.getElementById('game-speed-input'),
            
            // Other controls
            resetHighScoreCheckbox: DOMUtils.getElementById('reset-high-score')
        };
    }

    /**
     * Initialize configuration manager
     */
    initialize() {
        this.setupEventListeners();
        this.setupCharacterPreview();
        this.initializeFormConstraints();
        this.setupSliderSyncing();
        this.loadConfiguration();
    }

    /**
     * Initialize form constraints from constants
     */
    initializeFormConstraints() {
        const defaults = GAME_CONSTANTS.DEFAULTS;
        const validation = GAME_CONSTANTS.VALIDATION;
        
        // Gravity slider and input
        this.setFormControlConstraints(this.elements.gravitySlider, {
            min: validation.GRAVITY.sliderMin,
            max: validation.GRAVITY.sliderMax,
            value: defaults.GRAVITY_MULTIPLIER,
            step: 0.1
        });
        
        this.setFormControlConstraints(this.elements.gravityInput, {
            min: validation.GRAVITY.min,
            max: validation.GRAVITY.max,
            value: defaults.GRAVITY_MULTIPLIER,
            step: 0.1
        });
        
        // Jump slider and input
        this.setFormControlConstraints(this.elements.jumpSlider, {
            min: validation.JUMP.sliderMin,
            max: validation.JUMP.sliderMax,
            value: defaults.JUMP_MULTIPLIER,
            step: 0.1
        });
        
        this.setFormControlConstraints(this.elements.jumpInput, {
            min: validation.JUMP.min,
            max: validation.JUMP.max,
            value: defaults.JUMP_MULTIPLIER,
            step: 0.1
        });
        
        // Game speed slider and input
        this.setFormControlConstraints(this.elements.gameSpeedSlider, {
            min: validation.SPEED.sliderMin,
            max: validation.SPEED.sliderMax,
            value: defaults.GAME_SPEED_MULTIPLIER,
            step: 0.1
        });
        
        this.setFormControlConstraints(this.elements.gameSpeedInput, {
            min: validation.SPEED.min,
            max: validation.SPEED.max,
            value: defaults.GAME_SPEED_MULTIPLIER,
            step: 0.1
        });
        
        // Level threshold slider and input
        this.setFormControlConstraints(this.elements.levelThresholdSlider, {
            min: validation.LEVEL_THRESHOLD.sliderMin,
            max: validation.LEVEL_THRESHOLD.sliderMax,
            value: defaults.LEVEL_THRESHOLD,
            step: 1
        });
        
        this.setFormControlConstraints(this.elements.levelThresholdInput, {
            min: validation.LEVEL_THRESHOLD.min,
            max: validation.LEVEL_THRESHOLD.max,
            value: defaults.LEVEL_THRESHOLD,
            step: 1
        });
        
        // Starting level input
        this.setFormControlConstraints(this.elements.startingLevelInput, {
            min: validation.STARTING_LEVEL.min,
            max: validation.STARTING_LEVEL.max,
            value: defaults.STARTING_LEVEL
        });
        
        // Rotation slider and input
        this.setFormControlConstraints(this.elements.rotationSlider, {
            min: validation.ROTATION.min,
            max: validation.ROTATION.max,
            value: defaults.ROTATION_ANGLE
        });
        
        this.setFormControlConstraints(this.elements.rotationInput, {
            min: validation.ROTATION.min,
            max: validation.ROTATION.max,
            value: defaults.ROTATION_ANGLE
        });
        
        // Update displays
        this.updateDisplaysFromConstants();
    }

    /**
     * Set form control constraints
     */
    setFormControlConstraints(element, constraints) {
        if (!element) return;
        
        Object.keys(constraints).forEach(attr => {
            element.setAttribute(attr, constraints[attr]);
        });
    }

    /**
     * Update display elements from constants
     */
    updateDisplaysFromConstants() {
        const defaults = GAME_CONSTANTS.DEFAULTS;
        
        if (this.elements.gravityDisplay) {
            this.elements.gravityDisplay.textContent = defaults.GRAVITY_MULTIPLIER.toFixed(1);
        }
        
        if (this.elements.jumpDisplay) {
            this.elements.jumpDisplay.textContent = defaults.JUMP_MULTIPLIER.toFixed(1);
        }
        
        if (this.elements.gameSpeedDisplay) {
            this.elements.gameSpeedDisplay.textContent = defaults.GAME_SPEED_MULTIPLIER.toFixed(1);
        }
        
        if (this.elements.levelThresholdDisplay) {
            this.elements.levelThresholdDisplay.textContent = defaults.LEVEL_THRESHOLD.toString();
        }
        
        if (this.elements.rotationDisplay) {
            this.elements.rotationDisplay.textContent = `${defaults.ROTATION_ANGLE}°`;
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Modal controls
        if (this.elements.configButton) {
            this.elements.configButton.addEventListener('click', () => this.openModal());
        }
        
        if (this.elements.closeButton) {
            this.elements.closeButton.addEventListener('click', () => this.closeModal());
        }
        
        if (this.elements.saveButton) {
            this.elements.saveButton.addEventListener('click', () => this.saveConfiguration());
        }
        
        if (this.elements.modalOverlay) {
            this.elements.modalOverlay.addEventListener('click', () => this.closeModal());
        }
        
        // Tab navigation
        this.elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // Character configuration
        if (this.elements.customSvgTextarea) {
            this.elements.customSvgTextarea.addEventListener('input', 
                GameUtils.debounce(() => this.updatePreview(), 300));
        }
        
        if (this.elements.useCustomSvgCheckbox) {
            this.elements.useCustomSvgCheckbox.addEventListener('change', () => this.updatePreview());
        }
        
        if (this.elements.flipHorizontalCheckbox) {
            this.elements.flipHorizontalCheckbox.addEventListener('change', () => this.updatePreview());
        }
        
        // Starting level validation
        if (this.elements.startingLevelInput) {
            this.elements.startingLevelInput.addEventListener('input', (e) => {
                const value = ValidationUtils.validateNumber(
                    e.target.value,
                    GAME_CONSTANTS.VALIDATION.STARTING_LEVEL.min,
                    GAME_CONSTANTS.VALIDATION.STARTING_LEVEL.max,
                    GAME_CONSTANTS.DEFAULTS.STARTING_LEVEL
                );
                e.target.value = value;
            });
        }
        
        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen()) {
                this.closeModal();
            }
        });
    }

    /**
     * Setup character preview
     */
    setupCharacterPreview() {
        if (this.elements.svgPreview) {
            this.characterPreview = new CharacterPreview(this.elements.svgPreview);
            
            // Listen for rotation changes from drag control
            this.elements.svgPreview.addEventListener('rotationChange', (e) => {
                const angle = e.detail.angle;
                this.updateRotationControls(angle);
            });
        }
    }

    /**
     * Setup slider and input syncing
     */
    setupSliderSyncing() {
        // Define slider-input pairs
        const sliderPairs = [
            {
                slider: this.elements.rotationSlider,
                input: this.elements.rotationInput,
                display: this.elements.rotationDisplay,
                validation: GAME_CONSTANTS.VALIDATION.ROTATION,
                suffix: '°',
                callback: (value) => this.updateRotationControls(value)
            },
            {
                slider: this.elements.gravitySlider,
                input: this.elements.gravityInput,
                display: this.elements.gravityDisplay,
                validation: GAME_CONSTANTS.VALIDATION.GRAVITY,
                suffix: '',
                decimals: 1
            },
            {
                slider: this.elements.jumpSlider,
                input: this.elements.jumpInput,
                display: this.elements.jumpDisplay,
                validation: GAME_CONSTANTS.VALIDATION.JUMP,
                suffix: '',
                decimals: 1
            },
            {
                slider: this.elements.levelThresholdSlider,
                input: this.elements.levelThresholdInput,
                display: this.elements.levelThresholdDisplay,
                validation: GAME_CONSTANTS.VALIDATION.LEVEL_THRESHOLD,
                suffix: ''
            },
            {
                slider: this.elements.gameSpeedSlider,
                input: this.elements.gameSpeedInput,
                display: this.elements.gameSpeedDisplay,
                validation: GAME_CONSTANTS.VALIDATION.SPEED,
                suffix: '',
                decimals: 1
            }
        ];

        sliderPairs.forEach(pair => {
            if (pair.slider && pair.input && pair.display) {
                this.setupSliderInputSync(pair);
            }
        });
    }

    /**
     * Setup individual slider-input synchronization
     */
    setupSliderInputSync(config) {
        const { slider, input, display, validation, suffix = '', decimals = 0, callback } = config;
        
        // Slider to input sync
        const sliderHandler = () => {
            const value = parseFloat(slider.value);
            const displayValue = decimals > 0 ? value.toFixed(decimals) : value.toString();
            
            input.value = value;
            display.textContent = displayValue + suffix;
            
            if (callback) callback(value);
        };
        
        // Input to slider sync
        const inputHandler = () => {
            let value = parseFloat(input.value);
            
            if (isNaN(value)) {
                value = validation.min;
            } else {
                value = MathUtils.clamp(value, validation.min, validation.max);
            }
            
            input.value = value;
            
            // Only update slider if value is within slider range
            if (value >= validation.sliderMin && value <= validation.sliderMax) {
                slider.value = value;
            }
            
            const displayValue = decimals > 0 ? value.toFixed(decimals) : value.toString();
            display.textContent = displayValue + suffix;
            
            if (callback) callback(value);
        };
        
        slider.addEventListener('input', sliderHandler);
        input.addEventListener('input', inputHandler);
        
        // Store handlers for cleanup
        this.sliderSyncHandlers.set(slider, sliderHandler);
        this.sliderSyncHandlers.set(input, inputHandler);
    }

    /**
     * Update rotation controls from drag or other sources
     */
    updateRotationControls(angle) {
        const normalizedAngle = MathUtils.normalizeAngle(Math.round(angle));
        
        if (this.elements.rotationSlider) {
            this.elements.rotationSlider.value = normalizedAngle;
        }
        
        if (this.elements.rotationInput) {
            this.elements.rotationInput.value = normalizedAngle;
        }
        
        if (this.elements.rotationDisplay) {
            this.elements.rotationDisplay.textContent = `${normalizedAngle}°`;
        }
        
        if (this.characterPreview) {
            this.characterPreview.setRotation(normalizedAngle);
        }
        
        this.updatePreview();
    }

    /**
     * Switch configuration tab
     */
    switchTab(tabName) {
        // Remove active class from all tabs and sections
        this.elements.tabs.forEach(tab => DOMUtils.removeClass(tab, 'active'));
        this.elements.sections.forEach(section => DOMUtils.removeClass(section, 'active'));
        
        // Add active class to selected tab and section
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
        const selectedSection = DOMUtils.getElementById(`${tabName}-section`);
        
        if (selectedTab) DOMUtils.addClass(selectedTab, 'active');
        if (selectedSection) DOMUtils.addClass(selectedSection, 'active');
    }

    /**
     * Update character preview
     */
    updatePreview() {
        if (!this.characterPreview) return;
        
        const config = this.getCurrentFormConfig();
        const svgCode = config.useCustomSvg ? config.customSvg : '';
        
        this.characterPreview.updatePreview(svgCode, {
            rotationAngle: config.rotationAngle,
            flipHorizontal: config.flipHorizontal
        });
    }

    /**
     * Get current form configuration
     */
    getCurrentFormConfig() {
        return {
            // Character settings
            customSvg: this.elements.customSvgTextarea?.value.trim() || '',
            useCustomSvg: this.elements.useCustomSvgCheckbox?.checked || false,
            flipHorizontal: this.elements.flipHorizontalCheckbox?.checked || false,
            rotationAngle: parseInt(this.elements.rotationSlider?.value || '0'),
            
            // Physics settings
            gravityMultiplier: parseFloat(this.elements.gravitySlider?.value || '1.0'),
            jumpMultiplier: parseFloat(this.elements.jumpSlider?.value || '1.0'),
            gameSpeedMultiplier: parseFloat(this.elements.gameSpeedSlider?.value || '1.0'),
            
            // Difficulty settings
            startingLevel: parseInt(this.elements.startingLevelInput?.value || '1'),
            levelThreshold: parseInt(this.elements.levelThresholdSlider?.value || '200'),
            
            // Special options
            resetHighScore: this.elements.resetHighScoreCheckbox?.checked || false
        };
    }

    /**
     * Load configuration into form
     */
    loadConfiguration() {
        const config = this.currentConfig;
        
        // Character settings
        if (this.elements.customSvgTextarea) {
            this.elements.customSvgTextarea.value = config.customSvg || '';
        }
        
        if (this.elements.useCustomSvgCheckbox) {
            this.elements.useCustomSvgCheckbox.checked = config.useCustomSvg || false;
        }
        
        if (this.elements.flipHorizontalCheckbox) {
            this.elements.flipHorizontalCheckbox.checked = config.flipHorizontal || false;
        }
        
        // Update rotation controls
        this.updateRotationControls(config.rotationAngle || 0);
        
        // Physics settings
        this.setSliderValue(this.elements.gravitySlider, this.elements.gravityInput, 
            this.elements.gravityDisplay, config.gravityMultiplier, 1);
        
        this.setSliderValue(this.elements.jumpSlider, this.elements.jumpInput,
            this.elements.jumpDisplay, config.jumpMultiplier, 1);
        
        this.setSliderValue(this.elements.gameSpeedSlider, this.elements.gameSpeedInput,
            this.elements.gameSpeedDisplay, config.gameSpeedMultiplier, 1);
        
        // Difficulty settings
        if (this.elements.startingLevelInput) {
            this.elements.startingLevelInput.value = config.startingLevel || 1;
        }
        
        this.setSliderValue(this.elements.levelThresholdSlider, this.elements.levelThresholdInput,
            this.elements.levelThresholdDisplay, config.levelThreshold, 0);
        
        // Reset checkbox
        if (this.elements.resetHighScoreCheckbox) {
            this.elements.resetHighScoreCheckbox.checked = false;
        }
        
        // Update preview
        this.updatePreview();
    }

    /**
     * Set slider and input values
     */
    setSliderValue(slider, input, display, value, decimals = 0) {
        if (!slider || !input || !display) return;
        
        slider.value = value;
        input.value = value;
        const displayValue = decimals > 0 ? value.toFixed(decimals) : value.toString();
        display.textContent = displayValue;
    }

    /**
     * Save configuration
     */
    saveConfiguration() {
        const config = this.getCurrentFormConfig();
        
        // Handle high score reset
        if (config.resetHighScore) {
            gameConfigStorage.resetHighScore();
        }
        
        // Remove resetHighScore from config before saving
        delete config.resetHighScore;
        
        // Save configuration
        const result = gameConfigStorage.saveConfig(config);
        
        // Update current config
        this.currentConfig = { ...config };
        
        // Reset the checkbox
        if (this.elements.resetHighScoreCheckbox) {
            this.elements.resetHighScoreCheckbox.checked = false;
        }
        
        // Dispatch event for game to update
        document.dispatchEvent(new CustomEvent('configurationChanged', {
            detail: { config: this.currentConfig }
        }));
        
        this.closeModal();
        
        // Show success feedback
        this.showSaveSuccess();
    }

    /**
     * Show save success feedback
     */
    showSaveSuccess() {
        // Create temporary success message
        const message = document.createElement('div');
        message.textContent = 'Configuration saved!';
        message.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-weight: bold;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        document.body.appendChild(message);
        
        // Animate in
        setTimeout(() => {
            message.style.opacity = '1';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            AnimationUtils.fadeOut(message, 300).then(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            });
        }, 2000);
    }

    /**
     * Open configuration modal
     */
    openModal() {
        DOMUtils.show(this.elements.modalOverlay);
        DOMUtils.show(this.elements.configModal);
        
        // Reload current configuration
        this.loadConfiguration();
        
        // Dispatch event for game to pause
        document.dispatchEvent(new CustomEvent('configModalOpened'));
    }

    /**
     * Close configuration modal
     */
    closeModal() {
        DOMUtils.hide(this.elements.modalOverlay);
        DOMUtils.hide(this.elements.configModal);
        
        // Dispatch event for game to resume
        document.dispatchEvent(new CustomEvent('configModalClosed'));
    }

    /**
     * Check if modal is open
     */
    isModalOpen() {
        return this.elements.configModal && 
               this.elements.configModal.style.display === 'block';
    }

    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.currentConfig };
    }

    /**
     * Update configuration externally
     */
    updateConfig(newConfig) {
        this.currentConfig = { ...this.currentConfig, ...newConfig };
        
        if (this.isModalOpen()) {
            this.loadConfiguration();
        }
    }

    /**
     * Reset configuration to defaults
     */
    resetToDefaults() {
        gameConfigStorage.resetConfig();
        this.currentConfig = gameConfigStorage.loadConfig();
        
        if (this.isModalOpen()) {
            this.loadConfiguration();
        }
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('configurationChanged', {
            detail: { config: this.currentConfig }
        }));
    }

    /**
     * Cleanup
     */
    destroy() {
        // Remove event listeners
        this.sliderSyncHandlers.clear();
        
        if (this.characterPreview) {
            this.characterPreview = null;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ConfigManager
    };
} 