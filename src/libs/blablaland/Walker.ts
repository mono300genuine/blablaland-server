import GlobalProperties from "./network/GlobalProperties"
import SocketMessage from "./network/SocketMessage"
import SkinColor from "./SkinColor"
import User from "./User"
import { Packet } from "../../interfaces/blablaland"

class Walker {

    private user: User

    jump: number = 0
    walk: number = 0
    shiftKey: boolean = false
    direction: boolean = false
    onFloor: boolean = false
    underWater: boolean = false
    grimpe: boolean = false
    accroche: boolean = false
    surfaceBody: number = 0
    isDodo: boolean = false
    positionX: number = 71534
    positionY: number = 29125
    speedX: number = 0
    speedY: number = 0

    // Skin Dance
    isDance: boolean = false
    danseCooldown: number = Date.now()
    danseCooldownCount: number = 0

    constructor(user: User) {
        this.user = user
    }
    
    /**
     * @param  {SocketMessage} socketMessage
     * @returns SocketMessage
     */
     writeStateToMessage(socketMessage: SocketMessage, loadSkin?: boolean, loadObject?: boolean, user?: User): SocketMessage {
        socketMessage.bitWriteSignedInt(2, this.jump) // jump
        socketMessage.bitWriteSignedInt(2, this.walk) // walk
        socketMessage.bitWriteBoolean(this.shiftKey) // shiftKey
        socketMessage.bitWriteBoolean(this.direction) //direction
        socketMessage.bitWriteBoolean(this.onFloor) // onFloor
        socketMessage.bitWriteBoolean(this.underWater) // underWater
        socketMessage.bitWriteBoolean(this.grimpe) // grimpe
        socketMessage.bitWriteBoolean(this.accroche) // accroche
        
        socketMessage.bitWriteBoolean(true)
        socketMessage.bitWriteSignedInt(21, this.positionX) // positionX
        socketMessage.bitWriteSignedInt(21, this.positionY) // positionY
        socketMessage.bitWriteUnsignedInt(8, this.surfaceBody) // surfaceBody
        socketMessage.bitWriteSignedInt(18, this.speedX) // speed X
        socketMessage.bitWriteSignedInt(18, this.speedY) // speed Y

        socketMessage.bitWriteBoolean(loadSkin ?? false)
        if (loadSkin) {
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SKIN_ID, this.user.skinId)
            SkinColor.exportBinaryColor(socketMessage, this.user.skinColor)
            socketMessage.bitWriteBoolean(this.isDodo) // dodo
        }

        if (loadObject) {
            for (let FX of this.user.userFX.getListFX()) {
                if (FX.isPersistant) {
                    if (this.user.pid != user?.pid && FX.isSendOther|| FX.isYourself) {
                        socketMessage.bitWriteBoolean(true)
                        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_ID, FX.id!)
                        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, FX.sid!)
                        socketMessage.bitWriteBinaryData(FX.binary!)
                    }
                }
            }
        }
        socketMessage.bitWriteBoolean(false) // fxMemory
        return socketMessage
    }
    
    /**
     * @param  {SocketMessage} socketMessage
     */
    readStateFromMessage(socketMessage: SocketMessage) {
        this.jump = socketMessage.bitReadSignedInt(2)
        this.walk = socketMessage.bitReadSignedInt(2)
        this.shiftKey = socketMessage.bitReadBoolean()
        this.direction = socketMessage.bitReadBoolean()
        this.onFloor = socketMessage.bitReadBoolean()
        this.underWater = socketMessage.bitReadBoolean()
        this.grimpe = socketMessage.bitReadBoolean()
        this.accroche = socketMessage.bitReadBoolean()
        if (socketMessage.bitReadBoolean()) {
            this.positionX = socketMessage.bitReadSignedInt(21)
            this.positionY = socketMessage.bitReadSignedInt(21)
            this.surfaceBody = socketMessage.bitReadUnsignedInt(8)
            this.speedX = socketMessage.bitReadSignedInt(18)
            this.speedY = socketMessage.bitReadSignedInt(18)
        }
        if (socketMessage.bitReadBoolean()) {
            this.user.skinColor = SkinColor.readBinaryColor(socketMessage)
        }
    }

    /**
     */
    reloadState(options?: {mapId?: number, method?: number, loadSkin?: boolean}): void {
        const packetSender = {
            type: 5,
            subType: 9
        }
        let socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, this.user.mapId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, this.user.serverId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, this.user.pid)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_METHODE_ID, options?.method ?? 4)
        socketMessage = this.writeStateToMessage(socketMessage, options?.loadSkin ?? false)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_METHODE_ID, options?.method ?? 4)
        this.user.socketManager.sendAll(socketMessage)
    }

    /**
     * @param isActive
     */
    setDodo(isActive: boolean) {
        this.isDodo = isActive
        const packetSender: Packet = {
            type: 5,
            subType: 5
        }
        let socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, this.user.mapId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, this.user.serverId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, this.user.pid)
        socketMessage.bitWriteBoolean(isActive)
        this.user.socketManager.sendAll(socketMessage)
    }
}

export default Walker