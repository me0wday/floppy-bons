// FlappyRoo Game Initialization
// Simple initialization that matches the original game logic

document.addEventListener('DOMContentLoaded', () => {
    // Create the game instance - this handles all initialization
    const game = new FlappyRooGame();
    
    // The FlappyRooGame class takes care of everything:
    // - Setting up event listeners
    // - Initializing the character
    // - Setting up the config manager
    // - Loading saved settings
    // - Creating the initial UI state
    
    console.log('FlappyRoo game initialized successfully');
}); 