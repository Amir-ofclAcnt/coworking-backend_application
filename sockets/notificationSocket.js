module.exports = function (io) {
    io.on('connection', (socket) => {
      console.log('🟢 Ny användare ansluten:', socket.id);
  
      socket.on('disconnect', () => {
        console.log('🔴 Användare frånkopplad:', socket.id);
      });
    });
  };
  