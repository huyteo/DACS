const socket = io('/');  //socket connection
const videoGrid = document.getElementById('video-grid');
const userDropDown = document.getElementById('myDropdown');
const myVideo = document.createElement('video');
myVideo.removeAttribute('controls');
myVideo.muted = true;
let peers = {}, currentPeer = [];
let userlist = [];
let cUser;
let roomId;
var peer = null;
let Name;
let YourName;

document.addEventListener('DOMContentLoaded', () => {
  Name = localStorage.getItem('Name');
  if (Name && Name !== 'null') {
    YourName = Name;
    localStorage.removeItem('Name');
  } else {
    let path = window.location.pathname;
    roomId = path.substring(1);
    localStorage.setItem('roomId', roomId);

    window.location.href = `/home`;
    alert('Enter your name to join the room');
  
  }
});

console.log(YourName);

peer = new Peer(roomId, { 
  port: 3000,
  host: '/',
  path: '/peerjs'
});

let myVideoStream;
navigator.mediaDevices.getUserMedia({   
  video: true,
  audio: true
}).then(stream => {                    
  addVideoStream(myVideo, stream);
  myVideoStream = stream;

  peer.on('call', call => {     

    console.log("answered");
    call.answer(stream);           
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });
    let gride;
    peers[call.peer] = call;
    call.on('close', () => {
      video.remove()
    })
  });

  socket.on('user-connected', (user) => { 
    setTimeout(() => {
      console.log(user);
      connectToNewUser(user.userId, stream);
      $('#user-list').append(
        `<li id="${user.userId}" class="flex items-center justify-between"> <span class="text-white">${user.username}</span></li>`
    ); 
    }, 2000);
  })

});


peer.on('open', async id => {

  cUser = id;
  await socket.emit('join-room', ROOM_ID, id, YourName);

})

socket.on('user-disconnected', (userId, u, peerId, username) => {
  $(`#${peerId}`).remove();
  if (peers[userId]) peers[userId].close();
  console.log('user ID fetch Disconnect: ' + userId);
  setTimeout(() => {
    alert(username + ' has left the room!');
  }, 3000);
});


const connectToNewUser = (userId, stream) => {
  console.log('User-connected :-' + userId);
  let call = peer.call(userId, stream);      
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);  
  })
  call.on('close', () => {
    video.remove()
  })
  peers[userId] = call;
  currentPeer.push(call.peerConnection);
  console.log(currentPeer);
}


const addVideoStream = (video, stream) => { 
  // Tạo một div để bọc video
  const videoWrapper = document.createElement('div');
  videoWrapper.classList.add('video-wrapper'); // Thêm class để dễ css
  videoWrapper.style.position = 'relative';

  video.srcObject = stream;
  video.controls = true;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });

  // Thêm video vào div
  videoWrapper.appendChild(video);

  // Thêm div vào videoGrid
  videoGrid.append(videoWrapper);
}



const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setMuteButton();
  } else {
    setUnmuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const setUnmuteButton = () => {
  const html = `<i class="fas fa-microphone"></i>
                <span>Mute</span>`;
  document.querySelector('.Mute__button').innerHTML = html;
  console.log("You are Unmuted");
}

const setMuteButton = () => {
  const html = `<i class="fas fa-microphone-slash" style="color:red;"></i>
                <span>Unmute</span>`;
  document.querySelector('.Mute__button').innerHTML = html;
  console.log("Muted");
}


const videoOnOff = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    unsetVideoButton();
    socket.emit('camera-off', { userId: peer.id });
  } else {
    setVideoButton();
    myVideoStream.getVideoTracks()[0].enabled = true;
    socket.emit('camera-on', { userId: peer.id });
  }
}

const unsetVideoButton = () => {
  const html = `<i class="fas fa-video-slash" style="color:red;"></i>
                <span>Start Video</span>`;
  document.querySelector('.Video__button').innerHTML = html;

  // Chuyển màn hình video sang màu xám
  const videoElement = document.querySelector('video');
  videoElement.style.filter = 'grayscale(100%)'; // Chuyển màu video thành màu xám
  videoElement.style.backgroundColor = 'gray'; // Đặt nền video là màu xám
  videoElement.style.border = 'black';

  // Thêm icon ở giữa màn hình màu xám
const overlay = document.createElement('div');
overlay.classList.add('camera-off-overlay');
overlay.innerHTML = `<i class="fas fa-video-slash" style="font-size: 48px; color: red;"></i>`;
overlay.style.position = 'absolute';
overlay.style.top = '50%';
overlay.style.left = '50%';
overlay.style.transform = 'translate(-50%, -50%)';
overlay.style.color = 'red';

// Đảm bảo container của video có position: relative để căn giữa icon
videoElement.parentElement.style.position = 'relative';

// Thêm overlay vào video
videoElement.parentElement.appendChild(overlay);


  console.log("Cammera Mode OFF");
}

const setVideoButton = () => {
  const html = `<i class="fas fa-video"></i>
                <span>Stop Video</span>`;
  document.querySelector('.Video__button').innerHTML = html;

  // Xóa màu xám và icon khi camera bật
  const videoElement = document.querySelector('video');
  videoElement.style.filter = 'none';
  videoElement.style.backgroundColor = 'transparent';

  const overlay = document.querySelector('.camera-off-overlay');
  if (overlay) {
    overlay.remove();
  }

  console.log("Cammera Mode ON");
}

socket.on('camera-off', (data) => {
  socket.broadcast.emit('user-camera-off', data);
});

socket.on('camera-on', (data) => {
  socket.broadcast.emit('user-camera-on', data);
});

