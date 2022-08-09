const {Server} = require('socket.io');


const io = new Server();

io.on("connection", (socket) => {
    console.log("New client connected");

    let username = null;


    socket.on("setUsername", (_username) => {
      console.log("setUsername", _username);
      username = _username;
    })

    socket.on("createMessage", ({message, username}) => {
      socket.broadcast.emit("newMessage", {message, username});
    })


    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});
io.listen(8080)
console.log("Listening on port 8080");