const logArea = document.getElementById("logArea");
const chatArea = document.getElementById("chatArea");
const chatInput = document.getElementById("chatInput");

let isFocused = false;

const socket = io("ws://localhost:8080");

const OPEN_CHAT_KEY = "Quote";

window.api.onKeyDown(e => {
  if (e.name === OPEN_CHAT_KEY) {
    onOpenChatPressed()
  }
})


window.api.onFocus(() => {
  isFocused = true;
  console.log(isFocused)
})

window.api.onBlur(() => {
  isFocused = false;
});






const hideBackground = () => {

  const options = {
    duration: 100,
    fill: 'forwards',
    easing: 'ease-in-out'
  }

  logArea.animate([
    {background: 'rgba(0,0,0,0.4)'},
    {background: 'rgba(0,0,0,0)'},
  ], options)
  chatArea.animate([
    {background: 'rgba(0,0,0,0)', opacity: 1},
    {background: 'rgba(0,0,0,0.4)', opacity: 0},
  ], options)
}
const showBackground = () => {
  const options = {
    duration: 100,
    fill: 'forwards',
    easing: 'ease-in-out'
  }

  logArea.animate([
    {background: 'rgba(0,0,0,0)'},
    {background: 'rgba(0,0,0,0.4)'},
  ], options)

  chatArea.animate([
    {background: 'rgba(0,0,0,0)', opacity: 0},
    {background: 'rgba(0,0,0,0.4)', opacity: 1},
  ], options)
}
const hideMessage = (element) => {

  const keyframes = [
    {opacity: 1},
    {opacity: 0},
  ];
  const options = {
    duration: 100,
    delay: 10000,
    fill: 'forwards',
    easing: 'ease-in-out'
  }

  element.animate(keyframes, options)
}

const showMessage = (element) => {

  const keyframes = [
    {opacity: 1},
  ];
  const options = {
    duration: 100,
    fill: 'forwards',
    easing: 'ease-in-out'
  }

  element.animate(keyframes, options)
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


const createMessage = (color, username, message) => {

  const messageEl = document.createElement("div");
  messageEl.classList.add("message-item");

  messageEl.innerHTML =  `<span class="username" style="color: ${color}">[${username}]: </span><span class="message">${message}</span>`

  logArea.append(messageEl)

  hideMessage(messageEl);

  logArea.scrollTo({
    top: logArea.scrollHeight,
    behavior: 'smooth'
  })
  
  
}


const blur = () => {
  window.api.blurWindow();
  chatInput.blur();
  chatInput.value = "";
  hideBackground();
  hideMessages();
}

let username = null;


const commandHandler = (message) => {

  const [command, ...args] = message.split(" ");

  if (command === "/username") {
    username = args.join(" ");
    socket.emit("setUsername", username);
    createMessage("#00ff00", "Server", `Username updated to ${username}!`);
    return true;
  }
}


chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const message = chatInput.value.trim();
    if (message) {

      const commandHandled = commandHandler(message)
      if (!commandHandled) {
        if (!username) {
          createMessage("orange", "Profile", "Type '/username <username>' to continue.");
        } else {
          socket.emit("createMessage", {username, message});
          createMessage("rgb(241, 134, 255)", username, message);
        }
      };

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



createMessage("orange", "Connection", "Connecting to server...");



socket.on("connect", () => {
  username = null;
  createMessage("green", "Connection", "Connected!");
  createMessage("orange", "Profile", "Type '/username <username>' to continue.");

});
socket.on("newMessage", ({username, message}) => {
  createMessage("rgb(241, 134, 255)", username, message);
});