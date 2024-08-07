import GlobalProperties from "../network/GlobalProperties"
import { ParamsFX, Packet } from "../../../interfaces/blablaland"
import { ObjectDatabase } from "../../../interfaces/database"
import SocketMessage from "../network/SocketMessage"
import User from "../User"
import Binary from "../network/Binary"
import SkinColor from "../SkinColor"

class UserFX {

    private user
    private listFX: Array<ParamsFX>
    private lastSID: number

    constructor(user: User) {
        this.user = user
        this.listFX = new Array<ParamsFX>()
        this.lastSID = 0
    }

    writeChange(params: ParamsFX): void {
        params = this.parseParams(params)

        if (typeof params.id === 'undefined') {
            throw new Error(`ParamsFX is undefined`)
        }

        const packetSender: Packet = {
            type: 5,
            subType: 6
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, this.user.mapId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, this.user.serverId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, this.user.pid)

        socketMessage.bitWriteBoolean(params.isForce!)
        socketMessage.bitWriteBoolean(params.isActive!)

        if (!params.isActive) {
            socketMessage.bitWriteUnsignedInt(2, params.close!)
        }
        
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_ID, params.id)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, params.sid!)

        params.binary = this.parseMessage(params)
        socketMessage.bitWriteBinaryData(params.binary)

        if (params.isMap) {
            this.user.socketManager.sendAll(socketMessage)
        } else {
            this.user.socketManager.send(socketMessage)
        }

        if (params.isActive && typeof params.duration !== "undefined") {
            params.timeout = setTimeout(() => params = this.dispose(params), params.duration*1000)
        }

        if (params.isActive && (params.isPersistant || params.duration)) {
            if (!params.identifier) {
                params.identifier = params.sid!.toString()
            }
            params.identifier = `${params.id}_${params.identifier}`
            this.addListFX(params)
        }
    }

    private parseMessage(params: ParamsFX): SocketMessage {
        let socketMessage: SocketMessage = new SocketMessage
        switch(params.id) {
            case 1: // lightEffectColor
                socketMessage.bitWriteUnsignedInt(24, params.data)
                break
            case 2: // floodPunished
                break
            case 3: // setPeinture
                SkinColor.exportBinaryColor(socketMessage, params.data)
                break
            case 4:
                if (params.data.walkspeed) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteUnsignedInt(6, 2)
                    socketMessage.bitWriteSignedInt(9, params.data.walkspeed)
                }
                if (params.data.jumpspeed) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteUnsignedInt(6, 3)
                    socketMessage.bitWriteSignedInt(9, params.data.jumpspeed)
                }
                if (params.data.skinId) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteUnsignedInt(6, 5)
                    socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SKIN_ID, params.data.skinId)
                }
                if (params.data.duration) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteUnsignedInt(6, 14)
                    let dateServer = Date.now()
                    socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
                    socketMessage.bitWriteUnsignedInt(32, (dateServer / 1000) + params.data.duration)
                }
                if (params.data.skinColor) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteUnsignedInt(6, 6)
                    SkinColor.exportBinaryColor(socketMessage, params.data.skinColor)
                }
                if (params.data.pseudo) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteUnsignedInt(6, 8)
                    socketMessage.bitWriteString(params.data.pseudo)
                }
                if (params.data.binary) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteUnsignedInt(6, 10)
                    socketMessage.bitWriteBinaryData(params.data.binary)
                }
                if (params.data.size) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteUnsignedInt(6, 13)
                    socketMessage.bitWriteUnsignedInt(9, params.data.size)
                }
                break
            case 5: // actionSkin
                const [skByte, delayed, data] = params.data
                socketMessage.bitWriteUnsignedInt(32, skByte)
                socketMessage.bitWriteBoolean(delayed)
                if (params.data.length > 2) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteBinaryData(data)
                } else {
                    socketMessage.bitWriteBoolean(false)
                }
                break
            case 6: // onUserObjectLoaded
                const [fxFileId, objectId, dataBinary]: [number, number, Binary] = params.data
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_ID, fxFileId)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, objectId)
                if (params.data.length > 2) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteBinaryData(dataBinary)
                } else {
                    socketMessage.bitWriteBoolean(false)
                }
                break
            case 8: // onUserFxActivity
                socketMessage = params.data
                break
            default:
                break
        }
        return socketMessage
    }

    private parseParams(params: ParamsFX): ParamsFX {
        const defaults = {
            sid: 0,
            isActive: true,
            isMap: true,
            isPersistant: true,
            isProtected: false,
            isYourself: false,
            isSendOther: true,
            close: 1
          }

        if(params.sid == null) {
            params.sid = this.lastSID
            this.lastSID++
        }
        
          return {
            ...defaults,
            ...params,
          }
    }

    /**
     * @param params
     */
    dispose(params: ParamsFX): ParamsFX {
        params.isActive = false
        if (typeof params.duration !== "undefined") {
            if (!this.user.getCamera()?.mapReady) {
                params.isActive = true
                params.timeout = setTimeout(() => this.dispose(params), 50)
                return params
            }
            clearTimeout(params.timeout)
            if (typeof params.launchedAt !== "undefined") {
                this.reloadQuantityObject(params)
            }
        }
        this.writeChange(params)
        this.removeListFX(params)
        return params
    }

    /**
     * @param params
     */
    private reloadQuantityObject(params: ParamsFX): void {
        let item: ObjectDatabase|undefined = this.user.inventory.getObject(params.data[1])
        if (params.id === 4) {
            item = this.user.inventory.getObject(params.memory)
        }
        if (item && params.launchedAt !== undefined) {
            const currentTimeSeconds: number = Math.floor(Date.now() / 1000)
            if (params.launchedAt < currentTimeSeconds) {
                item.quantity -= Math.max(0, Math.floor(currentTimeSeconds - params.launchedAt))
                this.user.inventory.reloadObject(item, {
                    isCanInsert: false
                })
            }
        }
    }

    /**
     * @param params
     */
    addListFX(params: ParamsFX): void {
        this.listFX.push(params)
    }

    /**
     * @param params
     */
    removeListFX(params: ParamsFX): void {
        this.listFX = this.getListFX().filter((FX: ParamsFX) => !(params.id == FX.id && FX.sid == params.sid))
    }

    /**
     * @returns Array<ParamFX>
     */
    getListFX(): Array<ParamsFX> {
        return this.listFX
    }
}

export default UserFX