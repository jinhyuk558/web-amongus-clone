const createPlayerAnims = (anims) => {
    // RUN
    anims.create({
        key: 'player-run-side',
        frames: anims.generateFrameNames('player', {
            start: 1,
            end: 12,
            zeroPad: 4,
            prefix: 'walk/Walk',
            suffix: '.png'
        }),
        repeat: -1,
        frameRate: 30
    })

    // IDLE
    anims.create({
        key: 'player-idle-side',
        frames: [{ key: 'player', frame: 'idle.png' }]
    })

}

export {
    createPlayerAnims
}