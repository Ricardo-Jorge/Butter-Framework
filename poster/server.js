const Butter = require("../butter");

const SESSIONS = [];

const USERS = [
  { id: 1, name: "Ricardo Jorge", username: "rcd313", password: "123456" },
  { id: 2, name: "Liam Brown", username: "liam23", password: "123456" },
  { id: 3, name: "Ben Adams", username: "ben.poet", password: "123456" },
];
const POSTS = [
  {
    id: 1,
    title: "This is a post title",
    body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
    userId: 1,
  },
];

const port = 8000;

const server = new Butter();

// Middlewares
// Authenticating users for certain routes
server.beforeEach((req, res, next) => {
  const routesToAuthenticate = [
    "GET /api/user",
    "PUT /api/user",
    "POST /api/posts",
    "DELETE /api/logout",
  ];

  if (routesToAuthenticate.indexOf(req.method + " " + req.url) !== -1) {
    // If we have a token cookie, then save the userId to the req object
    if (req.headers.cookie) {
      const token = req.headers.cookie.split("=")[1];

      const session = SESSIONS.find((session) => session.token === token);
      if (session) {
        req.userId = session.userId;
        return next();
      }
    }

    return res.status(401).json({ error: "Unauthorized." });
  } else {
    next();
  }
});

// For parsing JSON body
server.beforeEach((req, res, next) => {
  // This is only for bodies that their size is less than the highWaterMark value
  if (req.headers["content-type"] === "application/json") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString("utf-8");
    });

    req.on("end", () => {
      body = JSON.parse(body);
      req.body = body;
      return next();
    });
  } else {
    next();
  }
});

// For different routes that need the index.html file
server.beforeEach((req, res, next) => {
  const routes = ["/", "/login", "/profile", "/new-post"];

  if (routes.indexOf(req.url) !== -1 && req.method === "GET") {
    return res.status(200).sendFile("./public/index.html", "text/html");
  } else {
    next();
  }
});

// ------- Files Routes ------ //

server.route("get", "/scripts.js", (req, res) => {
  res.sendFile("./public/scripts.js", "text/javascript");
});
server.route("get", "/styles.css", (req, res) => {
  res.sendFile("./public/styles.css", "text/css");
});

// ------- JSON Routes ------ //
server.route("get", "/api/posts", (req, res) => {
  const posts = POSTS.map((post) => {
    const user = USERS.find((user) => user.id === post.userId);
    post.author = user.name;
    return post;
  });
  res.status(200).json(posts);
});

// ------- Login Routes ------ //
server.route("post", "/api/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // check if user exists
  const user = USERS.find((user) => user.username === username);

  // check password if the user was found
  if (user && user.password === password) {
    const token = Math.floor(Math.random() * 1000000000).toString();

    SESSIONS.push({ userId: user.id, token: token });

    res.setHeader("Set-Cookie", `token=${token}; Path=/;`);
    res.status(200).json({ message: "Logged in successfully." });
  } else {
    res.status(401).json({ message: "Invalid username or password." });
  }
});

// Send user info
server.route("get", "/api/user", (req, res) => {
  const user = USERS.find((user) => user.id === req.userId);
  res.json({ username: user.username, name: user.name });
});

// Log the user out
server.route("delete", "/api/logout", (req, res) => {
  const sessionIndex = SESSIONS.findIndex(
    (session) => session.userId === req.userId
  );

  if (sessionIndex > -1) {
    SESSIONS.splice(sessionIndex, 1);
  }
  res.setHeader(
    "Set-Cookie",
    `token=deletd; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );
  res.status(200).json({ message: "Logged out successfuly" });
});

// Update user info
server.route("put", "/api/user", (req, res) => {
  const username = req.body.username;
  const name = req.body.name;
  const password = req.body.password;

  const user = USERS.find((user) => req.userId === user.id);

  user.username = username;
  user.name = name;

  if (password) {
    user.password = password;
  }

  res.status(200).json({
    username: user.username,
    name: user.name,
    password_status: password ? "updated" : "not updated",
  });
});

//
server.route("post", "/api/posts", (req, res) => {
  const title = req.body.title;
  const body = req.body.body;

  const post = {
    id: POSTS.length + 1,
    title: title,
    body: body,
    userId: req.userId,
  };

  POSTS.unshift(post);
  res.status(201).json(post);
});

// Create a new Post
server.listen(port, () => {
  console.log("Server has started on port:", port);
});
