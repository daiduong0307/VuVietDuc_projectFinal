const io = require('socket.io')();

const socketapi = {
    io,
};

// Add your socket.io logic here!
io.on('connection', (socket) => {
    console.log('New Client connection with UID:', socket.id);

    socket.on('newComment', (data) => {
        // console.log("adjdfhdjfwif", formData);
        socket.broadcast.emit('newComment', data);
    });

    socket.on('disconnect', () => {
        console.log(socket.id + 'has been disconnected');
    });
});
// end of socket.io logic

module.exports = socketapi;
