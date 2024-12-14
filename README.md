# Among Us in real life

## Overview
This is a fork of michaelgira23 repository. I forked it and upgraded it.

## Features
- Assign roles as Impostors or Crewmates.
- Randomly distribute tasks to players.
- Checking task as done will fill the global task progress.
- 4 sabotages available.
- CCTV Camera that connected to the game.
- Simple and intuitive interface for managing the game.

## Installation
To set up the project locally, follow these steps:

1. **Prerequisites**:
   - Ensure you have [Node.js](https://nodejs.org/) installed.

2. **Clone the Repository**:
   ```bash
   git clone (https://github.com/galuxosi/AmongUsRealLife.git)
   cd AmongUsRealLife
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   npm ci
   npm install --include=dev
   ```

4. **Sabotages setup (Optional)**
   - Identify the devices or systems you want to use for sabotage tasks (e.g., laptops, tablets, or smartphones).
   - Deploy sabotage-specific web pages or applications to these devices. These can simulate sabotages like reactor meltdown or oxygen depletion.
   - Specific requirements for sabotages:
     - **Reactor Sabotage**: Requires **2 devices**. Players must interact with both devices simultaneously to fix the sabotage. Visit [http://localhost:5001/reactor](http://localhost:5001/reactor) on both devices.
     - **Oxygen Sabotage**: Requires **1 device** for players to input the oxygen code. Visit [http://localhost:5001/oxygen](http://localhost:5001/oxygen) on the device.
     - **Other Sabotages**: Do not require additional devices.
   - If you do not want to use any sabotages, you just can delete them from the code, or just ignore the buttons.

5. **[BETA] Camera setup (Optional)**
   - Take a device that would be used as CCTV. It must have an installed DroidCam on it.
   - Change the DroidCam's IP in [`src="..."`](https://github.com/galuxosi/AmongUsRealLife/blob/main/src/views/camera.html)
   - Take an another device and visit a [http://localhost:5001/camera](http://localhost:5001/camera). This device will be used for watching the camera.
   - Make sure the camera is working and you can see an image from it on another device.
   - Install the camera on place it must filming.

7. **Start the Backend**:
   ```bash
   npm start
   ```

8. **Access the Admin Panel**:
   Open [http://localhost:5001/admin](http://localhost:5001/admin) in your browser to manage the game.

9. **Connect Players**:
   Players can join via [http://localhost:5001](http://localhost:5001) or by connecting to the local IP address of the host.



## Folder Structure

```
project_root
├── src                # Game logic
├── public             # Frontend assets
├── config             # Configuration files
├── .gitignore         # Git ignore rules
├── package.json       # Node.js dependencies
└── README.md          # Project overview
```

## Configuration
The game can be customized by modifying the following properties in `src/index.js`:

- **`TASKS`**: An array of task descriptions assigned to players.
- **`N_TASKS`**: Number of tasks assigned to each player.
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
This project is licensed under the [GPL-3.0 License](LICENSE).

