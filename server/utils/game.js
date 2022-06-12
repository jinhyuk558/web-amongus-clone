const users = []

class Game {
    constructor() {
        this.players = {}
        this.sockets = {}
        this.lastUpdateTime = Date.now()
        this.shouldSendUpdate = false 
        // CHANGE THIS TO SET ANIM FRAME LATER
        setInterval(this.update.bind(this), 1000 / 60, 60)
    }

    joinRoom(socket, username, room) {
        socket.join(room)
        const id = socket.id
        const player = { 
            id, 
            username, 
            room ,
            x: 450,
            y: 450,
            speed: 250,
            dir: 'n' // n is for no movement. lrdu for other four.
        }
        this.players[id] = player
        this.sockets[id] = socket

        socket.emit('message', 'You are in!')

        socket.broadcast
            .to(player.room)
            .emit(
                'message',
                `${player.username} has joined`
            )
        return player 
    } 

    getCurrentPlayer(id) {
        return this.players[id]
    }

    playerLeave(id) {
        delete this.players[id]
    }

    getRoomPlayers(room) {
        const roomPlayers = []
        Object.keys(this.players).forEach((id) => {
            if (this.players[id].room === room) {
                roomPlayers.push(this.players[id])
            }
        })
        return roomPlayers
    }
    
    update() {
        const now = Date.now()
        const dt = (now - this.lastUpdateTime) / 1000
        this.lastUpdateTime = now 

        // update player positions
        Object.keys(this.players).forEach((id) => {
            const player = this.players[id]
            const dir = player.dir 
            
            switch (dir) {
                case 'u':
                    player.y -= dt * player.speed 
                    break 
                case 'd':
                    player.y += dt * player.speed
                    break 
                case 'l':
                    player.x -= dt * player.speed 
                    break 
                case 'r':
                    player.x += dt * player.speed
                    break
                case 'n':
                    // Do nothing
                    break
            }
            
        })

        // send updates to clients
        if (this.shouldSendUpdate) {
            Object.keys(this.players).forEach((id) => {
                const socket = this.sockets[id]
                const player = this.players[id]

                // Note: this would NOT work where knowing the location
                // of every player provides an advantage. This sends data
                // about visible players but doesn't take into account things
                // like walls and hidden locations (like bushes perhaps).
                // Currently, it is not doing any checks but simply returns
                // the positions of all other players
                
                const visiblePlayers = []
                Object.keys(this.players).forEach((id) => {
                    if (id !== player.id) {
                        visiblePlayers.push(this.players[id])
                    }
                })
                const nd = player.dir
                const updateData = {
                    t: Date.now(),
                    me: {
                        id: player.id,
                        x: player.x,
                        y: player.y
                    },
                    others: visiblePlayers,
                    nd: nd

                }
                socket.emit('gameUpdate', updateData)
            })
            this.shouldSendUpdate = false
        } else {
            this.shouldSendUpdate = true
        }
    }
}

module.exports = Game



// function userLeave(id) {
//     const index = users.findIndex(user => user.id === id)

//     if (index !== -1) {
//         return users.splice(index, 1)[0]
//     }
// }

// function getRoomUsers(room) {
//     return users.filter(user => user.room === room)
// }

// module.exports = {
//     joinRoom,
//     getCurrentUser,
//     userLeave,
//     getRoomUsers
// }