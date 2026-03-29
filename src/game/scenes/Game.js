import Phaser from 'phaser'

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game')
  }

  create() {
    this.cameras.main.setBackgroundColor('#a9d5e8')

    this.roomLeft = 80
    this.roomTop = 100
    this.roomWidth = 640
    this.roomHeight = 440
    this.roomRight = this.roomLeft + this.roomWidth
    this.roomBottom = this.roomTop + this.roomHeight
    this.wallThickness = 20
    this.showObstacleDebug = false

    this.playerStartX = 150
    this.playerStartY = 255
    this.playerSpeed = 190
    this.playerFacing = 'down'

    this.score = 0
    this.lives = 3
    this.isGameStarted = false
    this.isLevelSelected = false
    this.selectedLevel = null
    this.unlockedLevels = ['Nursery']
    this.isHiding = false
    this.hasCoin = false
    this.hasCoin2 = false
    this.hasKey = false
    this.hasExited = false
    this.isGameOver = false
    this.dutyTeacherDefeated = false
    this.wasTouchingExit = false
    this.attackTimer = 0
    this.attackCooldownTimer = 0
    this.attackDuration = 150
    this.attackCooldown = 350
    this.attackHasHit = false

    this.drawFloor()
    this.drawClassroomDecor()
    this.createWalls()
    this.createExit()
    this.createFurnitureObstacles()
    this.createCoins()
    this.createKey()
    this.createDutyTeacher()
    this.createPlayer()
    this.createUi()
    this.createLivesUi()
    this.createTitleScreen()
    this.createLevelSelectScreen()

    this.cubbyZone = new Phaser.Geom.Rectangle(158, 410, 64, 32)

    this.cursors = this.input.keyboard.createCursorKeys()
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.hideKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
    this.updateLivesUi()
  }

  drawFloor() {
    this.add.rectangle(400, 46, 760, 68, 0x1f4d63, 0.98).setStrokeStyle(3, 0xf7f0c6)
    this.add.rectangle(400, 46, 728, 44, 0x4c89a6, 0.78).setStrokeStyle(2, 0xffffff, 0.18)

    this.add.rectangle(
      this.roomLeft + this.roomWidth / 2,
      this.roomTop + this.roomHeight / 2,
      this.roomWidth,
      this.roomHeight,
      0xf6e7bf
    ).setStrokeStyle(6, 0xc6a76c)

    this.add.rectangle(
      this.roomLeft + this.roomWidth / 2,
      this.roomTop + this.roomHeight / 2,
      this.roomWidth - 18,
      this.roomHeight - 18,
      0xffffff,
      0.06
    )

    const tileSize = 40

    for (let y = this.roomTop; y < this.roomBottom; y += tileSize) {
      for (let x = this.roomLeft; x < this.roomRight; x += tileSize) {
        const useAltColor = ((x - this.roomLeft) / tileSize + (y - this.roomTop) / tileSize) % 2 === 0
        const color = useAltColor ? 0xf5e7be : 0xebd9a7

        this.add.rectangle(x + tileSize / 2, y + tileSize / 2, tileSize, tileSize, color)
          .setStrokeStyle(1, 0xd6bf7a, 0.45)
      }
    }

    for (let y = this.roomTop + 20; y < this.roomBottom; y += 80) {
      this.add.rectangle(this.roomLeft + this.roomWidth / 2, y, this.roomWidth - 28, 4, 0xffffff, 0.12)
    }

    this.add.rectangle(400, 320, 190, 116, 0xc74858, 0.88).setStrokeStyle(4, 0x893443)
    this.add.rectangle(400, 320, 160, 86, 0xe68d9c, 0.35).setStrokeStyle(2, 0xf8d9de, 0.35)
  }

  drawClassroomDecor() {
    this.add.rectangle(this.roomLeft + 34, this.roomTop + 34, 24, 24, 0x8ba1b1).setStrokeStyle(2, 0xeaf2f5)
    this.add.rectangle(this.roomRight - 34, this.roomTop + 34, 24, 24, 0x8ba1b1).setStrokeStyle(2, 0xeaf2f5)
    this.add.rectangle(this.roomLeft + 34, this.roomBottom - 34, 24, 24, 0x8ba1b1).setStrokeStyle(2, 0xeaf2f5)
    this.add.rectangle(this.roomRight - 34, this.roomBottom - 34, 24, 24, 0x8ba1b1).setStrokeStyle(2, 0xeaf2f5)

    this.add.rectangle(400, 78, 240, 28, 0x2f6b3d)
    this.add.rectangle(400, 78, 246, 34)
      .setStrokeStyle(3, 0x704d2d)
      .setFillStyle(0x000000, 0)

    this.add.text(323, 67, 'TODAY: ESCAPE!', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#f4f7f0'
    })

    this.add.rectangle(165, 150, 70, 40, 0xc59155).setStrokeStyle(2, 0x6e4d2f)
    this.add.rectangle(245, 150, 70, 40, 0xc59155).setStrokeStyle(2, 0x6e4d2f)
    this.add.rectangle(165, 205, 70, 40, 0xc59155).setStrokeStyle(2, 0x6e4d2f)
    this.add.rectangle(245, 205, 70, 40, 0xc59155).setStrokeStyle(2, 0x6e4d2f)

    this.add.rectangle(165, 132, 58, 6, 0xe7c79c, 0.9)
    this.add.rectangle(245, 132, 58, 6, 0xe7c79c, 0.9)
    this.add.rectangle(165, 187, 58, 6, 0xe7c79c, 0.9)
    this.add.rectangle(245, 187, 58, 6, 0xe7c79c, 0.9)
    this.add.rectangle(165, 162, 52, 6, 0x9c6e3a, 0.35)
    this.add.rectangle(245, 162, 52, 6, 0x9c6e3a, 0.35)
    this.add.rectangle(165, 217, 52, 6, 0x9c6e3a, 0.35)
    this.add.rectangle(245, 217, 52, 6, 0x9c6e3a, 0.35)

    this.add.rectangle(585, 180, 110, 55, 0xc99b6b).setStrokeStyle(2, 0x6e4d2f)
    this.add.rectangle(585, 152, 90, 10, 0xe5c798, 0.9)
    this.add.rectangle(585, 194, 90, 8, 0x8a5d31, 0.28)
    this.add.text(545, 170, 'Teacher Desk', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#2c1b12'
    })

    this.add.rectangle(120, 360, 38, 90, 0xb34d4d).setStrokeStyle(2, 0x6e2323)
    this.add.rectangle(120, 332, 26, 8, 0xdbba7e, 0.85)
    this.add.text(103, 328, 'BOOKS', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#5f1d1d'
    })

    this.add.rectangle(190, 426, 88, 44, 0x6fb7a2).setStrokeStyle(2, 0x2c6a59)
    this.add.rectangle(190, 426, 68, 24, 0xbde8dc, 0.45)
    this.add.text(160, 418, 'HIDE', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#17473c'
    })

    this.add.rectangle(670, 420, 70, 48, 0x7c56b1).setStrokeStyle(2, 0x412a67)
    this.add.rectangle(670, 420, 52, 14, 0xa88bd5, 0.45)
    this.add.text(648, 412, 'CUBBY', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#f6ecff'
    })
  }

  createWalls() {
    this.wallColor = 0x6f7f93
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

    this.obstacles = []

    this.walls.forEach((wall) => {
      this.obstacles.push(new Phaser.Geom.Rectangle(wall.x, wall.y, wall.width, wall.height))

      this.add.rectangle(
        wall.x + wall.width / 2,
        wall.y + wall.height / 2,
        wall.width,
        wall.height,
        this.wallColor
      ).setStrokeStyle(3, 0xe8edf1)

      this.add.rectangle(
        wall.x + wall.width / 2,
        wall.y + wall.height / 2,
        wall.width - 6,
        wall.height - 6,
        0xffffff,
        0.08
      )

      this.add.rectangle(
        wall.x + wall.width / 2,
        wall.y + wall.height / 2 - Math.max(0, wall.height / 2 - 4),
        Math.max(8, wall.width - 10),
        4,
        0xffffff,
        0.18
      )
    })
  }

  createExit() {
    this.exit = {
      x: this.roomRight - 12,
      y: this.roomTop + 220,
      width: 24,
      height: 120
    }

    this.lockedDoorBlock = {
      x: this.roomRight - this.wallThickness,
      y: this.exit.y - this.exit.height / 2,
      width: this.wallThickness,
      height: this.exit.height
    }

    this.exitArch = this.add.ellipse(this.exit.x - 2, this.exit.y - 43, 34, 24, 0x6f4123, 0.95)
      .setStrokeStyle(2, 0x42210f)

    this.exitFrame = this.add.rectangle(
      this.exit.x,
      this.exit.y,
      this.exit.width,
      this.exit.height,
      0x58341d
    )

    this.exitDoor = this.add.rectangle(
      this.exit.x - 3,
      this.exit.y,
      16,
      100,
      0x8b5a2b
    ).setStrokeStyle(2, 0x59371c)

    this.exitHandle = this.add.circle(this.exit.x + 2, this.exit.y, 3, 0xffd54f)
    this.exitStep = this.add.rectangle(this.exit.x - 6, this.exit.y + 58, 34, 8, 0x8e989d).setStrokeStyle(2, 0x61686c)

    this.exitWindow = this.add.rectangle(this.exit.x - 3, this.exit.y - 24, 9, 18, 0x8fc8e8, 0.8)
      .setStrokeStyle(1, 0x2c5b73)

    this.exitSign = this.add.rectangle(this.roomRight - 55, this.roomTop + 286, 66, 20, 0xf8f2cf)
      .setStrokeStyle(2, 0x7a6940)

    this.exitSignText = this.add.text(this.roomRight - 76, this.roomTop + 278, 'LOCKED', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#6b2a2a'
    })

    this.updateDoorLook()
  }

  createFurnitureObstacles() {
    this.furnitureObstacles = []

    const furnitureRects = [
      new Phaser.Geom.Rectangle(140, 138, 50, 24),
      new Phaser.Geom.Rectangle(220, 138, 50, 24),
      new Phaser.Geom.Rectangle(140, 193, 50, 24),
      new Phaser.Geom.Rectangle(220, 193, 50, 24),
      new Phaser.Geom.Rectangle(540, 160, 90, 38),
      new Phaser.Geom.Rectangle(108, 323, 24, 68),
      new Phaser.Geom.Rectangle(642, 403, 56, 34)
    ]

    furnitureRects.forEach((rect) => {
      this.furnitureObstacles.push(rect)
      this.obstacles.push(rect)

      if (this.showObstacleDebug) {
        this.add.rectangle(
          rect.x + rect.width / 2,
          rect.y + rect.height / 2,
          rect.width,
          rect.height,
          0xff0000,
          0.25
        ).setStrokeStyle(2, 0xaa0000, 0.8)
      }
    })
  }

  createCoins() {
    this.coin = this.createCoin(280, 300)
    this.coin2 = this.createCoin(585, 425)

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

  createCoin(x, y) {
    const coin = this.add.container(x, y)
    const glow = this.add.circle(0, 0, 16, 0xfff1a8, 0.28)
    const sparkleA = this.add.star(0, 0, 4, 9, 13, 0xfff6c5, 0.2)
    const outer = this.add.circle(0, 0, 11, 0xffd54f).setStrokeStyle(3, 0xc88a00)
    const inner = this.add.circle(0, 0, 7, 0xffef99)
    const shine = this.add.rectangle(-3, -3, 6, 2, 0xffffff, 0.7).setAngle(-25)
    const mark = this.add.text(-4, -7, 'C', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#9a6a00'
    })

    coin.add([glow, sparkleA, outer, inner, shine, mark])
    return coin
  }

  createKey() {
    this.key = this.add.container(505, 245)

    const keyGlow = this.add.circle(0, 0, 20, 0xa9f0ff, 0.34)
    const keySparkle = this.add.star(0, 0, 4, 10, 15, 0xe6fbff, 0.18)
    const keyHead = this.add.circle(0, 0, 9, 0x66d7ff).setStrokeStyle(3, 0x0b6f95)
    const keyHole = this.add.circle(0, 0, 3, 0xe9ddb8)
    const keyStem = this.add.rectangle(16, 0, 24, 6, 0x66d7ff).setStrokeStyle(2, 0x0b6f95)
    const keyToothTop = this.add.rectangle(24, -5, 5, 7, 0x66d7ff).setStrokeStyle(2, 0x0b6f95)
    const keyToothBottom = this.add.rectangle(18, 5, 5, 7, 0x66d7ff).setStrokeStyle(2, 0x0b6f95)

    this.key.add([keyGlow, keySparkle, keyHead, keyHole, keyStem, keyToothTop, keyToothBottom])

    this.tweens.add({
      targets: this.key,
      angle: 8,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    this.key.setVisible(false)
  }

  createDutyTeacher() {
    this.dutyTeacher = {
      x: 420,
      y: 360,
      width: 28,
      height: 28,
      leftLimit: 330,
      rightLimit: 610,
      speed: 90,
      direction: 1
    }

    this.dutyTeacherShadow = this.add.ellipse(this.dutyTeacher.x, this.dutyTeacher.y + 18, 30, 12, 0x000000, 0.22)
    this.dutyTeacherBody = this.add.rectangle(this.dutyTeacher.x, this.dutyTeacher.y + 1, 24, 24, 0x4c6d8b)
      .setStrokeStyle(3, 0x27435b)
    this.dutyTeacherShirt = this.add.rectangle(this.dutyTeacher.x, this.dutyTeacher.y - 2, 16, 10, 0xe7eef3)
      .setStrokeStyle(1, 0x7a8d9e)
    this.dutyTeacherTie = this.add.rectangle(this.dutyTeacher.x, this.dutyTeacher.y + 1, 4, 10, 0xd95b5b)
    this.dutyTeacherHead = this.add.circle(this.dutyTeacher.x, this.dutyTeacher.y - 16, 10, 0xffd4b0)
      .setStrokeStyle(2, 0x7c4d39)
    this.dutyTeacherHair = this.add.rectangle(this.dutyTeacher.x, this.dutyTeacher.y - 22, 18, 7, 0x5b4335)
    this.dutyTeacherBadge = this.add.rectangle(this.dutyTeacher.x + 6, this.dutyTeacher.y + 1, 8, 8, 0xf4d35e)
      .setStrokeStyle(1, 0x9b7b12)
    this.dutyTeacherClipboard = this.add.rectangle(this.dutyTeacher.x - 11, this.dutyTeacher.y + 4, 10, 15, 0xf7efcc)
      .setAngle(-8)
      .setStrokeStyle(1, 0x7b6c45)
    this.dutyTeacherArms = this.add.rectangle(this.dutyTeacher.x, this.dutyTeacher.y + 2, 28, 4, 0x354d64)
    this.dutyTeacherShoes = this.add.rectangle(this.dutyTeacher.x, this.dutyTeacher.y + 15, 18, 5, 0x2a2a33)
    this.dutyTeacherLabel = this.add.text(this.dutyTeacher.x - 36, this.dutyTeacher.y - 46, 'Duty Teacher', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#5c2020'
    })
  }

  createPlayer() {
    this.player = {
      x: this.playerStartX,
      y: this.playerStartY,
      width: 26,
      height: 26
    }

    this.playerShadow = this.add.ellipse(this.player.x, this.player.y + 18, 28, 12, 0x000000, 0.24)
    this.playerBody = this.add.rectangle(this.player.x, this.player.y + 1, 22, 18, 0xc94d4d)
      .setStrokeStyle(3, 0x7d2424)
    this.playerCollar = this.add.rectangle(this.player.x, this.player.y - 8, 12, 5, 0xffffff)
      .setStrokeStyle(1, 0xd0d0d0)
    this.playerShorts = this.add.rectangle(this.player.x, this.player.y + 12, 20, 9, 0x7b8794)
      .setStrokeStyle(1, 0x4d5660)
    this.playerHead = this.add.circle(this.player.x, this.player.y - 15, 11, 0xffd9b8)
      .setStrokeStyle(2, 0x8a5c42)
    this.playerHair = this.add.rectangle(this.player.x, this.player.y - 22, 20, 8, 0x6a4328)
    this.playerArms = this.add.rectangle(this.player.x, this.player.y + 1, 28, 4, 0xa53b3b)
    this.playerSocks = this.add.rectangle(this.player.x, this.player.y + 17, 14, 5, 0xf5f5f5)
    this.playerShoes = this.add.rectangle(this.player.x, this.player.y + 21, 16, 5, 0x3f2d23)
    this.playerFaceMarker = this.add.rectangle(this.player.x, this.player.y - 10, 10, 4, 0x7d2424)
      .setOrigin(0.5)

    this.attackSwish = this.add.rectangle(this.player.x, this.player.y, 24, 14, 0xffffff, 0.45)
      .setStrokeStyle(2, 0xffd54f)
      .setVisible(false)
  }

  createUi() {
    this.hudTitle = this.add.text(48, 26, 'Escape from Penwortham', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#fff7dc'
    })

    this.hudSubtitle = this.add.text(48, 54, 'Collect gold, bonk the Duty Teacher, grab the key, then head for the door.', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#d7edf7'
    })

    this.scoreBadge = this.add.rectangle(575, 34, 124, 38, 0xf6ecc0).setStrokeStyle(2, 0x92743b)
    this.scoreText = this.add.text(525, 24, 'Gold: 0 / 2', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#3b2b14'
    })

    this.keyBadge = this.add.rectangle(688, 34, 116, 38, 0xd8eef8).setStrokeStyle(2, 0x3e7998)
    this.keyStatusText = this.add.text(646, 24, 'Key: Missing', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#16435a'
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

    this.hiddenText = this.add.text(this.player.x, this.player.y - 34, 'Hidden', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#d7edf7'
    })
      .setOrigin(0.5)
      .setDepth(22)
      .setVisible(false)

    this.updateHud()
  }

  createLivesUi() {
    this.hearts = []

    this.livesBadge = this.add.rectangle(785, 34, 118, 38, 0xf9d8d8).setStrokeStyle(2, 0xa34d4d)
    this.livesLabel = this.add.text(742, 24, 'Lives', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#6b2323'
    })

    for (let i = 0; i < 3; i += 1) {
      const heartX = 790 + i * 24
      const heartY = 34
      const heart = this.add.container(heartX, heartY)
      const leftLobe = this.add.circle(-5, -3, 6, 0xe14b5a)
      const rightLobe = this.add.circle(5, -3, 6, 0xe14b5a)
      const point = this.add.triangle(0, 4, -11, -1, 11, -1, 0, 12, 0xe14b5a)
      const shine = this.add.circle(-3, -5, 2, 0xffffff, 0.35)

      heart.add([leftLobe, rightLobe, point, shine])
      this.hearts.push(heart)
    }

    this.gameOverText = this.add.text(400, 260, 'Game Over', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#fff7dc'
    })
      .setOrigin(0.5)
      .setDepth(30)
      .setVisible(false)

    this.restartText = this.add.text(400, 310, 'Press R to restart', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#fff7dc'
    })
      .setOrigin(0.5)
      .setDepth(30)
      .setVisible(false)
  }

  createTitleScreen() {
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x102535, 0.82)
      .setInteractive()
    const title = this.add.text(400, 230, 'Escape from Penwortham', {
      fontFamily: 'Arial',
      fontSize: '42px',
      color: '#fff7dc'
    }).setOrigin(0.5)
    const subtitle = this.add.text(400, 285, 'School Escape Adventure', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#d7edf7'
    }).setOrigin(0.5)
    const prompt = this.add.text(400, 365, 'Click to continue', {
      fontFamily: 'Arial',
      fontSize: '26px',
      color: '#ffe58f'
    }).setOrigin(0.5)

    overlay.on('pointerdown', () => {
      if (!this.isGameStarted) {
        this.showLevelSelect()
      }
    })

    this.titleContainer = this.add.container(0, 0, [overlay, title, subtitle, prompt])
    this.titleContainer.setDepth(50)
  }

  createLevelSelectScreen() {
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x122433, 0.88)
    const heading = this.add.text(400, 170, 'Select Level', {
      fontFamily: 'Arial',
      fontSize: '34px',
      color: '#fff7dc'
    }).setOrigin(0.5)

    const nurseryButton = this.add.rectangle(400, 260, 260, 54, 0xdaf4dd)
      .setStrokeStyle(3, 0x2f7a40)
      .setInteractive()
    const nurseryText = this.add.text(400, 260, 'Nursery', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#215b30'
    }).setOrigin(0.5)

    nurseryButton.on('pointerdown', () => {
      this.selectedLevel = 'Nursery'
      this.isLevelSelected = true
      this.levelSelectContainer.setVisible(false)
    })

    const corridorButton = this.add.rectangle(400, 340, 260, 54, 0x6f7f93, 0.55)
      .setStrokeStyle(3, 0x42515f)
    const corridorText = this.add.text(400, 340, 'Year 6 Corridor', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#d7dde2'
    }).setOrigin(0.5)
    const corridorLock = this.add.text(540, 340, 'LOCKED', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#f8d98d'
    }).setOrigin(0.5)

    const playgroundButton = this.add.rectangle(400, 420, 260, 54, 0x6f7f93, 0.55)
      .setStrokeStyle(3, 0x42515f)
    const playgroundText = this.add.text(400, 420, 'Playground', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#d7dde2'
    }).setOrigin(0.5)
    const playgroundLock = this.add.text(540, 420, 'LOCKED', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#f8d98d'
    }).setOrigin(0.5)

    this.levelSelectContainer = this.add.container(0, 0, [
      overlay,
      heading,
      nurseryButton,
      nurseryText,
      corridorButton,
      corridorText,
      corridorLock,
      playgroundButton,
      playgroundText,
      playgroundLock
    ])
    this.levelSelectContainer.setDepth(51)
    this.levelSelectContainer.setVisible(false)
  }

  showLevelSelect() {
    this.isGameStarted = true
    this.titleContainer.setVisible(false)
    this.levelSelectContainer.setVisible(true)
  }

  update(time, delta) {
    if (!this.isLevelSelected) {
      return
    }

    if (this.isGameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart()
      }

      this.updateMessage(delta)
      return
    }

    if (this.hasExited) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart()
      }

      this.updateMessage(delta)
      return
    }

    const dt = delta / 1000
    const inCubbyZone = this.rectsOverlap(this.getPlayerBounds(), this.cubbyZone)
    let moveX = 0
    let moveY = 0

    if (Phaser.Input.Keyboard.JustDown(this.hideKey) && inCubbyZone) {
      this.isHiding = !this.isHiding
      this.setPlayerAlpha(this.isHiding ? 0.4 : 1)

      if (this.isHiding) {
        this.showMessage('Hiding...')
      }
    }

    if (!this.isHiding && this.cursors.left.isDown) {
      moveX -= 1
      this.playerFacing = 'left'
    }
    if (!this.isHiding && this.cursors.right.isDown) {
      moveX += 1
      this.playerFacing = 'right'
    }
    if (!this.isHiding && this.cursors.up.isDown) {
      moveY -= 1
      this.playerFacing = 'up'
    }
    if (!this.isHiding && this.cursors.down.isDown) {
      moveY += 1
      this.playerFacing = 'down'
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.attackKey) &&
      this.attackTimer <= 0 &&
      this.attackCooldownTimer <= 0
    ) {
      this.startAttack()
    }

    if (moveX !== 0 || moveY !== 0) {
      const direction = new Phaser.Math.Vector2(moveX, moveY).normalize()
      const distance = this.playerSpeed * dt

      this.movePlayer(direction.x * distance, 0)
      this.movePlayer(0, direction.y * distance)
    }

    this.updateDutyTeacher(dt)
    this.updateAttack(delta)

    this.updatePlayerLook()
    this.updateHidingUi()

    this.checkCoinPickup(this.coin, 'hasCoin')
    this.checkCoinPickup(this.coin2, 'hasCoin2')
    this.checkKeyPickup()
    this.checkAttackHit()
    this.checkDutyTeacherTouch()
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

    for (const obstacle of this.obstacles) {
      if (this.rectsOverlap(nextBounds, obstacle)) {
        return
      }
    }

    if (!this.hasKey) {
      if (this.rectsOverlap(nextBounds, this.getLockedDoorBounds())) {
        return
      }
    }

    this.player.x = nextX
    this.player.y = nextY
  }

  updateDutyTeacher(dt) {
    if (this.dutyTeacherDefeated) {
      return
    }

    this.dutyTeacher.x += this.dutyTeacher.speed * this.dutyTeacher.direction * dt

    if (this.dutyTeacher.x <= this.dutyTeacher.leftLimit) {
      this.dutyTeacher.x = this.dutyTeacher.leftLimit
      this.dutyTeacher.direction = 1
    }

    if (this.dutyTeacher.x >= this.dutyTeacher.rightLimit) {
      this.dutyTeacher.x = this.dutyTeacher.rightLimit
      this.dutyTeacher.direction = -1
    }

    this.dutyTeacherShadow.setPosition(this.dutyTeacher.x, this.dutyTeacher.y + 17)
    this.dutyTeacherBody.setPosition(this.dutyTeacher.x, this.dutyTeacher.y + 1)
    this.dutyTeacherShirt.setPosition(this.dutyTeacher.x, this.dutyTeacher.y - 2)
    this.dutyTeacherTie.setPosition(this.dutyTeacher.x, this.dutyTeacher.y + 1)
    this.dutyTeacherHead.setPosition(this.dutyTeacher.x, this.dutyTeacher.y - 16)
    this.dutyTeacherHair.setPosition(this.dutyTeacher.x, this.dutyTeacher.y - 22)
    this.dutyTeacherBadge.setPosition(this.dutyTeacher.x + 6, this.dutyTeacher.y + 1)
    this.dutyTeacherClipboard.setPosition(this.dutyTeacher.x - 11, this.dutyTeacher.y + 4)
    this.dutyTeacherArms.setPosition(this.dutyTeacher.x, this.dutyTeacher.y + 2)
    this.dutyTeacherShoes.setPosition(this.dutyTeacher.x, this.dutyTeacher.y + 15)
    this.dutyTeacherLabel.setPosition(this.dutyTeacher.x - 36, this.dutyTeacher.y - 46)
  }

  startAttack() {
    this.attackTimer = this.attackDuration
    this.attackCooldownTimer = this.attackCooldown
    this.attackHasHit = false
    this.attackSwish.setAlpha(1)
    this.attackSwish.setVisible(true)
    this.updateAttackSwish()
  }

  updateAttack(delta) {
    if (this.attackCooldownTimer > 0) {
      this.attackCooldownTimer -= delta

      if (this.attackCooldownTimer < 0) {
        this.attackCooldownTimer = 0
      }
    }

    if (this.attackTimer <= 0) {
      this.attackSwish.setVisible(false)
      return
    }

    this.attackTimer -= delta
    this.updateAttackSwish()

    if (this.attackTimer <= 0) {
      this.attackTimer = 0
      this.attackSwish.setVisible(false)
    }
  }

  updateAttackSwish() {
    const offset = 24
    let swishX = this.player.x
    let swishY = this.player.y
    let swishWidth = 24
    let swishHeight = 14

    if (this.playerFacing === 'left') {
      swishX -= offset
      swishWidth = 20
      swishHeight = 26
    } else if (this.playerFacing === 'right') {
      swishX += offset
      swishWidth = 20
      swishHeight = 26
    } else if (this.playerFacing === 'up') {
      swishY -= offset
      swishWidth = 26
      swishHeight = 20
    } else {
      swishY += offset
      swishWidth = 26
      swishHeight = 20
    }

    this.attackSwish.setPosition(swishX, swishY)
    this.attackSwish.setSize(swishWidth, swishHeight)
    this.attackSwish.setDisplaySize(swishWidth, swishHeight)
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
      this.updateHud()
      this.showMessage('Gold collected!')
    }
  }

  checkKeyPickup() {
    if (this.hasKey || !this.key.visible) {
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
      this.updateHud()
      this.updateDoorLook()
      this.showMessage('You got the key!')
    }
  }

  checkAttackHit() {
    if (this.dutyTeacherDefeated || this.attackTimer <= 0 || this.attackHasHit) {
      return
    }

    const attackBounds = this.attackSwish.getBounds()

    if (this.rectsOverlap(attackBounds, this.getTeacherBounds())) {
      this.attackHasHit = true
      this.defeatDutyTeacher()
    }
  }

  defeatDutyTeacher() {
    this.dutyTeacherDefeated = true
    this.dutyTeacherBody.setVisible(false)
    this.dutyTeacherShadow.setVisible(false)
    this.dutyTeacherShirt.setVisible(false)
    this.dutyTeacherTie.setVisible(false)
    this.dutyTeacherHead.setVisible(false)
    this.dutyTeacherHair.setVisible(false)
    this.dutyTeacherBadge.setVisible(false)
    this.dutyTeacherClipboard.setVisible(false)
    this.dutyTeacherArms.setVisible(false)
    this.dutyTeacherShoes.setVisible(false)
    this.dutyTeacherLabel.setVisible(false)
    this.spawnKey(this.dutyTeacher.x + 10, this.dutyTeacher.y)
    this.showMessage('You got past the Duty Teacher!')
  }

  spawnKey(x, y) {
    this.key.setPosition(x, y)
    this.key.setVisible(true)
  }

  checkDutyTeacherTouch() {
    if (this.dutyTeacherDefeated) {
      return
    }

    if (this.isHiding) {
      return
    }

    const touching = this.rectsOverlap(this.getPlayerBounds(), this.getTeacherBounds())

    if (!touching) {
      return
    }

    this.lives -= 1
    this.updateLivesUi()
    this.showMessage('Caught!')

    if (this.lives > 0) {
      this.player.x = this.playerStartX
      this.player.y = this.playerStartY
      this.updatePlayerLook()
      return
    }

    this.triggerGameOver()
  }

  checkExit() {
    const exitZone = new Phaser.Geom.Rectangle(
      this.exit.x - this.exit.width / 2 - 10,
      this.exit.y - this.exit.height / 2,
      this.exit.width + 20,
      this.exit.height
    )

    const touchingExit = this.rectsOverlap(this.getPlayerBounds(), exitZone)

    if (!touchingExit) {
      this.wasTouchingExit = false
      return
    }

    if (this.hasKey) {
      this.hasExited = true
      this.updateDoorLook()
      this.showMessage('Unlocked! Home time!')
      this.restartText.setText('Press R to restart')
      this.restartText.setVisible(true)
    } else if (!this.wasTouchingExit) {
      this.showMessage('Door is locked.')
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

  updateHud() {
    this.scoreText.setText(`Gold: ${this.score} / 2`)
    this.keyStatusText.setText(this.hasKey ? 'Key: Found' : 'Key: Missing')
    this.keyBadge.setFillStyle(this.hasKey ? 0xcff4d7 : 0xd8eef8)
    this.keyBadge.setStrokeStyle(2, this.hasKey ? 0x2d7a41 : 0x3e7998)
    this.keyStatusText.setColor(this.hasKey ? '#215b30' : '#16435a')
  }

  updateDoorLook() {
    if (this.hasKey) {
      this.exitArch.setFillStyle(0x2d6940)
      this.exitFrame.setFillStyle(0x265b34)
      this.exitDoor.setFillStyle(0x3ea35a)
      this.exitDoor.setStrokeStyle(2, 0x1f5c31)
      this.exitHandle.setFillStyle(0xfff1a8)
      this.exitWindow.setFillStyle(0xcaf4ae, 0.9)
      this.exitSign.setFillStyle(0xe0f4c9)
      this.exitStep.setFillStyle(0xa8c39e)
      this.exitSignText.setText('OPEN')
      this.exitSignText.setColor('#215b30')
      this.exitSignText.setPosition(this.roomRight - 67, this.roomTop + 278)
    } else {
      this.exitArch.setFillStyle(0x6f4123)
      this.exitFrame.setFillStyle(0x58341d)
      this.exitDoor.setFillStyle(0x8b5a2b)
      this.exitDoor.setStrokeStyle(2, 0x59371c)
      this.exitHandle.setFillStyle(0xffd54f)
      this.exitWindow.setFillStyle(0x8fc8e8, 0.8)
      this.exitSign.setFillStyle(0xf8f2cf)
      this.exitStep.setFillStyle(0x8e989d)
      this.exitSignText.setText('LOCKED')
      this.exitSignText.setColor('#6b2a2a')
      this.exitSignText.setPosition(this.roomRight - 76, this.roomTop + 278)
    }
  }

  updatePlayerLook() {
    this.playerShadow.setPosition(this.player.x, this.player.y + 18)
    this.playerBody.setPosition(this.player.x, this.player.y + 1)
    this.playerCollar.setPosition(this.player.x, this.player.y - 8)
    this.playerShorts.setPosition(this.player.x, this.player.y + 12)
    this.playerHead.setPosition(this.player.x, this.player.y - 15)
    this.playerHair.setPosition(this.player.x, this.player.y - 22)
    this.playerArms.setPosition(this.player.x, this.player.y + 1)
    this.playerSocks.setPosition(this.player.x, this.player.y + 17)
    this.playerShoes.setPosition(this.player.x, this.player.y + 21)

    let markerX = this.player.x
    let markerY = this.player.y - 10
    let markerWidth = 10
    let markerHeight = 4

    if (this.playerFacing === 'left') {
      markerX = this.player.x - 7
      markerWidth = 4
      markerHeight = 10
    } else if (this.playerFacing === 'right') {
      markerX = this.player.x + 7
      markerWidth = 4
      markerHeight = 10
    } else if (this.playerFacing === 'up') {
      markerY = this.player.y - 15
      markerWidth = 10
      markerHeight = 4
    } else {
      markerY = this.player.y - 6
      markerWidth = 10
      markerHeight = 4
    }

    this.playerFaceMarker.setPosition(markerX, markerY)
    this.playerFaceMarker.setSize(markerWidth, markerHeight)
    this.playerFaceMarker.setDisplaySize(markerWidth, markerHeight)
  }

  updateHidingUi() {
    const inCubbyZone = this.rectsOverlap(this.getPlayerBounds(), this.cubbyZone)
    this.hiddenText.setPosition(this.player.x, this.player.y - 34)
    this.hiddenText.setVisible(this.isHiding || inCubbyZone)
    this.hiddenText.setText(this.isHiding ? 'Hidden' : 'Press SHIFT to hide')
  }

  setPlayerAlpha(alpha) {
    this.playerShadow.setAlpha(alpha)
    this.playerBody.setAlpha(alpha)
    this.playerCollar.setAlpha(alpha)
    this.playerShorts.setAlpha(alpha)
    this.playerHead.setAlpha(alpha)
    this.playerHair.setAlpha(alpha)
    this.playerArms.setAlpha(alpha)
    this.playerSocks.setAlpha(alpha)
    this.playerShoes.setAlpha(alpha)
    this.playerFaceMarker.setAlpha(alpha)
  }

  updateLivesUi() {
    this.hearts.forEach((heart, index) => {
      heart.setVisible(index < this.lives)
    })
  }

  triggerGameOver() {
    this.isGameOver = true
    this.gameOverText.setVisible(true)
    this.restartText.setText('Press R to restart')
    this.restartText.setVisible(true)
  }

  getPlayerBounds() {
    return new Phaser.Geom.Rectangle(
      this.player.x - this.player.width / 2,
      this.player.y - this.player.height / 2,
      this.player.width,
      this.player.height
    )
  }

  getTeacherBounds() {
    return new Phaser.Geom.Rectangle(
      this.dutyTeacher.x - this.dutyTeacher.width / 2,
      this.dutyTeacher.y - this.dutyTeacher.height / 2,
      this.dutyTeacher.width,
      this.dutyTeacher.height
    )
  }

  getLockedDoorBounds() {
    return new Phaser.Geom.Rectangle(
      this.lockedDoorBlock.x,
      this.lockedDoorBlock.y,
      this.lockedDoorBlock.width,
      this.lockedDoorBlock.height
    )
  }

  rectsOverlap(rectA, rectB) {
    return Phaser.Geom.Intersects.RectangleToRectangle(rectA, rectB)
  }
}
