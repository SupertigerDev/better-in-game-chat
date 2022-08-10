const logArea = document.getElementById("logArea");
const chatArea = document.getElementById("chatArea");
const chatInput = document.getElementById("chatInput");


const OPEN_CHAT_KEY = "Quote";
const SERVER_MESSAGE_COLOR = "#baffc9";
const PROFILE_MESSAGE_COLOR = "#ffdfba";
const ERROR_MESSAGE_COLOR = "#ffb3ba";
const DEFAULT_MESSAGE_COLOR = "#b19cd9"


const main = async () => {
  const socket = io("ws://localhost:8080");
  let username = (await window.api.getUsername()) || null;
  let color = (await window.api.getColor()) || DEFAULT_MESSAGE_COLOR;



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

    const options = {
      duration: 100,
      fill: 'forwards',
      easing: 'ease-in-out'
    }

    logArea.animate([
      { background: 'rgba(0,0,0,0.4)' },
      { background: 'rgba(0,0,0,0)' },
    ], options)
    chatArea.animate([
      { background: 'rgba(0,0,0,0)', opacity: 1 },
      { background: 'rgba(0,0,0,0.4)', opacity: 0 },
    ], options)
  }
  const showBackground = () => {
    const options = {
      duration: 100,
      fill: 'forwards',
      easing: 'ease-in-out'
    }

    logArea.animate([
      { background: 'rgba(0,0,0,0)' },
      { background: 'rgba(0,0,0,0.4)' },
    ], options)

    chatArea.animate([
      { background: 'rgba(0,0,0,0)', opacity: 0 },
      { background: 'rgba(0,0,0,0.4)', opacity: 1 },
    ], options)
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
    createMessage("#00ff00", "Server", message);
  }
  const createProfileMessage = (message) => {
    createMessage("#00ff00", "Profile", message);
  }
  const createErrorMessage = (message) => {
    createMessage("red", "Error", message);
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

    if (command === "/username") {
      if (!socket.connected) {
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
      socket.emit("setUsername", _username);
      createProfileMessage(`Username updated to ${_username}!`);
      return true;
    }

    if (command === "/color") {
      if (!socket.connected) {
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
      socket.emit("setColor", _color);
      createProfileMessage(`Color updated to ${_color}!`);
      return true;
    }

  }

  const onEnterPressed = (message) => {
    const commandHandled = commandHandler(message)
    if (commandHandled) return;
    if (!username) {
      createProfileMessage("Type '/username <username>' to continue.");
      return;
    }
    socket.emit("createMessage", { message });
    createMessage(color, username, message);
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



  createServerMessage("Connecting to server...");



  socket.on("connect", () => {
    createServerMessage("Connected!");
    socket.emit("setColor", color || DEFAULT_MESSAGE_COLOR);
    if (username) {
      socket.emit("setUsername", username);
      createProfileMessage("Type '/username <username>' to change your username.");
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


main();

