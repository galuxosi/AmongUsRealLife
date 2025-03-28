# Among Us in Real Life

## Overview
This is a fork of Michaelgira23's repository. I forked it and added some features.

## New features
- No more duplicating tasks.
- Tasks were divided into 3 categories: long, short, and common.
- "I am killed/ejected" button was added.
- Lobby of players was added
- The game ends when all impostors have been ejected, or when the number of crewmates is the same as the number of impostors.
- 4 sabotages available. Each of them has its own page.
- Droidcam available.

## Installation
To set up the project locally, follow these steps:

1. **Prerequisites**:
   - Ensure you have [Node.js](https://nodejs.org/) installed.

2. **Clone the Repository**:
   ```bash
   git clone https://github.com/galuxosi/AmongUsRealLife.git
   cd AmongUsRealLife
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Start the Backend**:
   ```bash
   npm start
   ```

5. **Access the Admin Panel**:
   Open [http://localhost:5001/admin](http://localhost:5001/admin) in your browser to manage the game.

6. **Connect Players**:
   Players can join via [http://localhost:5001](http://localhost:5001) or by connecting to the local IP address of the host.

7. **Sabotages setup (Optional)**
   - Every sabotage has its URL to fix: /comms, /lights, /oxygen, /reactor.
   - Print 4 QR-Codes, each of which sends to sabotage pages
   - Now, when an impostor starts sabotage, players may fix it by scanning the URL and completing the minigame.
   - If you do not want to use any sabotages, you can delete them from the code, or tell players to ignore the buttons.

8. **[BETA] Camera setup (Optional)**
   - Take a device that would be used as CCTV. It must have an installed DroidCam on it.
   - Change the DroidCam's IP in [`src="..."`](https://github.com/galuxosi/AmongUsRealLife/blob/main/src/views/camera.html)
   - Take another device and visit a [http://localhost:5001/camera](http://localhost:5001/camera). This device will be used for watching the camera.
   - Make sure the camera is working and you can see an image from another device.
   - Install the camera in place it must filming.

## Folder Structure

```
project_root
├── src                # Game logic
├── public             # Frontend assets
├── .gitignore         # Git ignore rules
├── package.json       # Node.js dependencies
└── README.md          # Project overview
```

## Configuration
The game can be customized by modifying the following properties in `src/index.js`:

- **`TASKS`**: An array of task descriptions assigned to players.
- **`DEFAULT_COMMON_TASKS`**: Number of common tasks assigned to each player.
- **`DEFAULT_LONG_TASKS`**: Number of long tasks assigned to each player.
- **`DEFAULT_SHORT_TASKS`**: Number of short tasks assigned to each player.
- **`TASK_TYPES`**: Array of all tasks that may be assigned to the players.
- **`N_IMPOSTORS`**: Number of Impostors in the game.

Example:
```javascript
const TASKS = [
  "Swipe card",
  "Fix wiring",
  "Upload data",
];
const N_TASKS = 3;
const N_IMPOSTORS = 2;
```

## How to Play
1. **Configure the Game**:
   - Set the desired number of tasks and Impostors in `index.js`.
2. **Start the Backend**:
   - Run `npm start` and ensure the server is active.
3. **Join the Game**:
   - Have players connect to the provided URL.
4. **Begin Gameplay**:
   - Use the admin panel to start the game.

## Contribution
Contributions are welcome! Follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes.
4. Open a pull request.

## License
This project is licensed under the [MIT License](LICENSE.txt).

