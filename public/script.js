const socket = io('/');  //socket connection
let videoGrid = document.getElementById('video-grid');
const userDropDown = document.getElementById('myDropdown');
const myVideo = document.createElement('video');
myVideo.removeAttribute('controls');
// myVideo.muted = true;
let peers = {}, currentPeer = [];
let userlist = [];
let cUser;
let roomId;
let peer = null;
let Name;
let YourName;
let isSharing = false;

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

console.log();

peer = new Peer(undefined, {
  port: 3000,
  host: '/',
  path: '/peerjs'
});

let myVideoStream;
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: false
}).then(stream => {
  addVideoStream(myVideo, stream);
  myVideoStream = stream;

  peer.on('call', call => {

    console.log("answered");
    console.log(currentPeer.length)
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });

    peers[call.peer] = call;
    call.on('close', () => {
      video.remove()
    })
  });

  socket.on('user-connected', (user) => {
    setTimeout(() => {

      connectToNewUser(user.userId, stream, roomId);
      $('#user-list').append(
        `<li id="${user.userId}" class="flex items-center justify-between"> <span class="text-white">${user.username}</span></li>`
      );
      console.log(user);
    }, 2000);
  })

}).catch(error => {
  console.error("Error accessing media devices.", error);
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
  console.log(currentPeer.length);
}


const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.controls = false;
  video.addEventListener('loadedmetadata', () => {
  video.play();
  })
  videoGrid.append(video);
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
  } else {
    setVideoButton();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setVideoButton = () => {
  const html = `<i class="fas fa-video"></i>
                <span>Stop Video</span>`;
  document.querySelector('.Video__button').innerHTML = html;
  console.log("Cammera Mode ON");
}

const unsetVideoButton = () => {
  const html = `<i class="fas fa-video-slash" style="color:red;"></i>
                <span>Start Video</span>`;
  document.querySelector('.Video__button').innerHTML = html;
  console.log("Cammera Mode OFF");
}

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

  }).then(stream1 => {
    setScreenSharingStream(stream1);

  isSharing = true;
  socket.emit('is-sharing', isSharing, );

    let stream = stream1;

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

function setScreenSharingStream(stream) {
  let screenShare = document.getElementById('screen-share');
  let mainVideos = document.querySelector(".main__videos");
  let video = document.getElementById('video-share');
  let videoCam = document.querySelectorAll('#video-grid video');

  videoCam.forEach(video1 => {
    video1.style.setProperty('max-width', '100%', 'important');
    video1.style.setProperty('height', 'auto', 'important');
    video1.style.setProperty('object-fit', 'cover', 'important');
    video1.classList.add("p-1");
  });

  videoGrid.className = "";
  videoGrid.classList.add("m-3", "w-1/6", "gap-4", "flex-grow", "h-auto");
  mainVideos.style.display = "flex";
  screenShare.hidden = false;
  isSharing = true;

  video.srcObject = stream;
  video.controls = false;
  video.muted = true;
  video.play();
}



function stopScreenShare() {
  //hidden screen share
  let screenShare = document.getElementById('screen-share');
  screenShare.hidden = true;

  //style grid video
  let mainVideos = document.querySelector(".main__videos");
  mainVideos.style.display = "grid";

  //change to old style video cam
  let videoCam = document.querySelectorAll('#video-grid video');
  videoCam.forEach(video => {
    video.style = "";
  });

  //style video grid
  videoGrid.className = "";
  videoGrid.classList.add("grid", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3", "gap-3", "flex-grow");

  isSharing = false;
  socket.emit('is-sharing', isSharing);
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

  } else {
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

  } else {
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

socket.on('USER_SHARING', (data) => {
  if (data = true) {
    let screenShare = document.getElementById('screen-share');
    let mainVideos = document.querySelector(".main__videos");
    const videoCam = document.querySelectorAll('#video-grid video');
    let video = document.getElementById('video-share');

    videoCam.forEach(video1 => {
      video1.style.setProperty('max-width', '100%', 'important');
      video1.style.setProperty('height', 'auto', 'important');
      video1.style.setProperty('object-fit', 'cover', 'important');
      video1.classList.add("p-1");
    });

    videoGrid.className = "";
    videoGrid.classList.add("m-3", "w-1/6", "gap-4", "flex-grow", "h-auto");
    mainVideos.style.display = "flex";
    screenShare.hidden = false;

  }
})

socket.on('USER_STOP_SHARING', data => {
  if(data == false) {
    //hidden screen share
    let screenShare = document.getElementById('screen-share');
    screenShare.hidden = true;

    //style grid video
    let mainVideos = document.querySelector(".main__videos");
    mainVideos.style.display = "grid";

    //change to old style video cam
    let videoCam = document.querySelectorAll('#video-grid video');
    videoCam.forEach(video => {
      video.style = "";
    });

    //style video grid
    videoGrid.className = "";
    videoGrid.classList.add("grid", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3", "gap-3", "flex-grow");
  }
})