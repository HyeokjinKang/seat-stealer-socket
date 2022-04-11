import { Server } from "socket.io";

const io = new Server();
const port = 1024;
const users = {
  undefined: [],
  student: [],
  admin: [],
};

io.on("connection", (socket) => {
  users.undefined.push(socket.id);

  socket.on("admin", () => {
    users.undefined.splice(users.undefined.indexOf(socket.id), 1);
    users.admin.push(socket.id);
    io.to(socket.id).emit("connected-admin");
  });

  socket.on("student", () => {
    users.undefined.splice(users.undefined.indexOf(socket.id), 1);
    users.student.push(socket.id);
    io.to(socket.id).emit("connected-student");
  });

  socket.on("name-submit", (name) => {
    io.to(users.admin[0]).emit("name-submit", name, socket.id);
  });

  socket.on("name-result", (name, result, id) => {
    io.to(id).emit("name-result", result);
  });

  socket.on("disconnect", () => {
    if (users.undefined.indexOf(socket.id) != -1) users.undefined.splice(users.undefined.indexOf(socket.id), 1);
    else if (users.student.indexOf(socket.id) != -1) {
      io.to(users.admin[0]).emit("name-remove", socket.id);
      users.student.splice(users.student.indexOf(socket.id), 1);
    } else if (users.admin.indexOf(socket.id) != -1) {
      users.admin.splice(users.admin.indexOf(socket.id), 1);
      io.emit("reload");
    }
  });
});

io.listen(port);
