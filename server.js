// Load http module
let http = require("http");
let PORT = process.env.PORT;

// Load express module
let express = require("express");
let app = express();

// Create server
// Hook it up to listen to the correct PORT
let server = http.createServer(app).listen(PORT);

// Create an array to store socket connections in order
let queue = [];
// Keep track of who's turn it is
let q = -1;

// Point my app at the public folder to serve up the index.html file
app.use(express.static("public"));

// Load the socket.io functionality
// Hook it up to the web server
let io = require("socket.io")(server);

// Listen for connections
io.on(
  "connection",
  // Callback function on connection
  // Comes back with a socket object
  function(socket) {
    console.log("HELLO", socket.id);

    // Add the newly connected to the queue
    queue.push(socket);

    // Tell the socket it's its turn - but only on the first socket
    if (q < 0) {
      next(true);
    }
    console.log(q, queue.length);

    // This connected socket listens for incoming messages called 'data'
    socket.on("next", function() {
      // Log the data that came in
      console.log("NEXT SOCKET!");
      next(true);
    });

    socket.on("disconnect", function() {
      console.log("BYE", socket.id);
      // Loop through all the sockets in the queue
      for (let s = 0; s < queue.length; s++) {
        // Compare the id of each socket with the id of the disconnected socket.
        if (queue[s].id == socket.id) {
          queue.splice(s, 1);
          // If disconnected socket is currently have a turn, cue the next socket
          if(s == q) next(false);
        }
      }
    });
  }
);


function next(advance) {
  // Tell the next client to go...
  if(advance) q++;
  if(q >= queue.length) q = 0;
  queue[q].emit("go");
}
