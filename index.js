const express = require('express');
const app = express();
const cors = require('cors'); // Import the cors middleware
const mysql = require('mysql2');
require('dotenv').config();
const httpServer = require('http').createServer(app); // Pass 'app' to createServer

const io = require('socket.io')(httpServer, {
  cors: {
    origin: 'https://chat-client-ruddy.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const dbConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
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
    const sql =
      'INSERT INTO bziuciuutpsvztffxyg8.chat (author, message) VALUES (?, ?)';
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
    const fetchMessagesSQL =
      'SELECT author, message FROM bziuciuutpsvztffxyg8.chat';
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
  console.log(`Server listen on port 3001`);
});