socket.on('user-camera-off', (data) => {
  const videoElement = document.getElementById(`video-${data.userId}`);
  if (videoElement) {
    const overlay = document.createElement('div');
    overlay.classList.add('camera-off-overlay');
    overlay.innerHTML = `<i class="fas fa-video-slash" style="font-size: 48px; color: red;"></i>`;
    overlay.style.position = 'absolute';
    overlay.style.top = '50%';
    overlay.style.left = '50%';
    overlay.style.transform = 'translate(-50%, -50%)';
    overlay.style.color = 'red';

    videoElement.parentElement.style.position = 'relative';
    videoElement.parentElement.appendChild(overlay);
  }
});

socket.on('user-camera-on', (data) => {
  const videoElement = document.getElementById(`video-${data.userId}`);
  if (videoElement) {
    const overlay = videoElement.parentElement.querySelector('.camera-off-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
});



const disconnectNow = () => {
  window.location = "http://www.google.com";
}

const share = () => {
  var share = document.createElement('input'),
    text = window.location.href;

  console.log(text);
  document.body.appendChild(share);
  share.value = text;
  share.select();
  document.execCommand('copy');
  document.body.removeChild(share);
  alert('Copied');
}
//msg sen from user
let text = $('input');

$('html').keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    console.log(text.val());
    socket.emit('message', text.val(), YourName);
    text.val('')
  }
});

socket.on('createMessage', (msg, user) => {
  $('#chat-list').append(`<li class= "message"><small>~${user}</small><br>${msg}</li>`);
  scrollToBottom();
});

const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

//screenShare
const screenshare = () => {
  navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: 'always'
    },
    audio: {
      echoCancellation: true,
      noiseSupprission: true
    }

  }).then(stream => {
    let videoTrack = stream.getVideoTracks()[0];
    videoTrack.onended = function () {
      stopScreenShare();
    }
    for (let x = 0; x < currentPeer.length; x++) {

      let sender = currentPeer[x].getSenders().find(function (s) {
        return s.track.kind == videoTrack.kind;
      })

      sender.replaceTrack(videoTrack);
    }

  })

}

function stopScreenShare() {
  let videoTrack = myVideoStream.getVideoTracks()[0];
  for (let x = 0; x < currentPeer.length; x++) {
    let sender = currentPeer[x].getSenders().find(function (s) {
      return s.track.kind == videoTrack.kind;
    })
    sender.replaceTrack(videoTrack);
  }
}

//raised hand
const raisedHand = () => {
  const sysbol = "&#9995;";
  socket.emit('message', sysbol, YourName);
  unChangeHandLogo();
}

const unChangeHandLogo = () => {
  const html = `<i class="far fa-hand-paper" style="color:red;"></i>
                <span>Raised</span>`;
  document.querySelector('.raisedHand').innerHTML = html;
  console.log("chnage")
  changeHandLogo();
}

const changeHandLogo = () => {
  setInterval(function () {
    const html = `<i class="far fa-hand-paper" style="color:"white"></i>
                <span>Hand</span>`;
    document.querySelector('.raisedHand').innerHTML = html;
  }, 3000);
}


socket.on('remove-User', (userId) => {
  if (cUser == userId) {
    disconnectNow();
  }
});

const getUsers = () => {
  socket.emit('seruI',);

}

const listOfUser = () => {
  while (userDropDown.firstChild) {
    userDropDown.removeChild(userDropDown.lastChild);
  }
  for (var i = 0; i < userlist.length; i++) {
    var x = document.createElement("a");
    var t = document.createTextNode(`VideoSector ${i + 1}`);
    x.appendChild(t);
    userDropDown.append(x);
  }
  const anchors = document.querySelectorAll('a');
  for (let i = 0; i < anchors.length; i++) {
    anchors[i].addEventListener('click', () => {
      console.log(`Link is clicked ${i}`);
      anchoreUser(userlist[i]);
    });
  }
}

const anchoreUser = (userR) => {
  socket.emit('removeUser', cUser, userR);
}


socket.on('all_users_inRoom', (userI) => {
  console.log(userI);
  userlist.splice(0, userlist.length);
  userlist.push.apply(userlist, userI);
  console.log(userlist);
  listOfUser();
  document.getElementById("myDropdown").classList.toggle("show");
});

const toggleChat = () => {
  const chatWindow = document.querySelector('.main__right_chat');
  const participantWindow = document.querySelector('.main__right_participants');
  const videoSection = document.querySelector('.main__left');



  // Kiểm tra thuộc tính hidden của chatWindow
  if (chatWindow.hidden) {
    chatWindow.hidden = false;
    participantWindow.hidden = true;

    videoSection.style.flex = '0.8';
    chatWindow.style.flex = '0.2';

  } else{
    participantWindow.hidden = true;
    chatWindow.hidden = true;

    videoSection.style.flex = '1';

  }
}

const toggleParticipants = () => {
  const chatWindow = document.querySelector('.main__right_chat');
  const participantWindow = document.querySelector('.main__right_participants');
  const videoSection = document.querySelector('.main__left');

  // Adjust the width of video section
  if (participantWindow.hidden) {
    participantWindow.hidden = false;
    chatWindow.hidden = true;

    videoSection.style.flex = '0.8';
    participantWindow.style.flex = '0.2';

  } else{
    participantWindow.hidden = true;
    chatWindow.hidden = true;

    videoSection.style.flex = '1';

  }
}

socket.on('ONLINE_LIST', userList => {
  userList.forEach(user => {
    $('#user-list').append(
        `<li id="${user.userId}" class="flex items-center justify-between"> <span class = "text-white">${user.username}</span></li>`
    );
  });
})