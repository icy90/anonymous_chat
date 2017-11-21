var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var favicon = require('serve-favicon');
var isMobile = require('ismobilejs');
var animals = require('animals');
var md5 = require('md5');
var amqp = require('amqplib/callback_api');

var rabbitmqHost = (process.env.RABBITMQ_HOST) ? process.env.RABBITMQ_HOST : "localhost";

var connectStranger = 0;
var clients = {};

var colors = ["White","Yellow","Fuchsia","Red","Silver","Gray","Olive","Purple","Maroon","Aqua","Lime","Teal","Green","Blue","Navy","Black"];

function jsUcfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

app.use(favicon(__dirname + '/favicon.ico'));
app.use('/sounds', express.static('sounds'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
  //console.log(isMobile(req.headers['user-agent']).any);
});

app.get('/rain.jpg', function(req, res) {
  res.sendFile(__dirname + '/rain.jpg');
});
app.get('/tree.jpg', function(req, res) {
  res.sendFile(__dirname + '/tree.jpg');
});
app.get('/ion.sound.js', function(req, res) {
  res.sendFile(__dirname + '/ion.sound.js');
});


io.on('connection', function(socket) {
  connectStranger = connectStranger + 1;
  console.log(connectStranger + ' users, user connect: ' + socket.id);
  io.emit('users', connectStranger);


  var color = colors[Math.floor(Math.random()*colors.length)];
  var name = color + " " + jsUcfirst(animals());
  var client = {
    'name': name,
    'id': socket.id,
    'socket': socket,
    'color': color
  };
  clients[socket.id] = client;
  console.log(name + " connected");
  socket.emit('noti', "You connected as " + name + "!");
  socket.broadcast.emit('noti', name + " connected!");


  socket.on('disconnect', function(){
    connectStranger = connectStranger - 1;
    console.log(connectStranger + ' users, user disconnect: ' + socket.id);

    
    if (clients[socket.id] && clients[socket.id].name) console.log(clients[socket.id].name + " disconnected!");
    if (clients[socket.id] && clients[socket.id].name) socket.broadcast.emit('noti', clients[socket.id].name + " disconnected!");

    clients[socket.id] = null;
    delete clients[socket.id];
  });


  socket.on('chat', function(msg) {
    if (clients[socket.id] && clients[socket.id].name) {
      console.log(socket.id + ' - ' + clients[socket.id].name + ': ' + msg);
      var pack = {
        'id':  clients[socket.id].id,
        'name': clients[socket.id].name,
        'msg': msg,
        'color': clients[socket.id].color
      };

      amqp.connect('amqp://'+rabbitmqHost, function(err, conn) {
        conn.createChannel(function(err, ch) {
          var q = 'chat';

          ch.assertQueue(q, {durable: false});
          ch.sendToQueue(q, new Buffer(JSON.stringify(pack)));
          setTimeout(function() { conn.close(); }, 500);
        });
      });
      // socket.broadcast.emit('chat', pack);
    }
  });
});

amqp.connect('amqp://'+rabbitmqHost, function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'chat';
    ch.assertQueue(q, {durable: false});
    ch.consume(q, function(msg) {
      // console.log("Received");
      // console.log(" [x] Received %s", msg.content.toString());
      var data = JSON.parse(msg.content);
      for (var key in clients) {
        var client = clients[key];
        if (client && client.id && data.id) {
          if (client.id!=data.id && client.socket) {
            client.socket.emit('chat', data);
          }
        }
      }
    }, {noAck: true});
  });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
