import User from "./User"
import { Packet } from "../../interfaces/blablaland"
import SocketMessage from "./network/SocketMessage"
import GlobalProperties from "./network/GlobalProperties"
import Maps from "../../json/maps.json"

class Interface {

    user: User
    intervalStepFlood: any = undefined
    nbStepFlood: number = 0

    constructor(user: User) {
        this.user = user
    }

    /**
     * user addUserMessage
     * @param {string} text
     * @param options
     */
    addUserMessage(text: string, options?: {isHtml?: boolean, isModo?: boolean, userPID?: number, userId?: number, userPseudo? :string}): void {
        const packetSender: Packet = {
            type: 1,
            subType: 5
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteBoolean(options?.isHtml ?? false)
        socketMessage.bitWriteBoolean(options?.isModo ?? false)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, options?.userPID ?? this.user.pid)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, options?.userId ?? this.user.id)
        socketMessage.bitWriteString(options?.userPseudo ?? this.user.pseudo)
        socketMessage.bitWriteString(text)
        this.user.socketManager.send(socketMessage)
    }

    /**
     * @param text
     * @param options
     */
    addInfoMessage(text: string, options?: {isMap?: boolean, isHtml?: boolean, isWarning?: boolean, except?: User}): void {
        const packetSender: Packet = {
            type: 5,
            subType: 11
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, this.user.mapId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, this.user.serverId)
        socketMessage.bitWriteBoolean(options?.isHtml ?? false)
        socketMessage.bitWriteBoolean(options?.isWarning ?? false)
        socketMessage.bitWriteString(text)
        if (options?.isMap) {
            this.user.socketManager.sendAll(socketMessage, options.except ?? undefined)
        } else {
            this.user.socketManager.send(socketMessage)
        }
    }

    /**
     * @param text
     * @param options
     */
    addLocalMessage(text: string, options? : {mapId?: number, serverId?: number, isHtml?: boolean, isModo?: boolean, userPID?: number, userId?: number, userPseudo? :string, action?: number, isMap: boolean}): void {
        const packetSender: Packet = {
            type: 5,
            subType: 7
        }
        const mapFound = Maps.find(m => m.id == this.user.mapId)
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, options?.mapId ?? this.user.mapId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, options?.serverId ?? this.user.serverId)
        socketMessage.bitWriteBoolean(options?.isHtml ?? false)
        socketMessage.bitWriteBoolean(options?.isModo ?? false)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, options?.userPID ?? this.user.pid)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, options?.userId ?? this.user.id)
        socketMessage.bitWriteUnsignedInt(3, this.user.gender)
        socketMessage.bitWriteString(options?.userPseudo ?? this.user.pseudo)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, this.user.serverId)
        socketMessage.bitWriteString(text)
        socketMessage.bitWriteUnsignedInt(3, options?.action ?? 0)
        if (mapFound && mapFound.individual) {
            this.user.socketManager.send(socketMessage)
        } else if (options?.isMap) {
            this.user.socketManager.sendAll(socketMessage)
        } else {
            this.user.socketManager.send(socketMessage)
        }
    }

    /**
     * Flood
     */
    onFlood(): void {
        this.intervalStepFlood = setTimeout((): void => {
            this.nbStepFlood--
        } , 2000)
        switch (++this.nbStepFlood) {
            case 4:
                this.addUserMessage(`Merci de ne pas flooder (messages à répétition).`, {
                    userPseudo: `GRAND SAGE`,
                    userId: 0,
                    isModo: true
                })
                break
            case 8:
                this.addUserMessage(`Vous êtes puni quelques secondes pour avoir floodé.`, {
                    userPseudo: `GRAND SAGE`,
                    userId: 0,
                    isModo: true
                })
                this.user.userFX.writeChange({
                    id: 2,
                    duration: 10
                })
                setTimeout(() => {
                    this.nbStepFlood = 0
                    this.addUserMessage(`Fin de la punition.`, {
                        userPseudo: `GRAND SAGE`,
                        userId: 0, isModo: true
                    })
                }, 10000)
                clearInterval(this.nbStepFlood)
                break
            default:
                break
        }
    }

    /**
     * @param userModerator
     */
    removeConsoleUserChat(userModerator: User): void {
        const packetSender: Packet = {
            type: 1,
            subType: 14
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, userModerator.id)
        this.user.socketManager.send(socketMessage)
    }
}

export default Interface