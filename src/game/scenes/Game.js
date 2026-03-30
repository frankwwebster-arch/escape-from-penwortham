import Phaser from 'phaser'

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game')

    this.tileSize = 16
    this.tilesetKey = 'dungeon-tiles'
    this.tilesetPath = 'assets/dungeon-tileset.png'
    this.mapWidth = 100
    this.mapHeight = 70
    this.playerSpeed = 120
  }

  preload() {
    console.info(`[Game] Loading tileset image: /${this.tilesetPath}`)

    this.load.on('loaderror', (file) => {
      console.error(`[Game] Failed to load asset: ${file.key} from ${file.src}`)
    })

    this.load.image(this.tilesetKey, this.tilesetPath)
  }

  create() {
    console.info('[Game] Creating tilemap scene')
    this.cameras.main.setBackgroundColor('#0f1320')

    if (!this.textures.exists(this.tilesetKey)) {
      this.showSceneError(
        'Missing tileset image',
        `Expected public/${this.tilesetPath}`
      )
      return
    }

    const level = this.buildLevelData()
    const texture = this.textures.get(this.tilesetKey).getSourceImage()
    const tileCount = Math.floor(texture.width / this.tileSize) * Math.floor(texture.height / this.tileSize)
    const maxTileIndex = this.getMaxTileIndex(level)

    console.info(
      `[Game] Tileset size ${texture.width}x${texture.height}, tile size ${this.tileSize}, tile count ${tileCount}`
    )

    if (maxTileIndex >= tileCount) {
      this.showSceneError(
        'Tileset does not contain enough tiles',
        `Highest tile index used is ${maxTileIndex}, but the tileset only has ${tileCount} tiles.`
      )
      return
    }

    this.createTilemap(level)

    if (!this.floorLayer || !this.wallLayer || !this.decorationLayer) {
      this.showSceneError(
        'Layer creation failed',
        'One or more tilemap layers could not be created. Check the tileset PNG and layer setup.'
      )
      return
    }

    this.createPlayer(level.playerStart)
    this.createCamera()

    this.cursors = this.input.keyboard.createCursorKeys()

    console.info('[Game] Scene created successfully')
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

  buildLevelData() {
    const floor = this.createEmptyLayer()
    const walls = this.createEmptyLayer()
    const decorations = this.createEmptyLayer()

    const startRoom = { x: 6, y: 8, width: 18, height: 14 }
    const topRoom = { x: 34, y: 6, width: 18, height: 14 }
    const bottomRoom = { x: 56, y: 28, width: 22, height: 18 }

    const corridorA = { x: 24, y: 13, width: 10, height: 4 }
    const corridorB = { x: 42, y: 20, width: 4, height: 12 }
    const corridorC = { x: 46, y: 30, width: 10, height: 4 }

    const walkableAreas = [startRoom, topRoom, bottomRoom, corridorA, corridorB, corridorC]

    walkableAreas.forEach((area) => {
      this.paintFloorArea(floor, area.x, area.y, area.width, area.height)
    })

    this.buildWallLayer(floor, walls)
    this.paintDecorations(decorations, startRoom, topRoom, bottomRoom)

    return {
      floor,
      walls,
      decorations,
      playerStart: {
        x: (startRoom.x + 4) * this.tileSize + this.tileSize / 2,
        y: (startRoom.y + 7) * this.tileSize + this.tileSize / 2
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

  buildWallLayer(floor, walls) {
    for (let y = 0; y < this.mapHeight; y += 1) {
      for (let x = 0; x < this.mapWidth; x += 1) {
        if (floor[y][x] !== -1) {
          continue
        }

        const hasAdjacentFloor = this.countAdjacentFloorTiles(floor, x, y) > 0

        if (!hasAdjacentFloor) {
          continue
        }

        // These tile ids assume the first few tiles in the dungeon sheet include
        // basic wall blocks. If your tileset differs, adjust these indices.
        walls[y][x] = this.isFloor(floor, x, y + 1) ? 2 : 3
      }
    }
  }

  countAdjacentFloorTiles(floor, x, y) {
    let count = 0

    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        if (offsetX === 0 && offsetY === 0) {
          continue
        }

        if (this.isFloor(floor, x + offsetX, y + offsetY)) {
          count += 1
        }
      }
    }

    return count
  }

  isFloor(floor, x, y) {
    if (x < 0 || y < 0 || x >= this.mapWidth || y >= this.mapHeight) {
      return false
    }

    return floor[y][x] !== -1
  }

  paintDecorations(layer, startRoom, topRoom, bottomRoom) {
    this.paintDecorationRect(layer, startRoom.x + 2, startRoom.y + 2, 2, 1, 4)
    this.paintDecorationRect(layer, startRoom.x + 2, startRoom.y + 5, 2, 1, 4)
    this.paintDecorationRect(layer, startRoom.x + 11, startRoom.y + 2, 2, 2, 5)

    this.paintDecorationRect(layer, topRoom.x + 10, topRoom.y + 2, 3, 2, 4)
    this.paintDecorationRect(layer, topRoom.x + 3, topRoom.y + 3, 1, 1, 6)

    this.paintDecorationRect(layer, bottomRoom.x + 2, bottomRoom.y + 2, 1, 3, 5)
    this.paintDecorationRect(layer, bottomRoom.x + 12, bottomRoom.y + 9, 3, 2, 4)
    this.paintDecorationRect(layer, bottomRoom.x + 8, bottomRoom.y + 4, 1, 1, 7)
  }

  paintDecorationRect(layer, startX, startY, width, height, tileIndex) {
    for (let y = startY; y < startY + height; y += 1) {
      for (let x = startX; x < startX + width; x += 1) {
        layer[y][x] = tileIndex
      }
    }
  }

  getMaxTileIndex(level) {
    const layers = [level.floor, level.walls, level.decorations]
    let maxIndex = -1

    layers.forEach((layer) => {
      layer.forEach((row) => {
        row.forEach((tile) => {
          if (tile > maxIndex) {
            maxIndex = tile
          }
        })
      })
    })

    return maxIndex
  }

  createTilemap(level) {
    this.map = this.make.tilemap({
      tileWidth: this.tileSize,
      tileHeight: this.tileSize,
      width: this.mapWidth,
      height: this.mapHeight
    })

    const tileset = this.map.addTilesetImage(
      this.tilesetKey,
      this.tilesetKey,
      this.tileSize,
      this.tileSize,
      0,
      0
    )

    if (!tileset) {
      console.error('[Game] addTilesetImage returned null. Check the tileset key, tile size, and PNG.')
      return
    }

    this.floorLayer = this.map.createBlankLayer('floor', tileset, 0, 0, this.mapWidth, this.mapHeight)
    this.wallLayer = this.map.createBlankLayer('walls', tileset, 0, 0, this.mapWidth, this.mapHeight)
    this.decorationLayer = this.map.createBlankLayer('decorations', tileset, 0, 0, this.mapWidth, this.mapHeight)

    if (!this.floorLayer || !this.wallLayer || !this.decorationLayer) {
      console.error('[Game] Failed to create one or more tilemap layers.')
      return
    }

    this.floorLayer.putTilesAt(level.floor, 0, 0)
    this.wallLayer.putTilesAt(level.walls, 0, 0)
    this.decorationLayer.putTilesAt(level.decorations, 0, 0)

    this.wallLayer.setCollisionByExclusion([-1])

    console.info('[Game] Tilemap layers created:', {
      floor: !!this.floorLayer,
      walls: !!this.wallLayer,
      decorations: !!this.decorationLayer
    })
  }

  createPlayer(startPosition) {
    this.player = this.add.rectangle(startPosition.x, startPosition.y, 12, 12, 0xd87a58)
      .setStrokeStyle(2, 0x2e1d1a)

    this.physics.add.existing(this.player)

    this.player.body.setCollideWorldBounds(true)
    this.player.body.setSize(12, 12)

    this.physics.add.collider(this.player, this.wallLayer)
  }

  createCamera() {
    const worldWidth = this.mapWidth * this.tileSize
    const worldHeight = this.mapHeight * this.tileSize

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight)
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12)
    this.cameras.main.setZoom(2)
    this.cameras.main.roundPixels = true

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight)
  }

  showSceneError(title, details) {
    console.error(`[Game] ${title}: ${details}`)

    this.add.text(32, 32, title, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ff8080'
    })

    this.add.text(32, 72, details, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: 760 }
    })

    // Fail loudly instead of silently leaving a blank background.
  }
}
