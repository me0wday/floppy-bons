// Main Game Engine for FlappyRoo

/**
 * Obstacle Class
 * Represents individual obstacles in the game
 */
class Obstacle {
    constructor(config) {
        this.element = null;
        this.position = { x: config.x, y: config.y };
        this.dimensions = { width: config.width, height: config.height };
        this.speed = config.speed;
        this.level = config.level;
        
        this.createElement();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.classList.add('obstacle');
        
        const cactus = document.createElement('div');
        cactus.classList.add('cactus');
        cactus.style.height = `${this.dimensions.height}px`;
        
        // Apply level-based coloring
        if (this.level > 1) {
            const hue = Math.max(60, 120 - ((this.level - 1) * 10));
            cactus.style.backgroundColor = `hsl(${hue}, 60%, 30%)`;
        }
        
        this.element.appendChild(cactus);
        this.updatePosition();
    }

    updatePosition() {
        if (this.element) {
            this.element.style.left = `${this.position.x}px`;
            this.element.style.bottom = `${this.position.y}px`;
        }
    }

    move(deltaTime) {
        this.position.x -= this.speed * deltaTime;
        this.updatePosition();
    }

    getHitbox() {
        return GameUtils.getObstacleHitbox({
            left: this.position.x,
            bottom: this.position.y,
            width: this.dimensions.width,
            height: this.dimensions.height
        });
    }

