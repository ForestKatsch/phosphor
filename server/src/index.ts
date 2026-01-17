import { createServer } from "node:http";

const server = createServer((_req, res) => {
  res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  res.end("Not Found");
});

console.log("Server is running on port 3000");
server.listen(3000);
