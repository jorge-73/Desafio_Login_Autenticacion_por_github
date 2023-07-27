let chatBox = document.getElementById("chatBox");

Swal.fire({
  title: "Authentication",
  input: "text",
  text: "Set username for the Chat",
  inputValidator: (value) => {
    return !value.trim() && "Please write a valid username";
  },
  allowOutsideClick: false,
}).then((result) => {
  user = result.value;
  document.getElementById("user").innerHTML = `<b>${user}: </b>`;
  let socket = io();

  chatBox.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      if (chatBox.value.trim().length > 0) {
        let newMessage = {
          user,
          message: chatBox.value,
        };
        socket.emit("message", newMessage);

        chatBox.value = "";
      }
    }
  });

  socket.on("logs", (data) => {
    const divLogs = document.getElementById("messagesLogs");
    let messages = "";
    data.reverse().forEach((message) => {
      messages += ` <div class="bg-secondary p-2 my-2 rounded-2">
      <p><i>${message.user}</i>: ${message.message}</p>
      </div>`;
    });
    divLogs.innerHTML = messages;
  });

  socket.on("alerta", () => {
    Toastify({
      text: "Un nuevo usuario se ha conectado",
      duration: 1500,
      newWindow: true,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "#00B4DB",
        background: "-webkit-linear-gradient(to right, #0083B0, #00B4DB)",
        background: "linear-gradient(to right, #0083B0, #00B4DB)",
      },
      onClick: function () {},
    }).showToast();
  });
});
