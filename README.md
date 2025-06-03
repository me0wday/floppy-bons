# Flappy Bons

A modern, modular game clone featuring a Bons with customizable physics, collectible birds, and responsive design.

## 🎮 Play the Game

**[Play Flappy Bons Online](https://yourusername.github.io/flappy-bons)**

## ✨ Features

- **Custom Character**: Bons character loaded from SVG file
- **Collectible Birds**: Golden birds worth 20 points each
- **Progressive Difficulty**: Increasing speed and obstacle frequency
- **Customizable Physics**: Adjust gravity, jump power, and game speed
- **Responsive Design**: Works on desktop and mobile devices
- **Local Storage**: Save your configuration preferences
- **Modern Architecture**: Modular ES6+ JavaScript with clean separation

## 🎯 How to Play

- **Spacebar** or **Click/Touch** to jump
- Avoid the cacti obstacles
- Collect golden birds for bonus points
- Survive as long as possible to increase your level

## 🛠️ Technical Details

- **Pure HTML/CSS/JavaScript** - No frameworks or build tools required
- **Modular Architecture** - 9 separate files for maintainability
- **Responsive Design** - Uses vh/vw units for consistent scaling
- **Memory Management** - Proper cleanup and leak prevention
- **Cross-browser Compatible** - Works in all modern browsers

## 📁 Project Structure

```
├── index.html          # Main HTML structure
├── styles.css          # Responsive styling
├── main.js            # Game initialization
├── constants.js       # Configuration constants
├── utils.js           # Utility functions
├── storage.js         # Local storage management
├── character.js       # Character system
├── config.js          # Configuration UI
├── game.js            # Main game engine
├── bonnie.svg         # Character asset
└── README.md          # This file
```

## 🚀 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/flappy-bons.git
   cd flappy-bons
   ```

2. Open `index.html` in your browser or serve with a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

3. Navigate to `http://localhost:8000`

## 🎨 Customization

The game includes a configuration panel accessible via the settings button. You can customize:

- **Physics**: Gravity strength, jump power, game speed
- **Difficulty**: Level progression rate
- **Character**: Upload custom SVG or modify rotation settings

## 📱 Mobile Support

- Touch controls for jumping
- Responsive layout adapts to screen size
- Portrait and landscape orientations supported

## 🏆 Credits

Originally refactored from a monolithic HTML file into a modular, maintainable codebase. Features modern JavaScript patterns, proper error handling, and performance optimizations.

## 📄 License

MIT License - Feel free to use and modify for your own projects! 