    isOffScreen() {
        return this.position.x < -this.dimensions.width * 2;
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

/**
 * Cloud Class
 * Represents background clouds
 */
class Cloud {
    constructor(config) {
        this.element = null;
        this.position = { x: config.x, y: config.y };
        this.size = config.size;
        this.speed = config.speed;
        
        this.createElement();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.classList.add('cloud');
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size / 2}px`;
        this.updatePosition();
    }

    updatePosition() {
        if (this.element) {
            this.element.style.left = `${this.position.x}px`;
            this.element.style.top = `${this.position.y}px`;
        }
    }

    move(deltaTime) {
        this.position.x -= this.speed * deltaTime;
        this.updatePosition();
    }

    isOffScreen() {
        return this.position.x < -this.size;
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

/**
 * Bird Class
 * Represents collectible birds that give points when collected
 */
class Bird {
    constructor(config) {
        this.element = null;
        this.position = { x: config.x, y: config.y };
        this.size = config.size;
        this.speed = config.speed;
        this.points = config.points;
        this.lifetime = config.lifetime;
        this.collected = false;
        this.spawnTime = Date.now();
        
        this.createElement();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.classList.add('bird');
        
        // Create simple square SVG bird for testing
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 40 40');
        svg.setAttribute('width', '40');
        svg.setAttribute('height', '40');
        
        // Simple square with some details
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '5');
        rect.setAttribute('y', '5');
        rect.setAttribute('width', '30');
        rect.setAttribute('height', '30');
        rect.setAttribute('fill', '#FFD700');
        rect.setAttribute('stroke', '#FF8C00');
        rect.setAttribute('stroke-width', '2');
        
        // Add a small circle for the eye
        const eye = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        eye.setAttribute('cx', '28');
        eye.setAttribute('cy', '15');
        eye.setAttribute('r', '3');
        eye.setAttribute('fill', '#000');
        
        // Add a small triangle for beak
        const beak = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        beak.setAttribute('points', '35,20 40,25 35,30');
        beak.setAttribute('fill', '#FF4500');
        
        svg.appendChild(rect);
        svg.appendChild(eye);
        svg.appendChild(beak);
        this.element.appendChild(svg);
        
        this.updatePosition();
    }

    updatePosition() {
        if (this.element) {
            this.element.style.left = `${this.position.x}px`;
            this.element.style.bottom = `${this.position.y}px`;
        }
    }

    move(deltaTime) {
        this.position.x -= this.speed * deltaTime;
        this.updatePosition();
    }

    getHitbox() {
        return {
            left: this.position.x,
            right: this.position.x + this.size,
            top: this.position.y,
            bottom: this.position.y + this.size
        };
    }

    isOffScreen() {
        return this.position.x < -this.size * 2;
    }

    isExpired() {
        return Date.now() - this.spawnTime > this.lifetime;
    }

    collect() {
        if (this.collected) return false;
        
        this.collected = true;
        
        // Add collection animation
        if (this.element) {
            this.element.classList.add('collected');
            
            // Remove after animation
            setTimeout(() => {
                this.destroy();
            }, 500);
        }
        
        return this.points;
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

/**
 * Main Game Engine Class
 */
class FlappyRooGame {
    constructor() {
        this.elements = this.initializeElements();
        this.character = null;
        this.configManager = null;
        
        // Game state
        this.state = GAME_CONSTANTS.STATES.START;
        this.dimensions = GameUtils.getResponsiveDimensions();
        this.config = gameConfigStorage.loadConfig();
        
        // Game objects
        this.obstacles = [];
        this.clouds = [];
        this.birds = [];
        
        // Game variables
        this.score = 0;
        this.level = this.config.startingLevel;
        this.distanceTraveled = 0;
        this.lastScoreUpdate = 0;
        this.highScore = this.config.highScore;
        
        // Physics - store base physics separately from current physics
        this.basePhysics = GameUtils.calculatePhysics({
            gravity: this.config.gravityMultiplier,
            jump: this.config.jumpMultiplier,
            speed: this.config.gameSpeedMultiplier
        }, this.dimensions);
        
        this.physics = { ...this.basePhysics };
        
        // Timing
        this.lastTime = 0;
        this.animationFrameId = null;
        this.obstacleTimer = 0;
        this.cloudTimer = 0;
        
        // Intervals
        this.obstacleInterval = null;
        this.cloudInterval = null;
        
        // Initialize asynchronously
        this.initialize().catch(error => {
            console.error('Game initialization failed:', error);
        });
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        return {
            gameContainer: DOMUtils.getElementById('game-container'),
            character: DOMUtils.getElementById('game-character'),
            
            // UI elements
            scoreDisplay: DOMUtils.getElementById('score'),
            highScoreDisplay: DOMUtils.getElementById('high-score'),
            levelDisplay: DOMUtils.getElementById('level'),
            levelUpNotification: DOMUtils.getElementById('level-up'),
            levelUpIndicator: DOMUtils.getElementById('level-up-indicator'),
            birdCollectionIndicator: DOMUtils.getElementById('bird-collection-indicator'),
            deathIndicator: DOMUtils.getElementById('death-indicator'),
            
            // Screens
            startScreen: DOMUtils.getElementById('start-screen'),
            gameOverScreen: DOMUtils.getElementById('game-over'),
            
            // Buttons
            startButton: DOMUtils.getElementById('start-button'),
            restartButton: DOMUtils.getElementById('restart-button'),
            
            // Game over display
            finalScore: DOMUtils.getElementById('final-score'),
            finalHighScore: DOMUtils.getElementById('final-high-score'),
            finalLevel: DOMUtils.getElementById('final-level'),
            
            // Config display
            configGravity: DOMUtils.getElementById('config-gravity'),
            configJump: DOMUtils.getElementById('config-jump'),
            configSpeed: DOMUtils.getElementById('config-speed'),
            configThreshold: DOMUtils.getElementById('config-threshold')
        };
    }

    /**
     * Initialize game
     */
    async initialize() {
        this.setupEventListeners();
        await this.setupCharacter();
        this.setupConfigManager();
        this.updateUI();
        this.createInitialClouds();
        
        // Handle window resize
        window.addEventListener('resize', GameUtils.debounce(() => {
            this.handleResize();
        }, 250));
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Button events
        if (this.elements.startButton) {
            this.elements.startButton.addEventListener('click', () => this.startGame());
        }
        
        if (this.elements.restartButton) {
            this.elements.restartButton.addEventListener('click', () => this.startGame());
        }
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Touch/click events
        if (this.elements.gameContainer) {
            this.elements.gameContainer.addEventListener('click', (e) => this.handleClick(e));
            this.elements.gameContainer.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
        }
        
        // Configuration events
        document.addEventListener('configurationChanged', (e) => {
            this.handleConfigurationChange(e.detail.config);
        });
        
        document.addEventListener('configModalOpened', () => {
            this.pauseGame();
        });
        
        document.addEventListener('configModalClosed', () => {
            this.resumeGame();
        });
        
        // Error handling
        window.addEventListener('error', (e) => {
            // Only handle game-related errors, not all window errors
            if (this.state === GAME_CONSTANTS.STATES.PLAYING) {
                console.error('Game error:', e);
                this.handleError(e);
            }
        });
    }

    /**
     * Setup character
     */
    async setupCharacter() {
        if (this.elements.character) {
            this.character = new Character(this.elements.character, this.config);
            // Wait for character to load its default SVG
            await this.character.initialize();
        }
    }

    /**
     * Setup configuration manager
     */
    setupConfigManager() {
        this.configManager = new ConfigManager();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.dimensions = GameUtils.getResponsiveDimensions();
        
        // Update base physics based on new dimensions
        this.basePhysics = GameUtils.calculatePhysics({
            gravity: this.config.gravityMultiplier,
            jump: this.config.jumpMultiplier,
            speed: this.config.gameSpeedMultiplier
        }, this.dimensions);
        
        // Recalculate current physics based on current level
        const difficulty = GameUtils.calculateDifficulty(this.level, this.config.startingLevel);
        this.physics = {
            gravity: this.basePhysics.gravity,
            jumpStrength: this.basePhysics.jumpStrength,
            gameSpeed: this.basePhysics.gameSpeed * difficulty.speedMultiplier
        };
        
        // Update character dimensions
        if (this.character) {
            this.character.updateDimensions();
        }
        
        // Reposition character if not playing
        if (this.state !== GAME_CONSTANTS.STATES.PLAYING) {
            if (this.character) {
                this.character.resetPosition();
            }
        }
    }

    /**
     * Handle keyboard input
     */
    handleKeyDown(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            
            switch (this.state) {
                case GAME_CONSTANTS.STATES.START:
                    this.startGame();
                    break;
                case GAME_CONSTANTS.STATES.PLAYING:
                    this.jump();
                    break;
                case GAME_CONSTANTS.STATES.GAME_OVER:
                    this.startGame();
                    break;
                // Explicitly ignore input in other states
                default:
                    break;
            }
        }
    }

    /**
     * Handle click input
     */
    handleClick(e) {
        // Don't handle clicks on config elements
        if (this.isConfigClick(e)) return;
        
        // Block all input except for specific states
        if (this.state === GAME_CONSTANTS.STATES.PAUSED || 
            this.state === GAME_CONSTANTS.STATES.CONFIG) {
            return;
        }
        
        switch (this.state) {
            case GAME_CONSTANTS.STATES.START:
                this.startGame();
                break;
            case GAME_CONSTANTS.STATES.PLAYING:
                this.jump();
                break;
            case GAME_CONSTANTS.STATES.GAME_OVER:
                this.startGame();
                break;
        }
    }

    /**
     * Handle touch input
     */
    handleTouch(e) {
        // Don't handle touches on config elements
        if (this.isConfigClick(e)) return;
        
        e.preventDefault();
        this.handleClick(e);
    }

    /**
     * Check if click/touch is on config elements
     */
    isConfigClick(e) {
        const configButton = DOMUtils.getElementById('config-button');
        const configModal = DOMUtils.getElementById('config-modal');
        
        return (configButton && configButton.contains(e.target)) ||
               (configModal && configModal.contains(e.target));
    }

    /**
     * Handle configuration changes
     */
    handleConfigurationChange(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Update base physics
        this.basePhysics = GameUtils.calculatePhysics({
            gravity: this.config.gravityMultiplier,
            jump: this.config.jumpMultiplier,
            speed: this.config.gameSpeedMultiplier
        }, this.dimensions);
        
        // Recalculate current physics based on current level
        const difficulty = GameUtils.calculateDifficulty(this.level, this.config.startingLevel);
        this.physics = {
            gravity: this.basePhysics.gravity,
            jumpStrength: this.basePhysics.jumpStrength,
            gameSpeed: this.basePhysics.gameSpeed * difficulty.speedMultiplier
        };
        
        // Update character
        if (this.character) {
            this.character.updateConfig(this.config);
        }
        
        // Update high score display
        this.highScore = gameConfigStorage.loadConfig().highScore;
        this.updateUI();
    }

    /**
     * Start game
     */
    startGame() {
        this.state = GAME_CONSTANTS.STATES.PLAYING;
        
        // Reset game variables
        this.score = 0;
        this.level = this.config.startingLevel;
        this.distanceTraveled = 0;
        this.lastScoreUpdate = 0;
        
        // Reset physics to base values
        this.physics = { ...this.basePhysics };
        
        // Clear obstacles and clouds
        this.clearObstacles();
        this.clearClouds();
        this.clearBirds();
        this.createInitialClouds();
        
        // Reset character
        if (this.character) {
            this.character.resetPosition();
        }
        
        // Hide screens
        DOMUtils.hide(this.elements.startScreen);
        DOMUtils.hide(this.elements.gameOverScreen);
        DOMUtils.hide(this.elements.deathIndicator);
        
        // Update UI
        this.updateUI();
        
        // Start game loop
        this.lastTime = performance.now();
        this.startGameLoop();
        
        // Start obstacle spawning after delay
        setTimeout(() => {
            if (this.state === GAME_CONSTANTS.STATES.PLAYING) {
                this.startObstacleSpawning();
            }
        }, GAME_CONSTANTS.OBSTACLE_SPAWN_DELAY);
        
        // Start cloud spawning
        this.startCloudSpawning();
    }

    /**
     * Jump action
     */
    jump() {
        if (this.character && this.state === GAME_CONSTANTS.STATES.PLAYING) {
            this.character.jump(this.physics.jumpStrength);
        }
    }

    /**
     * Pause game
     */
    pauseGame() {
        if (this.state === GAME_CONSTANTS.STATES.PLAYING) {
            this.state = GAME_CONSTANTS.STATES.PAUSED;
            this.stopGameLoop();
            this.stopSpawning();
        }
    }

    /**
     * Resume game
     */
    resumeGame() {
        if (this.state === GAME_CONSTANTS.STATES.PAUSED) {
            this.state = GAME_CONSTANTS.STATES.PLAYING;
            this.lastTime = performance.now();
            this.startGameLoop();
            this.startObstacleSpawning();
            this.startCloudSpawning();
        }
    }

    /**
     * End game
     */
    endGame(reason = 'Unknown') {
        // Prevent multiple calls to endGame
        if (this.state === GAME_CONSTANTS.STATES.GAME_OVER) {
            return;
        }
        
        console.log('Game over:', reason);
        
        this.state = GAME_CONSTANTS.STATES.GAME_OVER;
        this.stopGameLoop();
        this.stopSpawning();
        
        // Stop character movement immediately
        if (this.character) {
            this.character.stop();
            this.character.flash();
        }
        
        // Show death indicator
        DOMUtils.show(this.elements.deathIndicator);
        setTimeout(() => {
            DOMUtils.hide(this.elements.deathIndicator);
        }, GAME_CONSTANTS.DEATH_FLASH_DURATION);
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            gameConfigStorage.saveHighScore(this.highScore);
        }
        
        // Show game over screen immediately
        this.showGameOverScreen();
    }

    /**
     * Show game over screen
     */
    showGameOverScreen() {
        // Update final scores
        DOMUtils.setText(this.elements.finalScore, this.score);
        DOMUtils.setText(this.elements.finalHighScore, this.highScore);
        DOMUtils.setText(this.elements.finalLevel, this.level);
        
        // Update config display
        this.updateConfigDisplay();
        
        // Show the game over screen (DOMUtils.show now handles flex display properly)
        DOMUtils.show(this.elements.gameOverScreen);
    }

    /**
     * Start game loop
     */
    startGameLoop() {
        const gameLoop = (currentTime) => {
            // Always check state first - if not playing, don't continue
            if (this.state !== GAME_CONSTANTS.STATES.PLAYING) {
                this.animationFrameId = null;
                return;
            }
            
            try {
                const deltaTime = (currentTime - this.lastTime) / 16.67; // Normalize to 60fps
                this.lastTime = currentTime;
                
                this.update(deltaTime);
                
                // Only continue if still playing after update
                if (this.state === GAME_CONSTANTS.STATES.PLAYING) {
                    this.animationFrameId = PerformanceUtils.requestAnimationFrame(gameLoop);
                } else {
                    this.animationFrameId = null;
                }
            } catch (error) {
                console.error('Game loop error:', error);
                this.animationFrameId = null;
                // Don't call endGame here to prevent recursion
                this.state = GAME_CONSTANTS.STATES.GAME_OVER;
            }
        };
        
        this.animationFrameId = PerformanceUtils.requestAnimationFrame(gameLoop);
    }

    /**
     * Stop game loop
     */
    stopGameLoop() {
        if (this.animationFrameId) {
            try {
                PerformanceUtils.cancelAnimationFrame(this.animationFrameId);
            } catch (error) {
                console.warn('Error canceling animation frame:', error);
                // Try direct method as fallback
                if (window.cancelAnimationFrame) {
                    window.cancelAnimationFrame(this.animationFrameId);
                }
            }
            this.animationFrameId = null;
        }
    }

    /**
     * Main game update loop
     */
    update(deltaTime) {
        // Double-check state before doing anything
        if (this.state !== GAME_CONSTANTS.STATES.PLAYING || !this.character) {
            return;
        }
        
        // Apply gravity and check collisions
        const collision = this.character.applyGravity(
            this.physics.gravity * deltaTime,
            this.dimensions.groundHeight,
            this.dimensions.ceilingHeight,
            this.dimensions.height
        );
        
        if (collision) {
            this.endGame(`${collision} collision`);
            return;
        }
        
        // Check state again after gravity (in case endGame was called)
        if (this.state !== GAME_CONSTANTS.STATES.PLAYING) {
            return;
        }
        
        // Update obstacles
        this.updateObstacles(deltaTime);
        
        // Update clouds
        this.updateClouds(deltaTime);
        
        // Update birds
        this.updateBirds(deltaTime);
        
        // Update score
        this.updateScore(deltaTime);
        
        // Check obstacle collisions
        if (this.checkObstacleCollisions()) {
            this.endGame('Obstacle collision');
            return;
        }
        
        // Check bird collisions for collection
        this.checkBirdCollisions();
    }

    /**
     * Update obstacles
     */
    updateObstacles(deltaTime) {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.move(deltaTime);
            
            if (obstacle.isOffScreen()) {
                obstacle.destroy();
                this.obstacles.splice(i, 1);
            }
        }
    }

    /**
     * Update clouds
     */
    updateClouds(deltaTime) {
        for (let i = this.clouds.length - 1; i >= 0; i--) {
            const cloud = this.clouds[i];
            cloud.move(deltaTime);
            
            if (cloud.isOffScreen()) {
                cloud.destroy();
                this.clouds.splice(i, 1);
            }
        }
    }

    /**
     * Update birds
     */
    updateBirds(deltaTime) {
        for (let i = this.birds.length - 1; i >= 0; i--) {
            const bird = this.birds[i];
            
            if (bird.collected) {
                // Skip collected birds (they will be removed after animation)
                continue;
            }
            
            bird.move(deltaTime);
            
            // Remove if off-screen or expired
            if (bird.isOffScreen() || bird.isExpired()) {
                bird.destroy();
                this.birds.splice(i, 1);
            }
        }
    }

    /**
     * Update score
     */
    updateScore(deltaTime) {
        this.distanceTraveled += this.physics.gameSpeed * deltaTime;
        
        if (this.distanceTraveled - this.lastScoreUpdate >= GAME_CONSTANTS.SCORE_UPDATE_DISTANCE) {
            const pointsToAdd = Math.floor((this.distanceTraveled - this.lastScoreUpdate) / GAME_CONSTANTS.SCORE_UPDATE_DISTANCE);
            this.score += pointsToAdd;
            this.lastScoreUpdate = this.distanceTraveled;
            
            // Check for level up
            const newLevel = Math.floor(this.score / this.config.levelThreshold) + this.config.startingLevel;
            if (newLevel > this.level) {
                this.levelUp(newLevel);
            }
            
            this.updateUI();
        }
    }

    /**
     * Level up
     */
    levelUp(newLevel) {
        this.level = newLevel;
        
        // Show small level up indicator
        this.showLevelUpIndicator();
        
        // Update difficulty - calculate from base physics to avoid compounding
        const difficulty = GameUtils.calculateDifficulty(this.level, this.config.startingLevel);
        this.physics.gameSpeed = this.basePhysics.gameSpeed * difficulty.speedMultiplier;
        
        // Update obstacle spawning frequency
        this.updateObstacleSpawning(difficulty);
        
        this.updateUI();
    }

    /**
     * Show small level up indicator next to level
     */
    showLevelUpIndicator() {
        if (this.elements.levelUpIndicator) {
            // Remove any existing animation class
            DOMUtils.removeClass(this.elements.levelUpIndicator, 'animate');
            
            // Trigger reflow and add animation class
            this.elements.levelUpIndicator.offsetHeight;
            DOMUtils.addClass(this.elements.levelUpIndicator, 'animate');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                DOMUtils.removeClass(this.elements.levelUpIndicator, 'animate');
            }, 400);
        }
    }

    /**
     * Show bird collection indicator next to score
     */
    showBirdCollectionIndicator(points) {
        if (this.elements.birdCollectionIndicator) {
            // Update the text to show the actual points collected
            DOMUtils.setText(this.elements.birdCollectionIndicator, `+${points}`);
            
            // Remove any existing animation class
            DOMUtils.removeClass(this.elements.birdCollectionIndicator, 'animate');
            
            // Trigger reflow and add animation class
            this.elements.birdCollectionIndicator.offsetHeight;
            DOMUtils.addClass(this.elements.birdCollectionIndicator, 'animate');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                DOMUtils.removeClass(this.elements.birdCollectionIndicator, 'animate');
            }, 400);
        }
    }

    /**
     * Update obstacle spawning with new difficulty
     */
    updateObstacleSpawning(difficulty) {
        if (this.obstacleInterval) {
            clearInterval(this.obstacleInterval);
            this.obstacleInterval = setInterval(() => {
                if (this.state === GAME_CONSTANTS.STATES.PLAYING) {
                    this.createObstacle();
                }
            }, difficulty.obstacleFrequency);
        }
    }

    /**
     * Check obstacle collisions
     */
    checkObstacleCollisions() {
        if (!this.character) return false;
        
        const characterHitbox = this.character.getHitbox();
        
        for (const obstacle of this.obstacles) {
            const obstacleHitbox = obstacle.getHitbox();
            
            if (GameUtils.checkCollision(characterHitbox, obstacleHitbox)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Start obstacle spawning
     */
    startObstacleSpawning() {
        this.stopObstacleSpawning(); // Clear any existing interval
        
        const spawnObstacle = () => {
            if (this.state === GAME_CONSTANTS.STATES.PLAYING) {
                this.createObstacle();
            }
        };
        
        const difficulty = GameUtils.calculateDifficulty(this.level, this.config.startingLevel);
        this.obstacleInterval = setInterval(spawnObstacle, difficulty.obstacleFrequency);
    }

    /**
     * Stop obstacle spawning
     */
    stopObstacleSpawning() {
        if (this.obstacleInterval) {
            clearInterval(this.obstacleInterval);
            this.obstacleInterval = null;
        }
    }

    /**
     * Start cloud spawning
     */
    startCloudSpawning() {
        this.stopCloudSpawning(); // Clear any existing interval
        
        const spawnCloud = () => {
            if (this.state === GAME_CONSTANTS.STATES.PLAYING && this.clouds.length < GAME_CONSTANTS.CLOUD_MAX_COUNT) {
                this.createCloud();
            }
        };
        
        this.cloudInterval = setInterval(spawnCloud, GAME_CONSTANTS.CLOUD_SPAWN_INTERVAL);
    }

    /**
     * Stop cloud spawning
     */
    stopCloudSpawning() {
        if (this.cloudInterval) {
            clearInterval(this.cloudInterval);
            this.cloudInterval = null;
        }
    }

    /**
     * Stop all spawning
     */
    stopSpawning() {
        this.stopObstacleSpawning();
        this.stopCloudSpawning();
    }

    /**
     * Create obstacle
     */
    createObstacle() {
        const difficulty = GameUtils.calculateDifficulty(this.level, this.config.startingLevel);
        
        // Calculate obstacle properties
        const heightPercent = MathUtils.random(0.1, difficulty.heightVariation);
        const height = this.dimensions.height * heightPercent;
        const width = this.dimensions.height * GAME_CONSTANTS.CACTUS_WIDTH_VH;
        
        // Random vertical position
        const minY = this.dimensions.groundHeight + 5;
        const maxY = this.dimensions.height * (0.5 + (this.level - this.config.startingLevel) * 0.05);
        const y = MathUtils.random(minY, maxY);
        
        const obstacle = new Obstacle({
            x: this.dimensions.width,
            y: y,
            width: width,
            height: height,
            speed: this.physics.gameSpeed * difficulty.speedMultiplier,
            level: this.level
        });
        
        this.elements.gameContainer.appendChild(obstacle.element);
        this.obstacles.push(obstacle);
        
        // Chance to spawn a bird (very rare)
        if (Math.random() < GAME_CONSTANTS.BIRD_SPAWN_CHANCE) {
            this.tryCreateBird();
        }
    }

    /**
     * Create cloud
     */
    createCloud() {
        const size = MathUtils.random(
            this.dimensions.height * GAME_CONSTANTS.CLOUD_SIZE_MIN_VH,
            this.dimensions.height * GAME_CONSTANTS.CLOUD_SIZE_MAX_VH
        );
        
        const y = MathUtils.random(
            this.dimensions.height * 0.1,
            this.dimensions.height * 0.4
        );
        
        const speed = MathUtils.random(
            this.dimensions.width * GAME_CONSTANTS.CLOUD_SPEED_MIN,
            this.dimensions.width * GAME_CONSTANTS.CLOUD_SPEED_MAX
        );
        
        const cloud = new Cloud({
            x: MathUtils.random(this.dimensions.width, this.dimensions.width * 1.5),
            y: y,
            size: size,
            speed: speed
        });
        
        this.elements.gameContainer.appendChild(cloud.element);
        this.clouds.push(cloud);
    }

    /**
     * Try to create a bird in a safe location
     */
    tryCreateBird() {
        console.log('Attempting to create a bird...');
        
        const size = this.dimensions.height * GAME_CONSTANTS.BIRD_SIZE_VH;
        const speed = this.physics.gameSpeed * GAME_CONSTANTS.BIRD_SPEED_MULTIPLIER;
        
        // Try to find a safe position away from obstacles
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            const x = MathUtils.random(this.dimensions.width, this.dimensions.width * 1.5);
            const y = MathUtils.random(
                this.dimensions.groundHeight + size + 20,
                this.dimensions.height - this.dimensions.ceilingHeight - size - 20
            );
            
            // Check if position is safe (not too close to obstacles)
            if (this.isBirdPositionSafe(x, y, size)) {
                console.log(`Found safe position for bird after ${attempts + 1} attempts`);
                this.createBird(x, y, size, speed);
                return;
            }
            
            attempts++;
        }
        
        // If no safe position found, don't create bird this time
        console.log('Could not find safe position for bird after', maxAttempts, 'attempts');
    }

    /**
     * Check if bird position is safe from obstacles
     */
    isBirdPositionSafe(x, y, size) {
        const minDistance = GAME_CONSTANTS.BIRD_MIN_DISTANCE_FROM_OBSTACLES;
        
        for (const obstacle of this.obstacles) {
            const dx = Math.abs(x - (obstacle.position.x + obstacle.dimensions.width / 2));
            const dy = Math.abs(y - (obstacle.position.y + obstacle.dimensions.height / 2));
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Create bird
     */
    createBird(x, y, size, speed) {
        console.log(`Creating bird at position (${x}, ${y}) with size ${size}`);
        
        const bird = new Bird({
            x: x,
            y: y,
            size: size,
            speed: speed,
            points: GAME_CONSTANTS.BIRD_POINTS,
            lifetime: GAME_CONSTANTS.BIRD_LIFETIME
        });
        
        this.elements.gameContainer.appendChild(bird.element);
        this.birds.push(bird);
    }

    /**
     * Check bird collisions for collection
     */
    checkBirdCollisions() {
        if (!this.character) return;
        
        const characterHitbox = this.character.getHitbox();
        
        for (let i = this.birds.length - 1; i >= 0; i--) {
            const bird = this.birds[i];
            
            if (bird.collected) continue;
            
            const birdHitbox = bird.getHitbox();
            
            if (GameUtils.checkCollision(characterHitbox, birdHitbox)) {
                const points = bird.collect();
                if (points > 0) {
                    this.score += points;
                    this.updateUI();
                    
                    // Remove from array after collection
                    setTimeout(() => {
                        const index = this.birds.indexOf(bird);
                        if (index > -1) {
                            this.birds.splice(index, 1);
                        }
                    }, 500);
                    
                    console.log(`Bird collected! +${points} points`);
                    this.showBirdCollectionIndicator(points);
                }
            }
        }
    }

    /**
     * Create initial clouds
     */
    createInitialClouds() {
        for (let i = 0; i < 5; i++) {
            this.createCloud();
        }
    }

    /**
     * Clear all obstacles
     */
    clearObstacles() {
        this.obstacles.forEach(obstacle => obstacle.destroy());
        this.obstacles = [];
    }

    /**
     * Clear all clouds
     */
    clearClouds() {
        this.clouds.forEach(cloud => cloud.destroy());
        this.clouds = [];
    }

    /**
     * Clear all birds
     */
    clearBirds() {
        this.birds.forEach(bird => bird.destroy());
        this.birds = [];
    }

    /**
     * Update UI elements
     */
    updateUI() {
        DOMUtils.setText(this.elements.scoreDisplay, GameUtils.formatScore(this.score));
        DOMUtils.setText(this.elements.highScoreDisplay, GameUtils.formatScore(this.highScore));
        DOMUtils.setText(this.elements.levelDisplay, this.level);
    }

    /**
     * Update config display in game over screen
     */
    updateConfigDisplay() {
        DOMUtils.setText(this.elements.configGravity, this.config.gravityMultiplier.toFixed(1));
        DOMUtils.setText(this.elements.configJump, this.config.jumpMultiplier.toFixed(1));
        DOMUtils.setText(this.elements.configSpeed, this.config.gameSpeedMultiplier.toFixed(1));
        DOMUtils.setText(this.elements.configThreshold, this.config.levelThreshold);
    }

    /**
     * Handle errors
     */
    handleError(error) {
        console.error('Game error:', error);
        
        // Don't call endGame from error handler to prevent recursion
        // Just log the error and let the game continue or naturally end
        // Only stop the game loop if it's still running
        if (this.state === GAME_CONSTANTS.STATES.PLAYING && this.animationFrameId) {
            this.stopGameLoop();
            console.warn('Game loop stopped due to error');
        }
    }

    /**
     * Destroy game (cleanup)
     */
    destroy() {
        this.stopGameLoop();
        this.stopSpawning();
        this.clearObstacles();
        this.clearClouds();
        this.clearBirds();
        
        if (this.character) {
            this.character.destroy();
        }
        
        if (this.configManager) {
            this.configManager.destroy();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FlappyRooGame,
        Obstacle,
        Cloud,
        Bird
    };
} 