const logArea = document.getElementById("logArea");
const chatArea = document.getElementById("chatArea");
const chatInput = document.getElementById("chatInput");
const meElement = document.getElementById("me");


const OPEN_CHAT_KEY = "Quote";
const SERVER_MESSAGE_COLOR = "#baffc9";
const PROFILE_MESSAGE_COLOR = "#fcc98d";
const ERROR_MESSAGE_COLOR = "#ff919b";
const DEFAULT_MESSAGE_COLOR = "#fa9be1"
const DEFAULT_POS = {
  x: 10,
  y: 600
}


const main = async () => {
  let socket = null;
  let username = (await window.api.getUsername()) || null;
  let color = (await window.api.getColor()) || DEFAULT_MESSAGE_COLOR;
  let pos = (await window.api.getPos()) || DEFAULT_POS;
  let ip = (await window.api.getIp()) || "ws://localhost:8080"


  window.api.setPos(pos);


  let isFocused = false;

  window.api.onKeyDown(e => {
    if (e.name === OPEN_CHAT_KEY) {
      onOpenChatPressed()
    }

    if (e.name === "Escape" && isFocused) {
      blur();
    }

  })


  window.api.onFocus(() => {
    isFocused = true;
  })

  window.api.onBlur(() => {
    isFocused = false;
    blur(false)
  });





  const hideBackground = () => {

    if (!logArea.classList.contains("show-animate")) return;
    logArea.classList.remove("show-animate");

    if (!chatArea.classList.contains("show-animate")) return;
    chatArea.classList.remove("show-animate");

  }
  const showBackground = () => {

    if (logArea.classList.contains("show-animate")) return;
    logArea.classList.add("show-animate");

    if (chatArea.classList.contains("show-animate")) return;
    chatArea.classList.add("show-animate");
  }

  const hideMessage = (element) => {
    element.classList.add("hide-animate")
  }

  const showMessage = (element) => {
    element.classList.remove("hide-animate")

  }

  const showMessages = () => {
    logArea.childNodes.forEach(messageItem => {
      showMessage(messageItem);
    })
  }
  const hideMessages = () => {
    logArea.childNodes.forEach(messageItem => {
      hideMessage(messageItem);
    })
  }


  function sanitize(message) {
    return message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  const createMessage = (color, username, message) => {

    const messageEl = document.createElement("div");
    messageEl.classList.add("message-item");

    messageEl.innerHTML = `<span class="username" style="color: ${color}">[${sanitize(username)}]: </span><span class="message">${sanitize(message)}</span>`

    logArea.append(messageEl)

    if (!isFocused) {
      hideMessage(messageEl);
    }

    logArea.scrollTo({
      top: logArea.scrollHeight,
      behavior: 'smooth'
    })

  }



  const createServerMessage = (message) => {
    createMessage(SERVER_MESSAGE_COLOR, "Server", message);
  }
  const createProfileMessage = (message) => {
    createMessage(PROFILE_MESSAGE_COLOR, "Profile", message);
  }
  const createErrorMessage = (message) => {
    createMessage(ERROR_MESSAGE_COLOR, "Error", message);
  }



  const blur = (blurWindow = true) => {
    if (blurWindow) {
      window.api.blurWindow();
    }
    chatInput.blur();
    chatInput.value = "";
    hideBackground();
    hideMessages();
  }




  const commandHandler = (message) => {

    const [command, ...args] = message.split(" ");


    if (command === "/help") {
      createServerMessage("Available commands: /help, /username, /color, /setX, /setY, /resetPos, /connect, /clear");
      return true;
    }

    if (command === "/username") {
      if (!socket?.connected) {
        createErrorMessage(`Not connected yet!`);
        return true;
      }
      let _username = args.join(" ").trim();
      if (_username.length > 20) {
        createErrorMessage(`Username is too long!`);
        return true;
      }
      if (_username.length <= 0) {
        createErrorMessage(`Username is too short!`);
        return true;
      }
      window.api.setUsername(_username);
      username = _username;
      socket?.emit("setUsername", _username);
      createProfileMessage(`Username updated to ${_username}!`);
      setMe();
      return true;
    }

    if (command === "/color") {
      if (!socket?.connected) {
        createErrorMessage(`Not connected yet!`);
        return true;
      }
      _color = args.join(" ").trim();
      if (_color.length > 20) {
        createErrorMessage(`Color is too long!`);
        return true;
      }
      if (_color.length <= 0) {
        createErrorMessage("Color is too short!");
        return true;
      }
      window.api.setColor(_color);
      color = _color;
      socket?.emit("setColor", _color);
      createProfileMessage(`Color updated to ${_color}!`);
      setMe();
      return true;
    }

    if (command === "/resetColor") {
      if (!socket?.connected) {
        createErrorMessage(`Not connected yet!`);
        return true;
      }
      window.api.setColor(DEFAULT_MESSAGE_COLOR);
      color = DEFAULT_MESSAGE_COLOR;
      socket?.emit("setColor", DEFAULT_MESSAGE_COLOR);
      createProfileMessage(`Color has been reset!`);
      setMe();
      return true;
    }

    if (command === "/setX") {
      const x = parseInt(args[0]);
      pos.x = x;
      window.api.setPos(pos);
      createProfileMessage(`X position updated!`);
      return true;
    }
    if (command === "/setY") {
      const y = parseInt(args[0]);
      pos.y = y;
      window.api.setPos(pos);
      createProfileMessage(`Y position updated!`);
      return true;
    }

    if (command === "/resetPos") {
      pos = DEFAULT_POS;
      window.api.setPos(pos);
      createProfileMessage(`Position has been reset!`);
      return true;
    }

    if (command === "/connect") {
      const _ip = args[0]
      ip = _ip;
      window.api.setIp(_ip);
      connect();
      return true;
    }

    if (command === "/clear") {
      logArea.innerHTML = "";
      createProfileMessage(`Log has been cleared!`);
      return true;
    }


  }

  const onEnterPressed = (message) => {
    if (message.length > 200) {
      createErrorMessage(`Message is too long!`);
      return;
    }

    if (socket?.connected) {
      createMessage(color, username, message);
    }


    const commandHandled = commandHandler(message)
    if (commandHandled) return;

    if (!socket.connected) {
      createErrorMessage(`Not connected yet!`);
      return;
    }

    if (!username) {
      createProfileMessage("Type '/username <username>' to continue.");
      return;
    }
    socket.emit("createMessage", { message });

  }


  chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const message = chatInput.value.trim();
      if (message) {
        onEnterPressed(message);
      }
      e.preventDefault();
      blur();
    }
    if (chatInput.value.trim().length > 200) {
      e.preventDefault();
    }
  })

  const onOpenChatPressed = () => {
    if (isFocused) {
      blur();
      return;
    }
    showBackground();
    showMessages();
    window.api.focusWindow();
    chatInput.focus();
  }



  const setMe = () => {
    meElement.style.display = "none";
    if (!socket?.connected) return;
    if (!username) return;
    if (color) {
      meElement.style.color = color;
    }
    meElement.innerHTML = `[${username}]:`;
    meElement.style.display = "block";
  }



  const connect = () => {
    createServerMessage("Connecting to server...");
    socket?.off?.();

    socket = io(ip);

    socket.on("connect", () => {
      createServerMessage("Connected!");
      socket.emit("setColor", color || DEFAULT_MESSAGE_COLOR);
      if (username) {
        socket.emit("setUsername", username);
        createProfileMessage("Type '/username <username>' to change your username.");
        setMe();
        return;
      }
      createProfileMessage("Type '/username <username>' to continue.");

    });

    socket.on("newMessage", ({ username, color, message }) => {
      createMessage(color, username, message);
    });

    socket.on("userJoined", () => {
      createServerMessage("Someone joined!");
    });

    socket.on("userLeft", (username) => {
      createServerMessage(`${username} left the chat.`);
    });
    socket.on("custom_error", (message) => {
      createErrorMessage(message);
    });
  }

  connect();

}


main();

