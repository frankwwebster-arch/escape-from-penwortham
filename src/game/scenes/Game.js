import Phaser from 'phaser'

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game')
  }

  create() {
    this.cameras.main.setBackgroundColor('#d9f0ff')

    this.add.text(20, 20, 'Escape from Penwortham - Nursery Tutorial', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#1a1a1a'
    })

    this.add.text(20, 52, 'Use arrow keys to move', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#333333'
    })

    this.room = this.add.rectangle(400, 320, 700, 500, 0xf5f0dc)
    this.room.setStrokeStyle(4, 0x444444)

    this.exit = this.add.rectangle(720, 320, 50, 110, 0x8b5a2b)
    this.add.circle(735, 320, 4, 0xffd700) // door handle
    this.add.text(686, 380, 'EXIT', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#1a1a1a'
    })

    this.coin = this.add.circle(220, 220, 12, 0xffd54f)

    this.player = this.add.rectangle(120, 120, 28, 28, 0x3b82f6)

    this.score = 0
    this.scoreText = this.add.text(20, 80, 'Gold: 0', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#1a1a1a'
    })

    this.winText = this.add.text(20, 110, '', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#0b6b2a'
    })

    this.cursors = this.input.keyboard.createCursorKeys()
    this.hasCoin = false
    this.hasExited = false
  }

  update() {
    const speed = 4

    if (this.cursors.left.isDown) {
      this.player.x -= speed
    }
    if (this.cursors.right.isDown) {
      this.player.x += speed
    }
    if (this.cursors.up.isDown) {
      this.player.y -= speed
    }
    if (this.cursors.down.isDown) {
      this.player.y += speed
    }

    this.player.x = Phaser.Math.Clamp(this.player.x, 64, 736)
    this.player.y = Phaser.Math.Clamp(this.player.y, 84, 556)

    if (!this.hasCoin) {
      const coinDistance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.coin.x,
        this.coin.y
      )

      if (coinDistance < 24) {
        this.hasCoin = true
        this.coin.setVisible(false)
        this.score += 1
        this.scoreText.setText(`Gold: ${this.score}`)
      }
    }

    if (!this.hasExited) {
      const exitDistance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.exit.x,
        this.exit.y
      )

      if (exitDistance < 50 && this.hasCoin) {
        this.hasExited = true
        this.winText.setText('Nice! You escaped Nursery.')
      } else if (exitDistance < 50 && !this.hasCoin) {
        this.winText.setText('Collect the gold coin first.')
      } else if (!this.hasExited) {
        this.winText.setText('')
      }
    }
  }
}