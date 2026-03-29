import Phaser from 'phaser'

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game')
  }

  create() {
    this.cameras.main.setBackgroundColor('#b8d8e8')

    this.roomLeft = 80
    this.roomTop = 100
    this.roomWidth = 640
    this.roomHeight = 440
    this.roomRight = this.roomLeft + this.roomWidth
    this.roomBottom = this.roomTop + this.roomHeight
    this.wallThickness = 20

    this.playerStartX = 140
    this.playerStartY = 150
    this.playerSpeed = 190

    this.score = 0
    this.hasCoin = false
    this.hasCoin2 = false
    this.hasKey = false
    this.hasExited = false
    this.wasTouchingExit = false

    this.drawFloor()
    this.drawClassroomDecor()
    this.createWalls()
    this.createExit()
    this.createCoins()
    this.createKey()
    this.createHallMonitor()
    this.createPlayer()
    this.createUi()

    this.cursors = this.input.keyboard.createCursorKeys()
  }

  drawFloor() {
    this.add.text(20, 20, 'Escape from Penwortham', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#1a1a1a'
    })

    this.add.text(20, 56, 'Collect gold, find the key, then head for the door.', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#2b2b2b'
    })

    this.add.rectangle(
      this.roomLeft + this.roomWidth / 2,
      this.roomTop + this.roomHeight / 2,
      this.roomWidth,
      this.roomHeight,
      0xe9ddb8
    )

    const tileSize = 40

    for (let y = this.roomTop; y < this.roomBottom; y += tileSize) {
      for (let x = this.roomLeft; x < this.roomRight; x += tileSize) {
        const useAltColor = ((x - this.roomLeft) / tileSize + (y - this.roomTop) / tileSize) % 2 === 0
        const color = useAltColor ? 0xe7dab0 : 0xdece9e

        this.add.rectangle(x + tileSize / 2, y + tileSize / 2, tileSize, tileSize, color)
          .setStrokeStyle(1, 0xd1c089, 0.35)
      }
    }
  }

  drawClassroomDecor() {
    this.add.rectangle(400, 78, 210, 22, 0x2f6b3d)
    this.add.rectangle(400, 78, 214, 26)
      .setStrokeStyle(3, 0x704d2d)
      .setFillStyle(0x000000, 0)

    this.add.text(333, 68, 'TODAY: ESCAPE!', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#f4f7f0'
    })

    this.add.rectangle(165, 150, 70, 40, 0xb78654).setStrokeStyle(2, 0x6e4d2f)
    this.add.rectangle(245, 150, 70, 40, 0xb78654).setStrokeStyle(2, 0x6e4d2f)
    this.add.rectangle(165, 205, 70, 40, 0xb78654).setStrokeStyle(2, 0x6e4d2f)
    this.add.rectangle(245, 205, 70, 40, 0xb78654).setStrokeStyle(2, 0x6e4d2f)

    this.add.rectangle(585, 180, 110, 55, 0xc99b6b).setStrokeStyle(2, 0x6e4d2f)
    this.add.text(545, 170, 'Teacher Desk', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#2c1b12'
    })
  }

  createWalls() {
    this.wallColor = 0x8a8f96
    this.walls = [
      {
        x: this.roomLeft,
        y: this.roomTop,
        width: this.roomWidth,
        height: this.wallThickness
      },
      {
        x: this.roomLeft,
        y: this.roomBottom - this.wallThickness,
        width: this.roomWidth,
        height: this.wallThickness
      },
      {
        x: this.roomLeft,
        y: this.roomTop,
        width: this.wallThickness,
        height: this.roomHeight
      },
      {
        x: this.roomRight - this.wallThickness,
        y: this.roomTop,
        width: this.wallThickness,
        height: 150
      },
      {
        x: this.roomRight - this.wallThickness,
        y: this.roomTop + 290,
        width: this.wallThickness,
        height: this.roomHeight - 290
      }
    ]

    this.walls.forEach((wall) => {
      this.add.rectangle(
        wall.x + wall.width / 2,
        wall.y + wall.height / 2,
        wall.width,
        wall.height,
        this.wallColor
      ).setStrokeStyle(2, 0x5d6166)
    })
  }

  createExit() {
    this.exit = {
      x: this.roomRight - 12,
      y: this.roomTop + 220,
      width: 24,
      height: 120
    }

    this.exitFrame = this.add.rectangle(
      this.exit.x,
      this.exit.y,
      this.exit.width,
      this.exit.height,
      0x5c3b22
    )

    this.exitDoor = this.add.rectangle(
      this.exit.x - 3,
      this.exit.y,
      16,
      100,
      0x8b5a2b
    ).setStrokeStyle(2, 0x59371c)

    this.exitHandle = this.add.circle(this.exit.x + 2, this.exit.y, 3, 0xffd54f)

    this.add.text(this.roomRight - 60, this.roomTop + 286, 'EXIT', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#1a1a1a'
    })
  }

  createCoins() {
    this.coin = this.add.circle(280, 300, 11, 0xffd54f).setStrokeStyle(3, 0xd49d00)
    this.coin2 = this.add.circle(585, 425, 11, 0xffd54f).setStrokeStyle(3, 0xd49d00)

    this.tweens.add({
      targets: [this.coin, this.coin2],
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  createKey() {
    this.key = this.add.container(505, 245)

    const keyHead = this.add.circle(0, 0, 9, 0x6cc6ff).setStrokeStyle(3, 0x1f6f99)
    const keyHole = this.add.circle(0, 0, 3, 0xe9ddb8)
    const keyStem = this.add.rectangle(16, 0, 24, 6, 0x6cc6ff).setStrokeStyle(2, 0x1f6f99)
    const keyToothTop = this.add.rectangle(24, -5, 5, 7, 0x6cc6ff).setStrokeStyle(2, 0x1f6f99)
    const keyToothBottom = this.add.rectangle(18, 5, 5, 7, 0x6cc6ff).setStrokeStyle(2, 0x1f6f99)

    this.key.add([keyHead, keyHole, keyStem, keyToothTop, keyToothBottom])

    this.tweens.add({
      targets: this.key,
      angle: 8,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  createHallMonitor() {
    this.hallMonitor = {
      x: 420,
      y: 360,
      width: 28,
      height: 28,
      leftLimit: 330,
      rightLimit: 610,
      speed: 90,
      direction: 1
    }

    this.hallMonitorShadow = this.add.ellipse(
      this.hallMonitor.x,
      this.hallMonitor.y + 15,
      26,
      10,
      0x000000,
      0.2
    )

    this.hallMonitorBody = this.add.rectangle(
      this.hallMonitor.x,
      this.hallMonitor.y,
      this.hallMonitor.width,
      this.hallMonitor.height,
      0xd94b4b
    ).setStrokeStyle(3, 0x7a1f1f)

    this.hallMonitorBadge = this.add.rectangle(
      this.hallMonitor.x,
      this.hallMonitor.y - 4,
      10,
      8,
      0xf4d35e
    )

    this.hallMonitorLabel = this.add.text(
      this.hallMonitor.x - 36,
      this.hallMonitor.y - 34,
      'Hall Monitor',
      {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#4a1414'
      }
    )
  }

  createPlayer() {
    this.player = {
      x: this.playerStartX,
      y: this.playerStartY,
      width: 26,
      height: 26
    }

    this.playerShadow = this.add.ellipse(this.player.x, this.player.y + 14, 24, 10, 0x000000, 0.22)

    this.playerBody = this.add.rectangle(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height,
      0x3b82f6
    ).setStrokeStyle(3, 0x163d7a)
  }

  createUi() {
    this.scoreText = this.add.text(20, 86, 'Gold: 0 / 2', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#1a1a1a'
    })

    this.messageBox = this.add.rectangle(400, 96, 10, 34, 0x111111, 0.72)
      .setStrokeStyle(2, 0xf4e7b5, 0.9)
      .setDepth(20)
      .setVisible(false)

    this.messageText = this.add.text(400, 96, '', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#fff7dc',
      align: 'center'
    })
      .setOrigin(0.5)
      .setDepth(21)
      .setVisible(false)
  }

  update(time, delta) {
    if (this.hasExited) {
      this.updateMessage(delta)
      return
    }

    const dt = delta / 1000
    let moveX = 0
    let moveY = 0

    if (this.cursors.left.isDown) {
      moveX -= 1
    }
    if (this.cursors.right.isDown) {
      moveX += 1
    }
    if (this.cursors.up.isDown) {
      moveY -= 1
    }
    if (this.cursors.down.isDown) {
      moveY += 1
    }

    if (moveX !== 0 || moveY !== 0) {
      const direction = new Phaser.Math.Vector2(moveX, moveY).normalize()
      const distance = this.playerSpeed * dt

      this.movePlayer(direction.x * distance, 0)
      this.movePlayer(0, direction.y * distance)
    }

    this.updateHallMonitor(dt)

    this.playerBody.setPosition(this.player.x, this.player.y)
    this.playerShadow.setPosition(this.player.x, this.player.y + 14)

    this.checkCoinPickup(this.coin, 'hasCoin')
    this.checkCoinPickup(this.coin2, 'hasCoin2')
    this.checkKeyPickup()
    this.checkHallMonitorTouch()
    this.checkExit()
    this.updateMessage(delta)
  }

  movePlayer(deltaX, deltaY) {
    const nextX = this.player.x + deltaX
    const nextY = this.player.y + deltaY

    const nextBounds = new Phaser.Geom.Rectangle(
      nextX - this.player.width / 2,
      nextY - this.player.height / 2,
      this.player.width,
      this.player.height
    )

    for (const wall of this.walls) {
      const wallRect = new Phaser.Geom.Rectangle(wall.x, wall.y, wall.width, wall.height)

      if (Phaser.Geom.Intersects.RectangleToRectangle(nextBounds, wallRect)) {
        return
      }
    }

    this.player.x = nextX
    this.player.y = nextY
  }

  updateHallMonitor(dt) {
    this.hallMonitor.x += this.hallMonitor.speed * this.hallMonitor.direction * dt

    if (this.hallMonitor.x <= this.hallMonitor.leftLimit) {
      this.hallMonitor.x = this.hallMonitor.leftLimit
      this.hallMonitor.direction = 1
    }

    if (this.hallMonitor.x >= this.hallMonitor.rightLimit) {
      this.hallMonitor.x = this.hallMonitor.rightLimit
      this.hallMonitor.direction = -1
    }

    this.hallMonitorBody.setPosition(this.hallMonitor.x, this.hallMonitor.y)
    this.hallMonitorShadow.setPosition(this.hallMonitor.x, this.hallMonitor.y + 15)
    this.hallMonitorBadge.setPosition(this.hallMonitor.x, this.hallMonitor.y - 4)
    this.hallMonitorLabel.setPosition(this.hallMonitor.x - 36, this.hallMonitor.y - 34)
  }

  checkCoinPickup(coinShape, flagName) {
    if (this[flagName]) {
      return
    }

    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      coinShape.x,
      coinShape.y
    )

    if (distance < 22) {
      this[flagName] = true
      coinShape.setVisible(false)
      this.score += 1
      this.scoreText.setText(`Gold: ${this.score} / 2`)
      this.showMessage('Gold collected!')
    }
  }

  checkKeyPickup() {
    if (this.hasKey) {
      return
    }

    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.key.x,
      this.key.y
    )

    if (distance < 28) {
      this.hasKey = true
      this.key.setVisible(false)
      this.showMessage('You found a key!')
    }
  }

  checkHallMonitorTouch() {
    const playerBounds = new Phaser.Geom.Rectangle(
      this.player.x - this.player.width / 2,
      this.player.y - this.player.height / 2,
      this.player.width,
      this.player.height
    )

    const hallMonitorBounds = new Phaser.Geom.Rectangle(
      this.hallMonitor.x - this.hallMonitor.width / 2,
      this.hallMonitor.y - this.hallMonitor.height / 2,
      this.hallMonitor.width,
      this.hallMonitor.height
    )

    const touching = Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, hallMonitorBounds)

    if (!touching) {
      return
    }

    this.player.x = this.playerStartX
    this.player.y = this.playerStartY
    this.playerBody.setPosition(this.player.x, this.player.y)
    this.playerShadow.setPosition(this.player.x, this.player.y + 14)
    this.showMessage('Tagged! Back to start.')
  }

  checkExit() {
    const playerBounds = new Phaser.Geom.Rectangle(
      this.player.x - this.player.width / 2,
      this.player.y - this.player.height / 2,
      this.player.width,
      this.player.height
    )

    const exitZone = new Phaser.Geom.Rectangle(
      this.exit.x - this.exit.width / 2 - 10,
      this.exit.y - this.exit.height / 2,
      this.exit.width + 20,
      this.exit.height
    )

    const touchingExit = Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, exitZone)

    if (!touchingExit) {
      this.wasTouchingExit = false
      return
    }

    if (this.hasKey) {
      this.hasExited = true
      this.exitDoor.setFillStyle(0x9b6a38)
      this.showMessage('Unlocked! Home time!')
    } else if (!this.wasTouchingExit) {
      this.showMessage('Door is locked. Find the key!')
    }

    this.wasTouchingExit = true
  }

  updateMessage(delta) {
    if (this.messageFadeTimer) {
      this.messageFadeTimer -= delta

      if (this.messageFadeTimer <= 0) {
        this.messageFadeTimer = 0
        this.messageBox.setVisible(false)
        this.messageText.setVisible(false)
      }
    }
  }

  showMessage(text) {
    if (this.messageTween) {
      this.messageTween.stop()
    }

    this.messageText.setText(text)
    this.messageText.setAlpha(1)
    this.messageText.setVisible(true)

    const textWidth = this.messageText.width
    this.messageBox.width = textWidth + 32
    this.messageBox.setAlpha(1)
    this.messageBox.setVisible(true)

    this.messageFadeTimer = 1000

    this.messageTween = this.tweens.add({
      targets: [this.messageBox, this.messageText],
      alpha: 0,
      duration: 1000,
      ease: 'Sine.easeOut'
    })
  }
}
