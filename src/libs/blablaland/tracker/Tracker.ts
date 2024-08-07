import User from "../User"
import { Packet } from "../../../interfaces/blablaland"
import SocketMessage from "../network/SocketMessage"
import GlobalProperties from "../network/GlobalProperties"
import SkinColor from "../SkinColor"
import TrackerInstance from "./TrackerInstance"
import TrackerUser from "./TrackerUser"

class Tracker {

    user: User
    listInstance: Array<TrackerInstance>

    constructor(user: User) {
        this.user = user
        this.listInstance = new Array<TrackerInstance>()
    }

    /**
     * @param instance
     * @param trackerUser
     * @param text
     * @param options
     */
    sendMessage(instance: TrackerInstance, trackerUser: TrackerUser, text: string, options?: {isHtmlEncode?: boolean, isModerator?: boolean}): void {
        const packetSender: Packet = {
            type: 7,
            subType: 3
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        this.header(socketMessage, instance)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, trackerUser.pid)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, trackerUser.serverId)
        socketMessage.bitWriteBoolean(options?.isHtmlEncode ?? false)
        socketMessage.bitWriteBoolean(options?.isModerator ?? false)
        socketMessage.bitWriteUnsignedInt(3, trackerUser.gender)
        socketMessage.bitWriteString(text)
        this.user.socketManager.send(socketMessage)
    }

    /**
     * @param instance
     * @param trackerUser
     * @param text
     * @param options
     */
    sendPrivateMessage(instance: TrackerInstance, trackerUser: TrackerUser, text: string, options?: {isHtmlEncode?: boolean, isModerator?: boolean, isReceived?: boolean, pseudo?: string}): void {
        const packetSender: Packet = {
            type: 7,
            subType: 5
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        this.header(socketMessage, instance)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, trackerUser.pid)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, trackerUser.serverId)
        socketMessage.bitWriteBoolean(options?.isHtmlEncode ?? false)
        socketMessage.bitWriteBoolean(options?.isModerator ?? false)
        socketMessage.bitWriteBoolean(options?.isReceived ?? false)
        socketMessage.bitWriteString(options?.pseudo ?? this.user.pseudo)
        socketMessage.bitWriteString(text)
        this.user.socketManager.send(socketMessage)
    }

    /**
     * @param instance
     * @param options
     */
    send(instance: TrackerInstance, options?: {isMessageInformed?: boolean, isMapInformed?: boolean}): void {
        const packetSender: Packet = {
            type: 7,
            subType: 4
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        this.header(socketMessage, instance)
        socketMessage.bitWriteBoolean(true)
        for (let user of instance.listUser) {
            socketMessage.bitWriteBoolean(true)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, user.pid)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, user.serverId)
            this.writeUserData(socketMessage, user,  true,  true)
        }
        this.user.socketManager.send(socketMessage)
    }

    /**
     * @param instance
     * @param trackerUser
     */
    remove(instance: TrackerInstance, trackerUser: TrackerUser): void {
        const packetSender: Packet = {
            type: 7,
            subType: 2
        }
        let socketMessage: SocketMessage = new SocketMessage(packetSender)
        this.header(socketMessage, instance)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, trackerUser.pid)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, trackerUser.serverId)
        this.user.socketManager.send(socketMessage)
    }

    /**
     * @param instance
     * @param trackerUser
     * @param options
     */
    refresh(instance: TrackerInstance, trackerUser: TrackerUser, options?: {isSendMsg?: boolean, isSendMap?: boolean, isSendIPAddress?: boolean}): void {
        const packetSender: Packet = {
            type: 7,
            subType: 1
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        this.header(socketMessage, instance)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, trackerUser.pid)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, trackerUser.serverId)
        this.writeUserData(socketMessage, trackerUser, true, true)
        this.user.socketManager.send(socketMessage)
    }

    /**
     * @param socketMessage
     * @param instance
     * @param options
     * @private
     */
    private header(socketMessage: SocketMessage, instance: TrackerInstance, options?: {IPAddress? : number}): void {
        socketMessage.bitWriteUnsignedInt(32, instance.IP) // AddIP
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, instance.id)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, instance.pid)
    }

    /**
     * @param socketMessage
     * @param trackerUser
     * @param isMessageInformed
     * @param isSendMap
     * @private
     */
    private writeUserData(socketMessage: SocketMessage, trackerUser: TrackerUser, isMessageInformed: boolean, isSendMap: boolean): void {
        if (isMessageInformed) {
            socketMessage.bitWriteBoolean(true)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, trackerUser.id)
            socketMessage.bitWriteUnsignedInt(32, trackerUser.IP) // AddIP
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_GRADE, trackerUser.grade)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SKIN_ID, trackerUser.skinId)
            socketMessage.bitWriteString(trackerUser.pseudo)
            socketMessage.bitWriteString(trackerUser.username)
            SkinColor.exportBinaryColor(socketMessage, trackerUser.skinColor)
        }
        if (isSendMap) {
            socketMessage.bitWriteBoolean(true)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, trackerUser.mapId)
        }
    }

    /**
     * @param instance
     * @param user
     */
    public getInstanceByUser(instance: TrackerInstance, user: User): TrackerUser|undefined {
        return instance.getListUser().find(item => (item.id === user.id || item.pid === user.pid) && !user.inConsole)
    }

    public getListInstance(): Array<TrackerInstance> {
        return this.listInstance
    }

    /**
     * @param user
     * @param trackerInstance
     */
    public addTrackerInstance(user: User, trackerInstance: TrackerInstance) {
        let userTracker: TrackerUser|undefined = this.getInstanceByUser(trackerInstance, user)
        if (!userTracker) {
            let trackerUser: TrackerUser = new TrackerUser(user)
            trackerInstance.listUser.push(trackerUser)
            userTracker = trackerUser
        } else {
            userTracker.update(user)
        }
        return { trackerInstance, userTracker }
    }
}

export default Tracker