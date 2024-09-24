const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
const userS = [], userI = [];
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

const userList = [];
 
app.use('/peerjs', peerServer);
// const ExpressPeerServer = require('peer').ExpressPeerServer;
// const peerServer = ExpressPeerServer(server, {
//   debug: true
// });

// // server.listen(3000, () =>{
// // 	console.log("Serving port 3000");
// // });

// app.use('/peerjs', peerServer); //peerjs server living in express and runing at different ports

app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/', (req, res) =>{
	res.redirect(`/${uuidV4()}`);  //send uuid to client address bar 
 })

 app.get('/home', (req, res) =>{
	res.render('home');  //send uuid to client address bar 
 })

 app.get('/test', (req, res) =>{
	res.render('test');  //send uuid to client address bar 
 })

app.get('/:room', (req, res) =>{
	let addRoomId = req.params.room;
    console.log(addRoomId);
	res.render('room',{roomId: `${addRoomId}` }); //get id from address bar and send to ejs
})

io.on('connection', socket =>{
	
	socket.on('join-room',(roomId, userId, username) =>{
		let user = {userId, username};
		userList.push(user);

		socket.emit('ONLINE_LIST', userList);
	
		userS.push(socket.id);
		userI.push(userId);

		//console.log("room Id:- " + roomId,"userId:- "+ userId);    //userId mean new user 
		
		//join Room
		socket.userId = user.userId;
		console.log("room Id:- " + roomId,"userId:- "+ userId);    //userId mean new user 
		socket.join(roomId);                                       //join this new user to room
		socket.to(roomId).broadcast.emit('user-connected',user); //for that we use this and emit to cliet	
		
		//Remove User
	    socket.on('removeUser', (sUser, rUser)=>{
	    	var i = userS.indexOf(rUser);
	    	if(sUser == userI[0]){
	    	  console.log("SuperUser Removed"+rUser);
	    	  socket.to(roomId).broadcast.emit('remove-User', rUser);
	    	}
	    });

	    //grid
	    socket.on('obect',(sUser, object) =>{
	    	if(sUser == userI[0]){
	    		socket.to(roomId).broadcast.emit('grid_obj', object);
	    	}
	    });

		//code to massage in roomId
		socket.on('message', (message,yourName) =>{
			io.to(roomId).emit('createMessage',message,yourName);
			
		})

	    socket.on('disconnect', () =>{
			const index = userList.findIndex(e => e.userId === socket.userId);
			userList.splice(index, 1);

	    	
	    	var i = userS.indexOf(socket.id);
	    	userS.splice(i, 1);
            socket.to(roomId).broadcast.emit('user-disconnected', userI[i], userI, socket.userId, user.username);
          
           
            userI.splice(i, 1);
	    });
	    socket.on('seruI', () =>{
	    	socket.emit('all_users_inRoom', userI);
			//console.log(userS);
		    console.log(userI);
	    });  
	})
	
})

server.listen(process.env.PORT || 3000, () =>{
	console.log("Serving port 3000")
});