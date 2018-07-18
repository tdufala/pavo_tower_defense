# CS467 "Pavo" team capstone project repository
Team members: Tim Dufala, Brad Beise, Jigar Gor

Phaser 3 Project Template copied from [photonstorm/phaser3-project-template](https://github.com/photonstorm/phaser3-project-template)

### Requirements

We need [Node.js](https://nodejs.org) to install and run scripts.
Game will be hosted locally via **webpack-dev-server**.

## Install and run

Run next commands in your terminal:

| Command | Description |
|---------|-------------|
| `vim `[`webpack.config.js`](webpack.config.js) | Modify port for your environment. |
| `npm install` | Install dependencies. |
| `npm start`  | Serves up content via **webpack-dev-server** <br> Press `Ctrl + c` to kill **http-server** process. |
| `npm run start_dev` | Runs `webpack --watch` and serves content, all in the background via **forever**. <br> Use `./node_modules/forever/bin/forever list` to see log files <br> Use `tail -f <logfile>` in a separate tab to monitor logs. |
| `npm stop`  | Stops **webpack** processes running in the background via **forever**. |
