const http = require("http");
const fs = require("node:fs/promises");

const server = http.createServer();
server.on("request", async (request, response) => {
  if (request.url === "/" && request.method === "GET") {
    response.setHeader("Content-type", "text/html");

    // Here we are reading the html file located in the public folder
    const fileHandle = await fs.open("./public/index.html", "r");
    // Here we are creating a readable stream from our fileHandle
    const fileStream = fileHandle.createReadStream();

    // This is a pipe that reads the Buffer from the fileStream and then writing the response back to the client
    fileStream.pipe(response);
  }

  if (request.url === "/style.css" && request.method === "GET") {
    response.setHeader("Content-type", "text/css");

    // Here we are reading the CSS file located in the public folder
    const fileHandle = await fs.open("./public/style.css", "r");
    // Here we are creating a readable stream from our fileHandle
    const fileStream = fileHandle.createReadStream();

    // This is a pipe that reads the Buffer from the fileStream and then writing the response back to the client
    fileStream.pipe(response);
  }

  if (request.url === "/script.js" && request.method === "GET") {
    response.setHeader("Content-type", "text/javascript");

    // Here we are reading the CSS file located in the public folder
    const fileHandle = await fs.open("./public/script.js", "r");
    // Here we are creating a readable stream from our fileHandle
    const fileStream = fileHandle.createReadStream();

    // This is a pipe that reads the Buffer from the fileStream and then writing the response back to the client
    fileStream.pipe(response);
  }

  if (request.url === "/login" && request.method === "POST") {
    response.setHeader("Content-Type", "application/JSON");
    response.statusCode = 200;

    const body = {
      message: "Logging you in...",
    };

    response.end(JSON.stringify(body));
  }

  if (request.url === "/user" && request.method === "PUT") {
    response.setHeader("Content-Type", "application/JSON");
    response.statusCode = 401;

    const body = {
      message: "You first have to log in.",
    };

    response.end(JSON.stringify(body));
  }
  if (request.url === "/upload" && request.method === "POST") {
    response.setHeader("Content-Type", "application/JSON");
    const fileHandle = await fs.open("./storage/image.jpeg", "w");

    const fileStream = fileHandle.createWriteStream();

    request.pipe(fileStream);

    const body = {
      message: "File uploaded successfully.",
    };

    request.on("end", () => {
      response.end(JSON.stringify(body));
    });
  }
});

server.listen(9000, () => {
  console.log("Web server is live at http://localhost:9000");
});
