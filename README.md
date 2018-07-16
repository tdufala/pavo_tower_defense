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
| `npm stop`  | See `npm run stop_forever` |
| `npm run forever_start` | Serves up content in background via **forever** <br> `forever list` to monitor running process and see logs. |
| `npm run forever_stop`  | Kills all **webpack-dev-server** processes running under **forever** |
