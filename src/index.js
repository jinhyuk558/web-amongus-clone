import Phaser from 'phaser';
import { createPlayerAnims } from './anims/playerAnims'
import Player from './entities/player';
import { io } from 'socket.io-client'
import Client from './socketio';

class MyGame extends Phaser.Scene
{
    constructor ()
    {
        super();

        // NOW: FNISIH REFACTORING GAME CLASS IN SERVER AND
        // WORK ON UPDATING SERVER STATE 60 TIMES / SECOND
        // AND SENDING DATA 30 TIMES / SECOND BASED ON
        // VICTOR ZHOU'S TUTORIAL

        this.otherPlayers = {}
        this.otherPlayerSprites = {}
    }

    preload ()
    {

        // SHIP COLLISION DATA
        this.load.tilemapTiledJSON('ship', 'src/assets/maps/shipMap.json')
        this.load.image('tiles', 'src/assets/images/transparent.png')

         // CHARACTER
         this.load.atlas('player', 'src/assets/sprites/characterSprites.png', 'src/assets/sprites/characterSprites.json')
    
         // SHIP BACKGROUND
         this.load.image('shipBackgroundImage', 'src/assets/images/ship.png')

         // KEYBOARD
         this.cursors = this.input.keyboard.createCursorKeys()

         // HTML FORM
         this.load.html('form', 'src/assets/ui/form.html')

         // INIT SOCKET.IO
         Client.init()
    }

    addPlayer(id)
    {
        this.otherPlayerSprites[id] = this.physics.add.sprite(450,450,'player')
        const added = this.otherPlayerSprites[id]
        added.body.setSize(added.width * 0.3, added.height * 0.3)
        added.setDisplaySize(added.width * 0.3, added.height * 0.3)
        added.anims.play('player-idle-side')
    }

    updatePlayer(id, newState)
    {
        const player = this.otherPlayerSprites[id]
        if (newState.dir === 'u' || newState.dir === 'd') {
            player.anims.play('player-run-side', true)
        } else if (newState.dir === 'l') {
            player.anims.play('player-run-side', true)
            player.flipX = true
        } else if (newState.dir === 'r') {
            player.anims.play('player-run-side', true)
            player.flipX = false
        }   else {
            player.anims.play('player-idle-side', true)
        }
        this.otherPlayerSprites[id].body.x = newState.x 
        this.otherPlayerSprites[id].body.y = newState.y
    }
      
    create ()
    {

        // ANIMS
        createPlayerAnims(this.anims)

        // MAP IMAGE
        this.add.image(1790, 1040, 'shipBackgroundImage')

        // MAP
        const map = this.make.tilemap({ key: 'ship' })
        const tileset = map.addTilesetImage('transparent', 'tiles', 16, 16, 0, 0)
        const wallsLayer = map.createStaticLayer('WallsLayer', tileset)
        wallsLayer.setCollisionByProperty({ collides: true })

        // PLAYER
        this.player = this.add.player(450, 450, 'player')

        // ADD TEMPORARY SPRITES 


        // PLAYER WALLS COLLISION
        this.physics.add.collider(this.player, wallsLayer)

        // CAMERA
        this.cameras.main.startFollow(this.player, true)

        // HTML FORM + SOCKETIO LISTENERS
        const form = this.add.dom(450, 450).createFromCache('form').setAlpha(1)
        form.setPerspective(800)
        // console.log(form)
        const nameInput = form.getChildByID('name')
        const roomInput = form.getChildByID('code')
        const submitBtn = form.getChildByID('btn')
        submitBtn.addEventListener('click', () => {
            const username = nameInput.value 
            const room = roomInput.value

            Client.joinRoom(username, room)

            // NOT CLEAN BUT DOES THE JOB
            document.getElementById('form').remove()
        })
    }

    update()
    {
        if (this.player)
        {
            this.player.update(this.cursors)
        }
        if (Client.handledFirstUpdate) {
            // console.log(Client.getCurrentState().others)
            // console.log(Client.getCurrentState())
            const state = Client.getCurrentState()

            Object.keys(state.others).forEach((id) => {
                if (!this.otherPlayers[id]) {
                    // other player is not registered
                    this.otherPlayers[id] = state
                    this.addPlayer(id)
                } else {
                    this.updatePlayer(id, state.others[id])

                }
            })
        }
    }

}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    dom: {
        createContainer: true
    },
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
    scene: MyGame
};

const game = new Phaser.Game(config);
