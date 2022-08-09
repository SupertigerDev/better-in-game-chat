const {Server} = require('socket.io');


const io = new Server();

io.on("connection", (socket) => {
    console.log("New client connected");
    socket.broadcast.emit("newMessage", {message: `Someone Joined.`, username: "Server", color: "green"});

    let user = {
      username: "Unnamed",
      color: null,
    };


    socket.on("setUsername", (_username) => {
      console.log("setUsername", _username);
      username = _username;
    })

    socket.on("createMessage", ({message, username, color}) => {
      socket.broadcast.emit("newMessage", {message, username, color});
    })
    
    
    socket.on("disconnect", () => {
      socket.broadcast.emit("newMessage", {message: `${user.username} Left.`, username: "Server", color: "green"});
    });
});
io.listen(8080)
console.log("Listening on port 8080");