import { Packet, ParamsFX } from "../../../interfaces/blablaland"
import SocketMessage from "../network/SocketMessage"
import GlobalProperties from "../network/GlobalProperties"
import Map from "../Map"
import User from "../User"
import Binary from "../network/Binary"

class MapFX {

    private map: Map
    private listFX: Array<ParamsFX>
    private lastSID: number

    constructor(map: Map) {
        this.map = map
        this.listFX = new Array<ParamsFX>()
        this.lastSID = 0
    }

    /**
     * @param user
     * @param params
     */
    writeChange(user: User, params: ParamsFX): ParamsFX {
        params = this.parseParams(params)

        if (typeof params.id === 'undefined') {
            throw new Error(`ParamsFX is undefined`)
        }

        const packetSender: Packet = {
            type: 5,
            subType: 10
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, this.map.id)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, user.socketManager.getUniverseManager().getServerId())
        socketMessage.bitWriteBoolean(params.isActive!)

        if (!params.isActive) {
            socketMessage.bitWriteUnsignedInt(2, params.close!)
        }
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_ID, params.id) // parseMessage ID
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, params.sid!)

        params.binary = this.parseMessage(user, params)
        socketMessage.bitWriteBinaryData(params.binary)

        if (params.isMap) {
            user.socketManager.sendAll(socketMessage, undefined, this.map.id)
        } else {
            user.socketManager.send(socketMessage)
        }

        if (params.isActive && typeof params.duration !== "undefined") {
            setTimeout(() => params = this.dispose(user, params), params.duration*1000)
        }

        if (params.isActive && (params.isPersistant || params.duration)) {
            if (!params.identifier) {
                params.identifier = params.sid!.toString()
            } else {
                params.identifier += `_${params.sid!.toString()}`
            }
            params.identifier = `${params.id}_${params.identifier}`

            const foundIndex: number = this.getListFX().findIndex((item: ParamsFX) => params.sid === item.sid && params.id === item.id)
            if (foundIndex >= 0) {
                this.getListFX()[foundIndex] = params
            } else {
                this.addListFX(params)
            }
        }
        return params
    }


    /**
     * @param user
     * @param params
     */
    private parseMessage(user: User, params: ParamsFX): SocketMessage {
        let socketMessage: SocketMessage = new SocketMessage
        switch (params.id) {
            case 1: // UserDie
                socketMessage.bitWriteSignedInt(17, user.walker.positionX / 100)
                socketMessage.bitWriteSignedInt(17, user.walker.positionY / 100)
                socketMessage.bitWriteUnsignedInt(8, user.walker.surfaceBody)
                socketMessage.bitWriteString(user.pseudo)
                break
            case 2: // addFlyingObject
                const [FlyFxID, FlyFXoID, FlyPositionX, FlyPositionY, speedX, speedY] = params.data
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, user.pid)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_ID, FlyFxID)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_OID, FlyFXoID)
                socketMessage.bitWriteSignedInt(17, FlyPositionX)
                socketMessage.bitWriteSignedInt(17, FlyPositionY)
                socketMessage.bitWriteSignedInt(17, speedX)
                socketMessage.bitWriteSignedInt(17, speedY)
                break
            case 3: // addImpactObject
                const [sendPID, FxID, FXoID, positionX, positionY, hasImpact] = params.data
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, sendPID)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_ID, FxID)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_OID, FXoID)
                socketMessage.bitWriteSignedInt(17, user.walker.positionX / 100)
                socketMessage.bitWriteSignedInt(17, user.walker.positionY / 100)
                socketMessage.bitWriteBoolean(hasImpact)
                break
            case 4: // EarthQuake
                const [startAt, amplitude, duration]: [number, number, number] = params.data
                socketMessage.bitWriteUnsignedInt(32, startAt)
                socketMessage.bitWriteUnsignedInt(8, amplitude)
                socketMessage.bitWriteUnsignedInt(8, duration)
                break
            case 5:
                const [fxFileId, objectId, data]: [number, number, Binary] = params.data
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_ID, fxFileId)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, objectId)
                if (params.data.length > 2) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteBinaryData(data)
                } else {
                    socketMessage.bitWriteBoolean(false)
                }
                break
            case 6: // nUserFxActivity
                socketMessage = params.data
                break
            default:
                break
        }
        return socketMessage
    }

    /**
     * @param params
     */
    private parseParams(params: ParamsFX): ParamsFX {
        const defaults = {
            sid: 0,
            isActive: true,
            isPersistant: true,
            isProtected: false,
            isMap: true,
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
     * @param user
     * @param params
     */
    dispose(user: User, params: ParamsFX): ParamsFX {
        params.isActive = false
        this.removeListFX(params)
        this.writeChange(user, params)
        return params
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
        this.listFX = this.getListFX().filter(FX => !(params.id == FX.id && FX.sid == params.sid))
    }

    /**
     * @returns Array<ParamFX>
     */
    getListFX(): Array<ParamsFX> {
        return this.listFX
    }
}

export default MapFX