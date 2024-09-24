// const socket = io('/'); 
let userID;
let Name


$('#btnCreateRoom').click(() => {
    Name = document.getElementById('name').value.trim();
    roomId = document.getElementById('roomID').value.trim(); 

    if (roomId && Name) {
      localStorage.setItem('Name', Name);
      window.location.href = `/${roomId}`;
    } else {
        alert('Please enter a Room ID and Name!');
    }
  });

$('#btnjoinRoom').click(() => {
    roomId = document.getElementById('roomID').value.trim(); 
    socket.on('user-connected', (userId)  =>{   //user connected so we now ready to share 
        setTimeout(() => {
          console.log('user ID fetch connection: '+ userId); //video stream
          connectToNewUser(userId, stream); 
          console.log("heeeeeeee")       //by this fuction which call user
        }, 2000);
      })
      window.location.href = `/${roomId}`;
})

document.addEventListener('DOMContentLoaded', () => {
  const roomId = localStorage.getItem('roomId');

  if (roomId) {
    document.getElementById('roomID').value = roomId;
    localStorage.removeItem('roomId');
  }
});
  