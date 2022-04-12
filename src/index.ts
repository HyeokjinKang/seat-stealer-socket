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

  socket.on("seat-vote-start", (num) => {
    socket.broadcast.emit("seat-vote-start", num);
  });

  socket.on("seat-vote", (n) => {
    io.to(users.admin[0]).emit("seat-vote", n, socket.id);
  });

  socket.on("seat-voted", (id) => {
    io.to(id).emit("seat-voted");
  });

  socket.on("seat-versus", (id, len) => {
    io.to(id).emit("seat-versus", len);
  });

  socket.on("seat-confirm", (id) => {
    io.to(id).emit("seat-confirm");
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
