const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const players = new Array();

let orbx = 0;
let orby = 0;

function makeOrb(){
	orbx = Math.floor(Math.random()*98);
	orby = Math.floor(Math.random()*98);
}

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
	let id;
	socket.on("disconnect", () => {
		for (i of players){
			if (id == i.name){
				players.splice(players.indexOf(i), 1);
			}
		}
		io.emit("leave", id);
		io.emit("players", players);
		console.log("A user disconnected");
	});
	socket.on("player", (plr) => {
		id = plr.name;
		players.push(plr);
		io.emit("player", plr.name);
		io.emit("players", players);
	});
	socket.on("position", (plr) => {
		for (i of players){
			if (i.name == plr.name){
				i.x = plr.x;
				i.y = plr.y;
			}
		}
		io.emit("players", players);
	});
	socket.on("lost", (user) => {
		for (i of players){
			if (i.name == user){
				players.splice(players.indexOf(i), 1);
			}
		}
		io.emit("players", players);
		io.emit("lost", user);
	});
	socket.on("orb", () => {
		makeOrb();
		io.emit("orb", {
			orbx,
			orby
		});
	});
	if (players.length < 1){
		makeOrb();
		io.emit("orb", {
			orbx,
			orby
		});
	}
	console.log("A user connectd!");
});

http.listen(process.env.PORT || 3000, () => {
	console.log("Listening to port 3000...");
});