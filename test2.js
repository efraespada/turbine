var chat = io.connect('http://localhost/chat')
  , news = io.connect('http://localhost/news');

chat.on('connect', function () {
  chat.emit('hi!');
});
