const logArea = document.getElementById("logArea");
const chatArea = document.getElementById("chatArea");
const chatInput = document.getElementById("chatInput");
const meElement = document.getElementById("me");

const MAX_LOG_LENGTH = 50;
const SERVER_MESSAGE_COLOR = "#baffc9";
const PROFILE_MESSAGE_COLOR = "#fcc98d";
const ERROR_MESSAGE_COLOR = "#ff919b";
const DEFAULT_MESSAGE_COLOR = "#fa9be1"
const DEFAULT_POS = {
  x: 10,
  y: 600
}


window.onerror = (msg, url, line, col, error) => {
  alert("error happened", message)
}

const main = async () => {
  let socket = null;
  let username = (await window.api.getUsername()) || null;
  let color = (await window.api.getColor()) || DEFAULT_MESSAGE_COLOR;
  let keyBinds = (await window.api.getKeyBind()) || ['Enter'];
  let pos = (await window.api.getPos()) || DEFAULT_POS;
  let ip = (await window.api.getIp()) || "ws://localhost:8080"
  
  let keyBindMode = false;
  let bindKeys = [];
  let currentlyPressedKeys = [];

  window.api.setPos(pos);


  let isFocused = false;

  window.api.onKeyDown(e => {

    if (currentlyPressedKeys[currentlyPressedKeys.length - 1] !== e.name) {
      currentlyPressedKeys.push(e.name);
    }
    if (currentlyPressedKeys[0] === keyBinds[0]) {
      if (JSON.stringify(currentlyPressedKeys) === JSON.stringify(keyBinds)) {
        onOpenChatPressed()
      }
    }

    if (e.name === "Escape" && isFocused) {
      blur();
    }

    if (keyBindMode) {
      if (e.name === "Escape") {
        keyBindMode = false;
        bindKeys = [];
        createErrorMessage("Escape key cannot be bound. Recording ended.");
        return;
      }

      if (bindKeys[bindKeys.length - 1] !== e.name) {
        bindKeys.push(e.name);
      }
      if (bindKeys.length > 4) {
        bindKey();
      }
    }
  })

  window.api.onMouseWheel(e => {
    // up is -1, down is 1
    const {rotation} = e
    if (rotation === 1) {
      logArea.scrollTop += 20;
    }
    if (rotation === -1) {
      logArea.scrollTop -= 20;
    }
    
  });

  
  window.api.onKeyUp(e => {
    currentlyPressedKeys = currentlyPressedKeys.filter(key => key !== e.name);
    if (keyBindMode) {
      if (currentlyPressedKeys.length === 0) {
        bindKey();
      }
    }
    
  })

  const bindKey = () => {
    if (bindKeys.length === 0) return;
    keyBindMode = false;

    keyBinds = bindKeys
    window.api.setKeyBind(bindKeys)

    const keyBindsString = keyBinds.join("+");
    createProfileMessage(`Bound to: ${keyBindsString}`);



    bindKeys = [];
    currentlyPressedKeys = [];
  }


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


  const clampMessages = () => {
    if (logArea.childNodes.length > MAX_LOG_LENGTH) {
      logArea.childNodes[0].remove();
    }
  }


  const createMessage = (color, username, message) => {

    const messageItemEl = document.createElement("div");
    messageItemEl.classList.add("message-item");


    const usernameEL = username && `<span class="username" style="color: ${color}">[${sanitize(username)}]: </span>`;
    const messageEl = `<span class="message">${sanitize(message)}</span>`


    messageItemEl.innerHTML = `${usernameEL}${messageEl}`;

    logArea.append(messageItemEl)

    if (!isFocused) {
      hideMessage(messageItemEl);
    }

    clampMessages();
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


  const keyBindsString = keyBinds.join("+");
  createProfileMessage(`Press ${keyBindsString} to open chat`);

  const history = createHistory();

  const blur = (blurWindow = true) => {
    if (blurWindow) {
      window.api.blurWindow();
    }
    logArea.scrollTo({
      top: logArea.scrollHeight,
      behavior: 'smooth'
    })
    chatInput.blur();
    chatInput.value = "";
    hideBackground();
    hideMessages();
    history.chatClosed();

  }



  const createHelpMessage = () => {

    const commandDescriptions = {
      "/help": "Shows this message",
      "/username <string>": "Changes your username",
      "/color <string>": "Changes your color",
      "/setX <number>": "Sets your X position",
      "/setY <number>": "Sets your Y position",
      "/resetPos": "Resets your position to default",
      "/connect <string>": "Connects to a server",
      "/bindKeys <string>": "Binds keys to open chat",
      "/clear": "Clears the chat",
      "/exit": "Exits the chat",
    }

    const helpElement = document.createElement("div");
    helpElement.classList.add("help-message");
    helpElement.innerHTML = `<span class="help-message-header">Commands:</span>`;
    Object.keys(commandDescriptions).forEach(command => {
      const description = commandDescriptions[command];
      const helpItemEl = document.createElement("div");
      helpItemEl.classList.add("help-item");
      helpItemEl.innerHTML = `<span class="help-command">${sanitize(command)}</span> <span class="help-description">${description}</span>`;
      helpElement.append(helpItemEl);
    });

    logArea.append(helpElement)

    if (!isFocused) {
      hideMessage(helpElement);
    }

    logArea.scrollTo({
      top: logArea.scrollHeight,
      behavior: 'smooth'
    })

    clampMessages();
  }

setTimeout(() => {
  createHelpMessage();
}, 1000);


  const commandHandler = (message) => {

    const [command, ...args] = message.split(" ");


    if (command === "/help") {
      createHelpMessage();
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
      const _ip = args[0]?.trim()
      if (!_ip) {
        createErrorMessage(`No IP provided!`);
        return true;
      }
      ip = _ip;
      window.api.setIp(_ip);
      connect();
      return true;
    }


    if (command === "/bindKey") {

      createServerMessage(`Key-binds are now being recorded...`);
      setTimeout(() => {
        keyBindMode = true;
      }, 100);
      return true;
    }



    if (command === "/clear") {
      logArea.innerHTML = "";
      createProfileMessage(`Log has been cleared!`);
      return true;
    }

    if (command === "/exit") {
      window.api.exitOverlay();
      return true;
    }


  }




  const onEnterPressed = (message) => {
    if (message.length > 200) {
      createErrorMessage(`Message is too long!`);
      return;
    }


    createMessage(color, username || "", message);

    history.add(message);
    


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

    // if up arrow is pressed
    if (e.key === "ArrowUp") {
      e.preventDefault();
      history.upKeyPressed();
    }
    // if down arrow is pressed
    if (e.key === "ArrowDown") {
      e.preventDefault();
      history.downKeyPressed();
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

    socket.on("disconnect", () => {
      createServerMessage("Disconnected from server. Trying to reconnect...");
    })

  }

  connect();

}


const createHistory = () => {
  let history = [];
  const maxHistory = 10;
  let historyIndex = 0;
  let currentMessage = "";

  const add = (message) => {
    if (history[history.length - 1] === message) return;
    history.push(message);
    if (history.length > maxHistory) {
      history.shift();
    }
    historyIndex = history.length;
  }
  const chatClosed = () => {
    historyIndex = history.length;
    currentMessage = "";
  }

  const upKeyPressed = () => {
    if (historyIndex === history.length){
      currentMessage = chatInput.value;
    };
    if (historyIndex === 0) return;
    if (historyIndex >= history.length + 1) {
      historyIndex = history.length;
    }
    historyIndex--;
    chatInput.value = history[historyIndex];
  }

  const downKeyPressed = () => {
    if (historyIndex >= history.length) return;
    if (historyIndex === history.length - 1) {
      historyIndex++;
      chatInput.value = currentMessage;
      return;
    };
    historyIndex++;
    chatInput.value = history[historyIndex];

    
  }

  return {
    add,
    chatClosed,
    upKeyPressed,
    downKeyPressed
  }



}


main();

