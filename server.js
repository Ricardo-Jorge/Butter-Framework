const Butter = require("./butter");

const PORT = 4050;

const server = new Butter();

server.route("get", "/", (req, res) => {
  res.sendFile("./public/index.html", "text/html");
});
server.route("get", "/style.css", (req, res) => {
  res.status(200).sendFile("./public/style.css", "text/css");
});
server.route("get", "/script.js", (req, res) => {
  res.status(200).sendFile("./public/script.js", "text/javascript");
});
server.route("post", "/login", (req, res) => {
  res.status(400).json({ message: "Wrong credentials!" });
});

server.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
