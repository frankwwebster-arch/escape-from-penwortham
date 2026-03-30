import Phaser from 'phaser'

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game')
  }

  create() {
    this.tileSize = 16
    this.mapWidth = 80
    this.mapHeight = 60
    this.playerSpeed = 120

    this.cameras.main.setBackgroundColor('#121018')

    this.createGeneratedTextures()

    const level = this.buildLevelData()

    this.createTilemap(level)
    this.createPlayer(level.playerStart)
    this.createCamera()

    this.cursors = this.input.keyboard.createCursorKeys()
  }

  update() {
    if (!this.player || !this.cursors) {
      return
    }

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

    const direction = new Phaser.Math.Vector2(moveX, moveY)

    if (direction.lengthSq() > 0) {
      direction.normalize()
      this.player.body.setVelocity(
        direction.x * this.playerSpeed,
        direction.y * this.playerSpeed
      )
    } else {
      this.player.body.setVelocity(0, 0)
    }
  }

  createGeneratedTextures() {
    this.createTilesetTexture()
    this.createPlayerTexture()
  }

  createTilesetTexture() {
    if (this.textures.exists('generated-tiles')) {
      return
    }

    const size = this.tileSize
    const graphics = this.make.graphics({ x: 0, y: 0, add: false })

    graphics.fillStyle(0xc2b280)
    graphics.fillRect(0, 0, size, size)
    graphics.fillStyle(0xb09c69)
    graphics.fillRect(0, size - 4, size, 4)
    graphics.fillStyle(0xd8cc9d)
    graphics.fillRect(0, 0, size, 3)

    graphics.fillStyle(0xb09c69)
    graphics.fillRect(size, 0, size, size)
    graphics.fillStyle(0xcdbb89)
    graphics.fillRect(size + 3, 3, size - 6, size - 6)
    graphics.fillStyle(0x9b8758)
    graphics.fillRect(size, size - 4, size, 4)

    graphics.fillStyle(0x9f9389)
    graphics.fillRect(size * 2, 0, size, size)
    graphics.fillStyle(0xcfc5bc)
    graphics.fillRect(size * 2, 0, size, 4)
    graphics.fillStyle(0x73685f)
    graphics.fillRect(size * 2, size - 4, size, 4)

    graphics.fillStyle(0x86796f)
    graphics.fillRect(size * 3, 0, size, size)
    graphics.fillStyle(0xb6aba2)
    graphics.fillRect(size * 3, 0, size, 3)
    graphics.fillStyle(0x625750)
    graphics.fillRect(size * 3 + 3, 5, size - 6, size - 8)

    graphics.fillStyle(0x7a4a2d)
    graphics.fillRect(0, size, size, size)
    graphics.fillStyle(0x9f6942)
    graphics.fillRect(3, size + 3, size - 6, size - 6)
    graphics.fillStyle(0xc38a56)
    graphics.fillRect(0, size, size, 3)

    graphics.fillStyle(0x6f8f5f)
    graphics.fillRect(size, size, size, size)
    graphics.fillStyle(0x4a673e)
    graphics.fillRect(size + 2, size + 2, size - 4, size - 4)
    graphics.fillStyle(0x91b07a)
    graphics.fillRect(size + 4, size + 4, size - 8, size - 8)

    graphics.fillStyle(0x6b5a4a)
    graphics.fillRect(size * 2, size, size, size)
    graphics.fillStyle(0x8d7a66)
    graphics.fillRect(size * 2 + 2, size + 2, size - 4, size - 4)
    graphics.fillStyle(0xcfbe9f)
    graphics.fillRect(size * 2 + 4, size + 4, size - 8, 3)

    graphics.fillStyle(0x6b5f8f)
    graphics.fillRect(size * 3, size, size, size)
    graphics.fillStyle(0x534a70)
    graphics.fillRect(size * 3, size + 10, size, 6)
    graphics.fillStyle(0xb4a5d5)
    graphics.fillRect(size * 3 + 3, size + 3, size - 6, 4)

    graphics.fillStyle(0x5f5f6b)
    graphics.fillRect(0, size * 2, size, size)
    graphics.fillStyle(0x908c96)
    graphics.fillRect(4, size * 2 + 4, size - 8, size - 8)

    graphics.fillStyle(0x2f4e6d)
    graphics.fillRect(size, size * 2, size, size)
    graphics.fillStyle(0x4f78a1)
    graphics.fillRect(size + 2, size * 2 + 2, size - 4, size - 4)
    graphics.fillStyle(0xbfd8f0)
    graphics.fillRect(size + 4, size * 2 + 4, size - 8, size - 8)

    graphics.generateTexture('generated-tiles', size * 4, size * 4)
    graphics.destroy()
  }

  createPlayerTexture() {
    if (this.textures.exists('player-tile')) {
      return
    }

    const size = this.tileSize
    const graphics = this.make.graphics({ x: 0, y: 0, add: false })

    graphics.fillStyle(0x000000, 0.18)
    graphics.fillEllipse(size / 2, size - 2, 10, 4)

    graphics.fillStyle(0xffd4b2)
    graphics.fillRect(4, 1, 8, 6)
    graphics.fillStyle(0x6d452c)
    graphics.fillRect(3, 0, 10, 3)

    graphics.fillStyle(0xb44343)
    graphics.fillRect(3, 7, 10, 5)
    graphics.fillStyle(0xffffff)
    graphics.fillRect(6, 6, 4, 2)
    graphics.fillStyle(0x5d647a)
    graphics.fillRect(4, 12, 8, 2)
    graphics.fillStyle(0x3b2b24)
    graphics.fillRect(4, 14, 3, 2)
    graphics.fillRect(9, 14, 3, 2)

    graphics.generateTexture('player-tile', size, size)
    graphics.destroy()
  }

  buildLevelData() {
    const floorData = this.createEmptyLayer()
    const wallData = this.createEmptyLayer()
    const decorationData = this.createEmptyLayer()

    const startRoom = { x: 4, y: 8, width: 14, height: 12 }
    const topRoom = { x: 28, y: 6, width: 16, height: 12 }
    const bottomRoom = { x: 48, y: 26, width: 18, height: 14 }
    const corridorA = { x: 18, y: 12, width: 10, height: 4 }
    const corridorB = { x: 36, y: 16, width: 4, height: 12 }
    const corridorC = { x: 40, y: 26, width: 8, height: 4 }

    const rooms = [startRoom, topRoom, bottomRoom, corridorA, corridorB, corridorC]

    rooms.forEach((room) => {
      this.paintFloorArea(floorData, room.x, room.y, room.width, room.height)
    })

    this.buildWallLayer(floorData, wallData)
    this.paintDecorations(decorationData, startRoom, topRoom, bottomRoom)

    return {
      floorData,
      wallData,
      decorationData,
      playerStart: {
        x: (startRoom.x + 3) * this.tileSize + this.tileSize / 2,
        y: (startRoom.y + 5) * this.tileSize + this.tileSize / 2
      }
    }
  }

  createEmptyLayer() {
    return Array.from({ length: this.mapHeight }, () => Array(this.mapWidth).fill(-1))
  }

  paintFloorArea(layer, startX, startY, width, height) {
    for (let y = startY; y < startY + height; y += 1) {
      for (let x = startX; x < startX + width; x += 1) {
        layer[y][x] = (x + y) % 2 === 0 ? 0 : 1
      }
    }
  }

  buildWallLayer(floorData, wallData) {
    for (let y = 0; y < this.mapHeight; y += 1) {
      for (let x = 0; x < this.mapWidth; x += 1) {
        if (floorData[y][x] !== -1) {
          continue
        }

        const nearFloor = this.getNeighborFloorCount(floorData, x, y)

        if (nearFloor === 0) {
          continue
        }

        const floorAbove = this.isFloor(floorData, x, y + 1)
        wallData[y][x] = floorAbove ? 2 : 3
      }
    }
  }

  getNeighborFloorCount(floorData, x, y) {
    let count = 0

    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        if (offsetX === 0 && offsetY === 0) {
          continue
        }

        if (this.isFloor(floorData, x + offsetX, y + offsetY)) {
          count += 1
        }
      }
    }

    return count
  }

  isFloor(floorData, x, y) {
    if (x < 0 || y < 0 || x >= this.mapWidth || y >= this.mapHeight) {
      return false
    }

    return floorData[y][x] !== -1
  }

  paintDecorations(layer, startRoom, topRoom, bottomRoom) {
    this.paintDecorationRect(layer, startRoom.x + 2, startRoom.y + 2, 2, 1, 4)
    this.paintDecorationRect(layer, startRoom.x + 2, startRoom.y + 5, 2, 1, 4)
    this.paintDecorationRect(layer, startRoom.x + 9, startRoom.y + 2, 3, 2, 6)
    this.paintDecorationRect(layer, topRoom.x + 10, topRoom.y + 2, 3, 2, 4)
    this.paintDecorationRect(layer, bottomRoom.x + 2, bottomRoom.y + 2, 1, 3, 5)
    this.paintDecorationRect(layer, bottomRoom.x + 11, bottomRoom.y + 8, 3, 2, 6)

    layer[startRoom.y + 4][startRoom.x + 6] = 7
    layer[topRoom.y + 3][topRoom.x + 3] = 5
    layer[bottomRoom.y + 4][bottomRoom.x + 8] = 9
  }

  paintDecorationRect(layer, startX, startY, width, height, tileIndex) {
    for (let y = startY; y < startY + height; y += 1) {
      for (let x = startX; x < startX + width; x += 1) {
        layer[y][x] = tileIndex
      }
    }
  }

  createTilemap(level) {
    this.map = this.make.tilemap({
      tileWidth: this.tileSize,
      tileHeight: this.tileSize,
      width: this.mapWidth,
      height: this.mapHeight
    })

    const tileset = this.map.addTilesetImage('generated-tiles', 'generated-tiles', this.tileSize, this.tileSize)

    this.floorLayer = this.map.createBlankLayer('floor', tileset)
    this.wallLayer = this.map.createBlankLayer('walls', tileset)
    this.decorationLayer = this.map.createBlankLayer('decorations', tileset)

    this.floorLayer.putTilesAt(level.floorData, 0, 0)
    this.wallLayer.putTilesAt(level.wallData, 0, 0)
    this.decorationLayer.putTilesAt(level.decorationData, 0, 0)

    this.wallLayer.setCollisionByExclusion([-1])
  }

  createPlayer(startPosition) {
    this.player = this.physics.add.sprite(startPosition.x, startPosition.y, 'player-tile')
    this.player.setCollideWorldBounds(true)
    this.player.body.setSize(10, 10)
    this.player.body.setOffset(3, 5)

    this.physics.add.collider(this.player, this.wallLayer)
  }

  createCamera() {
    const mapPixelWidth = this.mapWidth * this.tileSize
    const mapPixelHeight = this.mapHeight * this.tileSize

    this.cameras.main.setBounds(0, 0, mapPixelWidth, mapPixelHeight)
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12)
    this.cameras.main.setZoom(2)
    this.cameras.main.roundPixels = true

    this.physics.world.setBounds(0, 0, mapPixelWidth, mapPixelHeight)
  }
}
