import GlobalProperties from "./network/GlobalProperties"
import { Enemy, Friend, MapDefinition, Packet } from "../../interfaces/blablaland"
import { ObjectDatabase } from "../../interfaces/database"
import SocketMessage from "./network/SocketMessage"
import Maps from '../../json/maps.json'
import Map from "./Map"
import User from "./User"

class Camera {

    id: number
    user: User

    mainCamera: boolean = false
    method: number

    currMap: number
    serverId: number
    prevMap: number|undefined
    mapReady: boolean
    isTeleportForce: boolean

    constructor(id: number, user: User, mainCamera: boolean, method: number) {
        this.id = id
        this.user = user
        this.mainCamera = mainCamera
        this.method = method
        this.currMap = user.mapId
        this.serverId = user.serverId
        this.prevMap = undefined
        this.mapReady = true
        this.isTeleportForce = false
    }
    
    /**
     * @returns void
     */
    createMainCamera(): void {
        const mapFound: MapDefinition|undefined = Maps.find((m): boolean => m.id == this.user.mapId)
        const packetSender: Packet = {
            type: 3,
            subType: 2
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_ERROR_ID, this.user.isGameUnmodified ? 0 : 1)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CAMERA_ID, this.id)
        socketMessage.bitWriteString(this.user.chatColor)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, this.user.mapId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_FILEID,  mapFound?.fileId ?? this.user.mapId)
        this.user.getListPackSmiley().forEach((packId: number): void => {
            socketMessage.bitWriteBoolean(true)
            socketMessage.bitWriteUnsignedInt(8, 0)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SMILEY_PACK_ID, packId)
        })
        socketMessage.bitWriteBoolean(false) // smiley
        this.user.getListFriend().forEach((friend: Friend): void => {
            if (friend.isAccepted) {
                socketMessage.bitWriteBoolean(true)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, friend.userId)
                socketMessage.bitWriteString(friend.pseudo)
            }
        })
        socketMessage.bitWriteBoolean(false) // friends
        this.user.getListEnemy().forEach((enemy: Enemy): void => {
                socketMessage.bitWriteBoolean(true)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, enemy.userId)
                socketMessage.bitWriteString(enemy.pseudo)
        })
        socketMessage.bitWriteBoolean(false) // blacklist
        this.user.inventory.getListObject().forEach((object: ObjectDatabase): void => {
            this.user.inventory.addObject(socketMessage, object)
        })
        this.user.socketManager.send(socketMessage)
    }

    /**
     *
     * @param map
     * @param options
     */
    onMapReady(map: Map, options?: {method?: number}): void {
        const packetSender: Packet = {
            type: 4,
            subType: 1
        }
        const mapFound: MapDefinition|undefined = Maps.find((m) => m.id == map.fileId || m.id == map.id)
        const error: number = (mapFound && this.user.grade < mapFound.gradeId && !this.isTeleportForce) ? 1 : 0

        if (!error) {
            map.enter(this.user, {
                method: this.method,
                individual: mapFound?.individual
            })
        }

        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CAMERA_ID, this.id)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_ERROR_ID, (error === 0 && !this.user.isGameUnmodified) ? 1 : error)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_METHODE_ID, this.method)

        if (mapFound) {
            socketMessage.bitWriteSignedInt(17, mapFound.positionX)
            socketMessage.bitWriteSignedInt(17, mapFound.positionY)
            socketMessage.bitWriteUnsignedInt(5, mapFound.meteoId)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_TRANSPORT_ID, mapFound.transportId)
            socketMessage.bitWriteUnsignedInt(16, mapFound.protected)

            map.getListUser().forEach((user: User): void => {
                if (mapFound && mapFound.individual && user.pid !== this.user.pid) return
                if (!user.inConsole) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
                    socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, user.pid)
                    socketMessage.bitWriteString(user.pseudo)
                    socketMessage.bitWriteUnsignedInt(3, user.gender)
                    socketMessage.bitWriteUnsignedInt(32, user.time)

                    let loadSkin: boolean = user.pid !== this.user.pid || this.prevMap == undefined // If this is my first map
                    let loadObject: boolean = user.pid !== this.user.pid || this.prevMap === undefined // I don't load objects if the user is me
                    socketMessage.bitWriteBinaryData(user.walker.writeStateToMessage(new SocketMessage, loadSkin, loadObject, this.user))
                }
            })
            socketMessage.bitWriteBoolean(false)
            for (let FX of map.mapFX.getListFX()) {
                socketMessage.bitWriteBoolean(true)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_ID, FX.id!)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, FX.sid!)
                socketMessage.bitWriteBinaryData(FX.binary!)
            }
            socketMessage.bitWriteBoolean(false)
            this.user.socketManager.send(socketMessage)
            this.mapReady = true
            if (this.isTeleportForce && this.user.mapId !== map.id) {
                this.isTeleportForce = false
            }
        }
    }

    /**
     * Teleport user to map
     * @param mapId
     * @param options
     */
    gotoMap(mapId: number,  options?: {mapFileId? : number, method?: number, defaultPos?: boolean, positionX?: number, positionY?: number, direction?: boolean, serverId?: number, isTeleportForce?: boolean}): void {
        if (!this.mapReady) return
        const packetSender: Packet = {
            type: 4,
            subType: 2
        }

        const mapFound: MapDefinition|undefined = Maps.find((m): boolean => m.id === (options?.mapFileId ?? mapId))
        if (options?.positionX && options.positionY) {
            this.user.walker.positionX = options.positionX
            this.user.walker.positionY = options.positionY
        } else if(options?.defaultPos) {
            this.user.walker.positionX = 475
            this.user.walker.positionY = 212
        } else if (mapFound && mapFound.respawnY && mapFound.respawnX) {
            this.user.walker.positionX = mapFound.respawnX
            this.user.walker.positionY = mapFound.respawnY
        }

        if(options?.direction) {
            this.user.walker.direction = options.direction
        }
        if (options?.method) {
            this.method = options.method
        } else {
            this.method = 4
        }
        if (options?.isTeleportForce) {
            this.isTeleportForce = options.isTeleportForce
        }

        this.user.walker.underWater = false
        this.user.walker.grimpe = false
        this.user.walker.accroche = false
        this.user.walker.speedY = 0
        this.user.walker.speedX = 0

        this.user.serverManager.getUniverseById(this.user.serverId)?.universeManager.getMapById(this.user.mapId).leave(this.user, this.method)
        this.user.mapId = mapId
        this.prevMap = this.currMap
        this.currMap = mapId
        this.mapReady = false

        if (typeof options?.serverId !== "undefined") {
            if (![0, 1, 2].includes(options.serverId)) {
                options.serverId = 0
            }
            this.user.serverId = options.serverId
        }

        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CAMERA_ID, this.id)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, mapId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, options?.serverId ?? this.serverId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_FILEID, options?.mapFileId ?? mapId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_METHODE_ID, this.method)
        this.user.socketManager.send(socketMessage)
    }
}

export default Camera