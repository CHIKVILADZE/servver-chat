const express = require('express');
const app = express();
require('dotenv').config();
const httpServer = require('http').createServer();
const io = require('socket.io')(httpServer, {
  cors: {
    origin: 'https://chat-client-ruddy.vercel.app',
  },
});
const mysql = require('mysql2');

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
      'INSERT INTO bziuciuutpsvztffxyg8.chat_messages (author, message) VALUES (?, ?)';
    dbConnection.query(sql, [args.author, args.message], (err, result) => {
      if (err) {
        console.error('Error saving message to the database:', err);
      } else {
        console.log('Message saved to the database');
        socket.broadcast.emit('chat', args);
      }
    });
  });

  socket.on('fetchMessages', () => {
    const fetchMessagesSQL =
      'SELECT author, message FROM bziuciuutpsvztffxyg8.chat_messages';
    dbConnection.query(fetchMessagesSQL, (err, results) => {
      if (err) {
        console.error('Error fetching messages from the database:', err);
      } else {
        console.log('Messages fetched from the database:', results);

        socket.emit('fetchedMessages', results);
      }
    });
  });
});

httpServer.listen(3002, () => {
  console.log('Server listen on port 3002');
});
