'use strict';

process.env.NODE_CONFIG_DIR = `${__dirname}/config`;

const async = require('async');
const fs = require('fs');


const Discord = require("discord.js");
const client = new Discord.Client();
const db = require('./logic/db');
const app = require('./logic/app');
const mail = require('./logic/mail');
const api = require('./logic/api');
const io = require('./logic/io');
const stations = require('./logic/stations');
const songs = require('./logic/songs');
const playlists = require('./logic/playlists');
const cache = require('./logic/cache');
const notifications = require('./logic/notifications');
const logger = require('./logic/logger');
const tasks = require('./logic/tasks');
const config = require('config');

let currentComponent;

process.on('uncaughtException', err => {
	//console.log(`ERROR: ${err.message}`);
	console.log(`ERROR: ${err.stack}`);
});

client.on('ready', () => {
	discordClientCBS.forEach((cb) => {
		cb();
	});
	console.log(`DISCORD Logged in as ${client.user.username}!`);
	//this.logToDiscord("Lost connection to MongoDB. Crashing server.", "Database error", true, [{name: 'Error', value: 'MONGOERR: ERRCNNCT 127.0.0.1 FAILED TO CONNECT', inline: false}], (err) => {console.log(err);});
});

client.login(config.get('apis.discord.token'));

let discordClientCBS = [];
const getDiscordClient = (cb) => {
	if (client.status === 0) return cb();
	else discordClientCBS.push(cb);
};

const logToDiscord = (message, color, type, critical, extraFields, cb = ()=>{}) => {
	getDiscordClient(() => {
		let richEmbed = new Discord.RichEmbed();
		richEmbed.setAuthor("Musare Logger", "https://musare.com/favicon-194x194.png", "https://musare.com");
		richEmbed.setColor(color);
		richEmbed.setDescription(message);
		//richEmbed.setFooter("Footer", "https://musare.com/favicon-194x194.png");
		//richEmbed.setImage("https://musare.com/favicon-194x194.png");
		//richEmbed.setThumbnail("https://musare.com/favicon-194x194.png");
		richEmbed.setTimestamp(new Date());
		richEmbed.setTitle("MUSARE ALERT");
		richEmbed.setURL("https://musare.com");
		richEmbed.addField("Type:", type, true);
		richEmbed.addField("Critical:", (critical) ? 'True' : 'False', true);
		extraFields.forEach((extraField) => {
			richEmbed.addField(extraField.name, extraField.value, extraField.inline);
		});
		/*client.channels.get(config.get('apis.discord.loggingChannel')).sendEmbed(richEmbed).then(() => {
			cb();
		}).then((reason) => {
			cb(reason);
		});*/
	});
};

async.waterfall([

	// setup our Redis cache
	(next) => {
		currentComponent = 'Cache';
		cache.init(config.get('redis').url, config.get('redis').password, () => {
			next();
		});
	},

	// setup our MongoDB database
	(next) => {
		currentComponent = 'DB';
		db.init(config.get("mongo").url, next);
	},

	// setup the express server
	(next) => {
		currentComponent = 'App';
		app.init(next);
	},

	// setup the mail
	(next) => {
		currentComponent = 'Mail';
		mail.init(next);
	},

	// setup the socket.io server (all client / server communication is done over this)
	(next) => {
		currentComponent = 'IO';
		io.init(next);
	},

	// setup the notifications
	(next) => {
		currentComponent = 'Notifications';
		notifications.init(config.get('redis').url, config.get('redis').password, next);
	},

	// setup the stations
	(next) => {
		currentComponent = 'Stations';
		stations.init(next)
	},

	// setup the songs
	(next) => {
		currentComponent = 'Songs';
		songs.init(next)
	},

	// setup the playlists
	(next) => {
		currentComponent = 'Playlists';
		playlists.init(next)
	},

	// setup the API
	(next) => {
		currentComponent = 'API';
		api.init(next)
	},

	// setup the logger
	(next) => {
		currentComponent = 'Logger';
		logger.init(next)
	},

	// setup the tasks system
	(next) => {
		currentComponent = 'Tasks';
		tasks.init(next)
	},

	// setup the frontend for local setups
	(next) => {
		currentComponent = 'Windows';
		if (!config.get("isDocker")) {
			const express = require('express');
			const app = express();
			app.listen(80);
			const rootDir = __dirname.substr(0, __dirname.lastIndexOf("backend")) + "frontend\\build\\";

			app.get("/*", (req, res) => {
				const path = req.path;
				fs.access(rootDir + path, function(err) {
					if (!err) {
						res.sendFile(rootDir + path);
					} else {
						res.sendFile(rootDir + "index.html");
					}
				});
			});
		}
		next();
	}
], (err) => {
	if (err && err !== true) {
		logToDiscord("An error occurred while initializing the backend server.", "#FF0000", "Startup error", true, [{name: "Error:", value: err, inline: false}, {name: "Component:", value: currentComponent, inline: true}])
		console.error('An error occurred while initializing the backend server');
		console.error(err);

		process.exit();
	} else {
		logToDiscord("The backend server started successfully.", "#00AA00", "Startup", false);
		console.info('Backend server has been successfully started');
	}
});
