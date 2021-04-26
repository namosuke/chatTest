var express = require("express");
var app = express();
var http = require("http").Server(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 7000; //アプリとし公開している場合はprocess.env.PORTの値を参照　ローカルで確認する場合には7000番のポートを参照
app.use(express.static(__dirname)); //静的ファイルはstaticで渡す
app.get("/", (req, res) => {
	// "/"にアクセスがあったらindex.htmlを返却　ユーザーがgetしたい
	res.sendFile(__dirname + "/index.html");
});

// ルーム一覧
const rooms = {};

io.on("connection", (socket) => { // socket.io 接続イベント確認(ユーザーが接続できているか)

	socket.emit('currentRooms', rooms);  // 接続者にルーム一覧を配信
	let joining = '';  // 接続中のルームID

	// クライアントからルームを増やしてほしいというリクエストが来たらroomsに追加
	socket.on("addRoom", (roomName) => {
		const roomId = Math.random().toString(32).substring(2);  // ランダム文字列
		rooms[roomId] = roomName;
		io.emit('currentRooms', rooms);  // 全体にルーム一覧を配信
	});

	socket.on('enterRoom', (roomId) => {
		if (roomId in rooms) {  // ルームIDが実在するか
			socket.join(roomId);
			joining = roomId;
		}
	});

	// チャットが送られてきたら接続中のルームに配信
	socket.on('addChat', (text) => {
		io.to(joining).emit('broadcastChat', text);
	});
});

http.listen(PORT, function () {
	//httpサーバー生成
	console.log("server listening. Port:" + PORT);
});

// // ----追記------

// //ルームから切断
// socket.leave('room1');

// // クライアントの情報取得 of namespace
// io.of('/').in('room1').clients((error, clients) => {
//   console.log(clients);

//   //'room1'ルームのクライアントの数
//   console.log(clients.length);
// })
