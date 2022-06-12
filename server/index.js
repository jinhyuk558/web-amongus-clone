const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http, {
    cors: {
        origins: ['http://localhost:8080']
    }
})
const Game = require('./utils/game')

const game = new Game()

io.on('connection', (socket) => {
    console.log('player connected')

    

    socket.on('disconnect', () => {
        const player = game.getCurrentPlayer(socket.id)

        if (player) {
            console.log('USER DISCONNECTED')
            console.log('disconnect player room: ' + player.room)
            game.playerLeave(socket.id)
            io.to(player.room).emit('message', `Player [${player.username}] disconnected`)
            io.to(player.room).emit('roomUsers', {
                room: player.room,
                users: game.getRoomPlayers(player.room)
            })
            
        }
        
    })

    socket.on('joinRoom', ({ username, room }) => {
        console.log('JOIN ROOM RECEIVED')
        console.log('username: ' + username)
        console.log('room: ' + room)

        const player = game.joinRoom(socket, username, room)

        
        

        // NOT COMPLETELY SURE IF THIS ONLY SENDS TO PERSON WHO JUST JOINED
        io.to(player.room).emit('roomUsers', {
            room: player.room,
            users: game.getRoomPlayers(player.room)
        })

        socket.on('sendMove', ({ direction }) => {
            // console.log('Received Direction: ' + direction)
            player.dir = direction
        })
    })
})

function update() {

}

http.listen(3000, () => {
    console.log('server listening on 3000')
})