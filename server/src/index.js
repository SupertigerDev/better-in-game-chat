const {Server} = require('socket.io');


const io = new Server();

io.on("connection", (socket) => {
    console.log("New client connected");
    socket.broadcast.emit("userJoined");

    let user = {
      username: "Unnamed",
      color: null,
    };


    socket.on("setUsername", (_username) => {
      if (_username.length > 20) {
        socket.emit("custom_error", "Username is too long!");
        return;
      }
      if (_username.length <= 0) {
        socket.emit("custom_error", "Username is too short!");
        return;
      }
      console.log("setUsername", _username);
      user.username = _username;
    })

    socket.on("setColor", (_color) => {
      if (_color.length > 20) {
        socket.emit("custom_error", "Color is too long!");
        return;
      }
      if (_color.length <= 0) {
        socket.emit("custom_error", "Color is too short!");
        return;
      }
      console.log("setColor", _color);
      user.color = _color;
    });



    socket.on("createMessage", ({message}) => {
      socket.broadcast.emit("newMessage", {message, username: user.username, color: user.color});
    })
    
    
    socket.on("disconnect", () => {
      socket.broadcast.emit("userLeft", user.username);
    });
});

setInterval(() => {
  io.emit("newMessage", {message: "Hello", username: "Fish", color: "red"});

}, 1000);
io.listen(8080)
console.log("Listening on port 8080");