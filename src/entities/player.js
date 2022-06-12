import Phaser from 'phaser'
import Client from '../socketio'

export default class Player extends Phaser.Physics.Arcade.Sprite 
{
    constructor(scene, x, y, texture, frame)
    {
        super(scene, x, y, texture, frame)
        this.anims.play('player-idle-side')
        this.speed = 250
        
    }

    preUpdate(t, dt)
    {
        super.preUpdate(t, dt)
    }

    update(cursors) 
    {
        if (Client.handledFirstUpdate) {
            const state = Client.getCurrentState()
            if (state.nd === 'l' || state.nd === 'u' || state.nd === 'd') {
                this.anims.play('player-run-side', true)
                this.flipX = true
            } else if (state.nd === 'r') {
                this.anims.play('player-run-side', true)
                this.flipX = false
            } else {
                this.anims.play('player-idle-side', true)
            }
            this.setPosition(state.me.x, state.me.y)
        //    console.log(state.me.x + ' vs ' + this.body.x)
           
        }
        
        if (cursors.left.isDown)
        {

            Client.emitMove('l')

            // this.anims.play('player-run-side', true)
            // this.setVelocity(-this.speed, 0)

            // this.flipX = true
        }
        else if (cursors.right.isDown)
        {
            Client.emitMove('r')

            // this.anims.play('player-run-side', true)
            // this.setVelocity(this.speed, 0)

            // this.flipX = false
        }
        else if (cursors.up.isDown)
        {
            Client.emitMove('u')
            // this.anims.play('player-run-side', true)
            // this.setVelocity(0, -this.speed)
        }
        else if (cursors.down.isDown)
        {
            Client.emitMove('d')
            // this.anims.play('player-run-side', true)
            // this.setVelocity(0, this.speed)
        }
        else  
        {
            // n is for no move
            Client.emitMove('n')
            // this.anims.play('player-idle-side')
            // this.setVelocity(0, 0)
        }

    }
}

Phaser.GameObjects.GameObjectFactory.register('player', function(x, y, texture, frame) {
    const sprite = new Player(this.scene, x, y, texture, frame)

    this.displayList.add(sprite)
    this.updateList.add(sprite)
    // console.log('update list', this.updateList)
    // console.log(this.scene)
    // Phaser.Physics.Arcade.Sprite.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)
    // Phaser.Physics.Arcade..physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

    sprite.body.setSize(sprite.width * 0.3, sprite.height * 0.3)
    sprite.setDisplaySize(sprite.width * 0.3, sprite.height * 0.3)
    // console.log(sprite.body.width)
    

    return sprite
})