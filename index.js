const express = require('express');
const app = express();
const httpServer = require('http').createServer();
const io = require('socket.io')(httpServer, {
  cors: {
    origin: 'https://chat-client-ruddy.vercel.app/',
  },
});
const mysql = require('mysql2');

const dbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'users',
});

dbConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});

io.on('connection', (socket) => {
  socket.on('chat', (args) => {
    const sql = 'INSERT INTO chat (author, message) VALUES (?, ?)';
    dbConnection.query(sql, [args.author, args.message], (err, result) => {
      if (err) {
        console.error('Error saving message to the database:', err);
      } else {
        console.log('Message saved to the database');
        socket.broadcast.emit('chat', args);
      }
    });
  });

  // When a fetchMessages event is received:
  socket.on('fetchMessages', () => {
    const fetchMessagesSQL = 'SELECT author, message FROM chat';
    dbConnection.query(fetchMessagesSQL, (err, results) => {
      if (err) {
        console.error('Error fetching messages from the database:', err);
      } else {
        console.log('Messages fetched from the database:', results);
        // Emit the fetched messages back to the client
        socket.emit('fetchedMessages', results);
      }
    });
  });
});

httpServer.listen(3001, () => {
  console.log('Server listen on port 3001');
});
