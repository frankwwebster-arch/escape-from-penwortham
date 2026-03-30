import Phaser from 'phaser'

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game')

    this.tileSize = 16
    this.mapWidth = 96
    this.mapHeight = 64
    this.playerSpeed = 120

    this.tilesetKey = 'dungeon-tiles'
    this.tilesetPath = 'assets/darkdungeon_tileset_allinone.png'

    // These tile ids assume the provided sheet is a 21-column 16x16 tileset,
    // matching the uploaded reference image. If your exported PNG differs,
    // adjust these ids instead of changing the scene structure.
    this.tileIds = {
      floorA: 378,
      floorB: 379,
      wallTop: 84,
      wallFace: 105,
      wallPillar: 106,
      decoTorch: 177,
      decoBanner: 651,
      decoShelf: 694,
      decoCrate: 680
    }
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

    const tilesetImage = this.textures.get(this.tilesetKey).getSourceImage()

    if (!tilesetImage || !tilesetImage.width || !tilesetImage.height) {
      this.showSceneError(
        'Invalid tileset image',
        'The loaded tileset image has no usable dimensions.'
      )
      return
    }

    console.info(
      `[Game] Tileset loaded: ${tilesetImage.width}x${tilesetImage.height}, tile size ${this.tileSize}`
    )

    const level = this.buildLevelData()
    const tileCount = Math.floor(tilesetImage.width / this.tileSize) * Math.floor(tilesetImage.height / this.tileSize)
    const maxTileIndex = this.getMaxTileIndex(level)

    if (maxTileIndex >= tileCount) {
      this.showSceneError(
        'Tile index out of range',
        `Highest tile index used is ${maxTileIndex}, but the tileset only contains ${tileCount} tiles.`
      )
      return
    }

    this.createTilemap(level)

    if (!this.floorLayer || !this.wallLayer || !this.decorationLayer) {
      this.showSceneError(
        'Tilemap layer creation failed',
        'Check the tileset image key, tile size, and createBlankLayer setup.'
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
    const floorData = this.createEmptyLayer()
    const wallData = this.createEmptyLayer()
    const decorationData = this.createEmptyLayer()

    const startRoom = { x: 6, y: 10, width: 16, height: 12 }
    const corridor = { x: 22, y: 14, width: 18, height: 4 }
    const topRoom = { x: 40, y: 8, width: 18, height: 12 }
    const verticalLink = { x: 48, y: 20, width: 4, height: 14 }
    const bottomRoom = { x: 34, y: 34, width: 22, height: 14 }

    const walkableAreas = [startRoom, corridor, topRoom, verticalLink, bottomRoom]

    walkableAreas.forEach((area) => {
      this.paintFloorArea(floorData, area.x, area.y, area.width, area.height)
    })

    this.buildWallLayer(floorData, wallData)
    this.paintDecorations(decorationData, startRoom, topRoom, bottomRoom)

    return {
      floorData,
      wallData,
      decorationData,
      playerStart: {
        x: (startRoom.x + 3) * this.tileSize + this.tileSize / 2,
        y: (startRoom.y + 6) * this.tileSize + this.tileSize / 2
      }
    }
  }

  createEmptyLayer() {
    return Array.from({ length: this.mapHeight }, () => Array(this.mapWidth).fill(-1))
  }

  paintFloorArea(layer, startX, startY, width, height) {
    for (let y = startY; y < startY + height; y += 1) {
      for (let x = startX; x < startX + width; x += 1) {
        layer[y][x] = (x + y) % 2 === 0 ? this.tileIds.floorA : this.tileIds.floorB
      }
    }
  }

  buildWallLayer(floorData, wallData) {
    for (let y = 0; y < this.mapHeight; y += 1) {
      for (let x = 0; x < this.mapWidth; x += 1) {
        if (floorData[y][x] !== -1) {
          continue
        }

        const adjacentFloorCount = this.countAdjacentFloorTiles(floorData, x, y)

        if (adjacentFloorCount === 0) {
          continue
        }

        const floorBelow = this.isFloor(floorData, x, y + 1)
        const floorAbove = this.isFloor(floorData, x, y - 1)

        if (floorBelow) {
          wallData[y][x] = this.tileIds.wallTop
        } else if (floorAbove) {
          wallData[y][x] = this.tileIds.wallFace
        } else {
          wallData[y][x] = this.tileIds.wallPillar
        }
      }
    }
  }

  countAdjacentFloorTiles(floorData, x, y) {
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
    this.paintDecorationRect(layer, startRoom.x + 3, startRoom.y + 2, 2, 1, this.tileIds.decoTorch)
    this.paintDecorationRect(layer, startRoom.x + 10, startRoom.y + 2, 1, 1, this.tileIds.decoBanner)

    this.paintDecorationRect(layer, topRoom.x + 2, topRoom.y + 2, 1, 1, this.tileIds.decoTorch)
    this.paintDecorationRect(layer, topRoom.x + 12, topRoom.y + 3, 2, 1, this.tileIds.decoShelf)

    this.paintDecorationRect(layer, bottomRoom.x + 3, bottomRoom.y + 2, 2, 1, this.tileIds.decoShelf)
    this.paintDecorationRect(layer, bottomRoom.x + 14, bottomRoom.y + 8, 1, 1, this.tileIds.decoCrate)
  }

  paintDecorationRect(layer, startX, startY, width, height, tileIndex) {
    for (let y = startY; y < startY + height; y += 1) {
      for (let x = startX; x < startX + width; x += 1) {
        layer[y][x] = tileIndex
      }
    }
  }

  getMaxTileIndex(level) {
    const layers = [level.floorData, level.wallData, level.decorationData]
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
      console.error('[Game] addTilesetImage returned null. The tileset key or tile size is wrong.')
      return
    }

    this.floorLayer = this.map.createBlankLayer('floor', tileset, 0, 0, this.mapWidth, this.mapHeight)
    this.wallLayer = this.map.createBlankLayer('walls', tileset, 0, 0, this.mapWidth, this.mapHeight)
    this.decorationLayer = this.map.createBlankLayer('decorations', tileset, 0, 0, this.mapWidth, this.mapHeight)

    if (!this.floorLayer || !this.wallLayer || !this.decorationLayer) {
      console.error('[Game] Tilemap layer creation failed.', {
        floorLayer: !!this.floorLayer,
        wallLayer: !!this.wallLayer,
        decorationLayer: !!this.decorationLayer
      })
      return
    }

    this.floorLayer.putTilesAt(level.floorData, 0, 0)
    this.wallLayer.putTilesAt(level.wallData, 0, 0)
    this.decorationLayer.putTilesAt(level.decorationData, 0, 0)

    this.wallLayer.setCollisionByExclusion([-1])

    console.info('[Game] Tilemap layers created successfully')
  }

  createPlayer(startPosition) {
    this.player = this.add.rectangle(startPosition.x, startPosition.y, 12, 12, 0xe08a5b)
      .setStrokeStyle(2, 0x2a1b14)

    this.physics.add.existing(this.player)

    this.player.body.setSize(12, 12)
    this.player.body.setCollideWorldBounds(true)

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
      wordWrap: { width: 780 }
    })

    // Fail loudly instead of silently leaving only the background visible.
  }
}
