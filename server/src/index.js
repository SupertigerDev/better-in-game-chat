const {Server} = require('socket.io');


const io = new Server();

io.on("connection", (socket) => {
    console.log("New client connected");
    socket.broadcast.emit("newMessage", {message: `Someone Joined.`, username: "Server", color: "green"});

    let user = {
      username: "Unnamed",
      color: "rgb(241, 134, 255)",
    };


    socket.on("setUsername", (_username) => {
      console.log("setUsername", _username);
      user.username = _username;
    })

    socket.on("setColor", (_color) => {
      console.log("setColor", _color);
      user.color = _color;
    });



    socket.on("createMessage", ({message}) => {
      socket.broadcast.emit("newMessage", {message, username: user.username, color: user.color});
    })
    
    
    socket.on("disconnect", () => {
      socket.broadcast.emit("newMessage", {message: `${user.username} Left.`, username: "Server", color: "green"});
    });
});
io.listen(8080)
console.log("Listening on port 8080");