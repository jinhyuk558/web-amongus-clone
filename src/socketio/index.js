import { io } from 'socket.io-client'

let Client = {}
const gameUpdates = []
Client.handledFirstUpdate = false
let firstServerTimestamp = 0
let gameStart = 0

// SOCKETIO AND MAKE AVAILABLE TO ALL SCENES
Client.init = () => {
    Client.socket = io('localhost:3000')



    // receive: from server
    Client.socket.on('message', (message) => {
        console.log(message)
    })
}

Client.emitMove = (direction) => {
    if (Client.socket) {
        Client.socket.emit('sendMove', { direction })
    }
}


// INIT JOIN ROOM
Client.joinRoom = (username, room) => {
    Client.socket.emit('joinRoom', { username, room })

    // receive: from server
    Client.socket.on('roomUsers', ({ room, users }) => {
        console.log('received room users info from server', users)
        Client.players = users
    })

    Client.socket.on('gameUpdate', (update) => {
        // console.log(update.me)
        Client.me = update.me

        processUpdate(update)
    })
}
Client.getCurrentState = () => {
    if (!Client.handledFirstUpdate) return null

    // at this point, there must be at least one udpate present

    const updateIdx = getCurrentStateIdx()
    if (updateIdx == -1) {
        return gameUpdates[gameUpdates.length - 1]
    } else {
        // could do interpolation here
        return gameUpdates[updateIdx]
    }
    
    
    
}

const getCurrentStateIdx = () => {
    const serverTime = currentServerTime() 
    for (let i = gameUpdates.length - 1; i >= 0; i--) {
        if (gameUpdates[i].t < serverTime) {
            return i
        }
    }
    return -1
}
const processUpdate = (update) => {

    if (!Client.handledFirstUpdate) {
        firstServerTimestamp = update.t 
        gameStart = Date.now()
        Client.handledFirstUpdate = true
    }
    gameUpdates.push(update)
    // REMOVE OLD UPDATES WE DON'T NEED
    const base = getCurrentStateIdx()
    if (base > 0) {
        gameUpdates.splice(0, base)
    }
}
const currentServerTime = () => {
    return firstServerTimestamp + (Date.now() - gameStart) - 100
}


// Client.processUpdate = (update) => {
//     if (Client.firstServerContactTime == 0) {
//         Client.firstServerContactTime = update.t 
//         Client.startTime = Date.now()
//         Client.receivedFirstUpdate = true
//     }
//     Client.gameUpdates.push(update)

//     const baseIndex = Client.getBaseUpdate() 
//     if (base > 0) {
//         gameUpdates.splice(0, baseIndex)
//     }
// }

// Client.getCurrentState = () => {
//     if (!Client.firstServerContactTime) {
//         return {}
//     }

//     const baseIndex = Client.getBaseUpdate() 
//     const serverTime = Client.getCurrentServerTime() 
//     const updates = Client.gameUpdates

//     if (baseIndex < 0 || base === updates.length - 1) {
//         return updates[updates.length - 1]
//     } else {
//         const baseUpdate = updates[baseIndex]
//         // COULD DO INTERPOLATION HERE
//         return baseUpdate
//     }
// }

// HELPERS
// Client.getBaseUpdate = () => {
//     const updates = Client.gameUpdates
//     const serverTime = Client.getCurrentServerTime() 
//     for (let i = updates.length; i >= 0; i--) {
//         if (updates[i].t <= serverTime) {
//             return i
//         }
//     }
//     return -1
// }
// Client.getCurrentServerTime = () => {
//     return Client.firstServerContactTime + (Date.now() - Client.startTime) - 100
// }






export default Client
