import SocketMessage from "./network/SocketMessage"
import GlobalProperties from "./network/GlobalProperties"
import SkinColor from "./SkinColor"
import User from "./User"
import { Authorized, Packet, ParamsFX } from "../../interfaces/blablaland"
import UniverseManager from "../manager/UniverseManager"
import Houses from "../../json/houses.json"
import ServerManager from "../manager/ServerManager"
import Binary from "./network/Binary"
import Objects from "../../json/objects.json"

class House {

    id: number
    objectId: number

    mapId: number
    maps: number[] = []
    positionX: number
    positionY: number

    user: User
    private universeManager: UniverseManager

    private listUser: Array<User>
    private listAuthorized: Array<Authorized>
    private listTimer: Array<number>
    private binary: SocketMessage|Binary

    private protectMode: number
    private ringMode: number
    private readonly nbSlot: number = 0
    isDrive: boolean

    timeoutClose: ReturnType<typeof setTimeout>|undefined

    /**
     * @param id
     * @param objectId
     * @param user
     * @param universeManager
     */
    constructor(id: number, objectId: number, user: User, universeManager: UniverseManager) {
        this.id = id
        this.objectId = objectId
        this.mapId = user.mapId

        this.positionX = user.walker.positionX
        this.positionY = user.walker.positionY

        this.user = user
        this.universeManager = universeManager

        this.listUser = new Array<User>()
        this.listAuthorized = new Array<Authorized>()
        this.listTimer = new Array<number>()
        this.binary = new SocketMessage

        this.protectMode = 0
        this.ringMode = 0
        this.nbSlot = 0
        this.isDrive = false

        this.timeoutClose = undefined

        const house = Houses.find(house => house.id == this.objectId)
        if (!house) return
        this.nbSlot = house.slots
        for (let i = 0; i < house.maps.length; i++) {
            const map = this.universeManager.getMapById( universeManager.getLastPrivateMapId() + 1, house.maps[i], true)
            this.maps.push(map.id)
            this.decorations(map.id, house.maps[i]).then()
        }
        this.universeManager.getHouseManager().setLastHouseId()
    }

    /**
     * Create
     */
    create(): void {
        const socketMessage: SocketMessage = new SocketMessage
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, this.maps[0])
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, this.user.id)
        socketMessage.bitWriteBoolean(false)
        SkinColor.exportBinaryColor(socketMessage, this.user.skinColor)
        socketMessage.bitWriteSignedInt(17, this.user.walker.positionX / 100)
        socketMessage.bitWriteSignedInt(17, this.user.walker.positionY / 100)
        socketMessage.bitWriteUnsignedInt(8, this.user.walker.surfaceBody)
        socketMessage.bitWriteString(this.user.pseudo)
        this.binary = new Binary()

        this.universeManager.getMapById(this.user.mapId).mapFX.writeChange(this.user, {
            id: 5,
            identifier: `HOUSE_${this.user.id}`,
            data: [33, this.objectId, socketMessage]
        })
       this.join(this.user)
    }

    /**
     * @param user
     * @param options
     */
    active(user: User, options?: {mapId?: number, isActive?: boolean, isDispose?: boolean}): void {
        const socketMessage: SocketMessage = new SocketMessage()
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, this.maps[0])
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, this.user.id)
        socketMessage.bitWriteBoolean(this.isDrive)
        SkinColor.exportBinaryColor(socketMessage, user.skinColor)
        socketMessage.bitWriteSignedInt(17, user.walker.positionX / 100)
        socketMessage.bitWriteSignedInt(17, user.walker.positionY / 100)
        socketMessage.bitWriteUnsignedInt(8, user.walker.surfaceBody)
        socketMessage.bitWriteString(user.pseudo)

        if (options?.mapId) {
            this.mapId = options?.mapId
            this.positionX = user.walker.positionX
            this.positionY = user.walker.positionY
        }

        const FX: ParamsFX|undefined = this.universeManager.getMapById(this.mapId).hasFX(5, `HOUSE_${this.user.id}_`)
        this.universeManager.getMapById(this.mapId).mapFX.writeChange(user, {
            id: 5,
            sid: FX?.sid ?? 0,
            isActive: options?.isActive ?? true,
            identifier: `HOUSE_${this.user.id}`,
            data: [33, this.objectId, socketMessage],
        })

        if (FX && options?.isDispose) {
          this.universeManager.getMapById(this.mapId).mapFX.dispose(this.user, FX)
        }
    }

    /**
     * @param user
     */
    init(user: User): void {
        for (let item of this.universeManager.getMapById(this.mapId).getListUser()) {
            const authorizedFound: Authorized|undefined = this.getAuthorizedByUser(item)
            const socketMessage: SocketMessage = this.header({
                isSendMap: true
            })
            this.channelMessageEvent(1, socketMessage, item, {
                accept: !!authorizedFound || item.isAdmin(),
                timeAccept: item.isAdmin() ? Math.floor((Date.now() / 1000) + 999999) : undefined
            })
            item.socketManager.send(socketMessage)
        }
    }

    /**
     * @param user
     * @param channelId
     * @param mapId
     */
    ready(user: User, channelId: number, mapId: number): void {
        const house = Houses.find(house => house.id == this.objectId)

        let socketMessage: SocketMessage = this.header({
            channelId: channelId,
            isSendMap: true
        })
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, this.user.id)
        socketMessage.bitWriteUnsignedInt(3, this.protectMode)
        socketMessage.bitWriteUnsignedInt(3, this.ringMode)
        socketMessage.bitWriteBinaryData(this.binary)
        socketMessage.bitWriteString(this.user.pseudo)
        socketMessage.bitWriteUnsignedInt(32, 0)
        socketMessage.bitWriteUnsignedInt(8, house?.maps.length ?? 0)
        user.socketManager.send(socketMessage)

        socketMessage = this.header()
        this.channelMessageEvent(0, socketMessage, user)
        this.user.socketManager.send(socketMessage)

        for (let item of this.universeManager.getMapById(this.mapId).getListUser()) {
            let authorizedFound: Authorized|undefined = this.getAuthorizedByUser(item)
            socketMessage = this.header({
                isSendMap: true
            })
            this.channelMessageEvent(1, socketMessage, item, {
                accept: !!authorizedFound || item.isAdmin(),
                timeAccept: item.isAdmin() ? Math.floor((Date.now() / 1000) + 999999) : undefined
            })
            item.socketManager.send(socketMessage)
        }
    }

    /**
     * @param user
     * @param socketMessage
     * @param type
     * @param serverManager
     */
    params(user: User, socketMessage: SocketMessage, type: number, serverManager: ServerManager): void {
        let userPID: number|undefined
        let userId: number|undefined
        let userFound: User|undefined
        switch (type) {
            case 0: // Accept user
                userPID = socketMessage.bitReadUnsignedInt(GlobalProperties.BIT_USER_PID)
                userId = socketMessage.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
                userFound = serverManager.getUserByPid(userPID)
                if (!userFound) {
                    userFound = serverManager.getUserById(userId, { inConsole: false })
                }
                if (userFound) {
                    if (!this.getAuthorizedByUser(userFound)) {
                        socketMessage = this.header({
                            isSendMap: true
                        })
                        this.channelMessageEvent(1, socketMessage, userFound, {
                            accept: true
                        })
                        user.interface.addInfoMessage(`${userFound.pseudo} est autorisé à rentrer.`)
                        userFound.interface.addInfoMessage(`Tu es autorisé a rentrer dans la maison de ${this.user.pseudo}.`)
                        userFound.socketManager.send(socketMessage)
                        this.addListAuthorized({ user: userFound })
                    }
                }
                break
            case 1: // Settings
                this.ringMode = socketMessage.bitReadUnsignedInt(3)
                this.protectMode = socketMessage.bitReadUnsignedInt(3)
                socketMessage = this.header()
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, this.maps[0])
                this.channelMessageEvent(1, socketMessage, user)
                for (let user of this.universeManager.getMapById(this.mapId).getListUser()) {
                    user.socketManager.send(socketMessage)
                }
                for (let map of this.maps) {
                    this.universeManager.getMapById(map).protected = this.protectMode
                }
                break
            case 2: // Kick User
                userId = socketMessage.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
                userPID = socketMessage.bitReadUnsignedInt(GlobalProperties.BIT_USER_PID)
                const pseudo: string = socketMessage.bitReadString()
                userFound = serverManager.getUserByPid(userPID)
                if (!userFound) {
                    userFound = serverManager.getUserById(userId, { inConsole: false })
                } if (!userFound) {
                    userFound = serverManager.getUserByPseudo(pseudo, { inConsole: false })
                }
                if (userFound && this.getListUser().find((user: User): boolean => user.id === userFound?.id)) {
                    this.leave(userFound, 4, {
                        isTeleport: true
                    })
                    userFound.interface.addInfoMessage(`Tu as été expulsé de la maison de ${this.user.pseudo}.`)
                }
                break
            case 3: // List users
                if (socketMessage.bitReadBoolean()) {
                    const channelId: number = socketMessage.bitReadUnsignedInt(GlobalProperties.BIT_CHANNEL_ID)
                    socketMessage = this.header({
                        channelId: channelId
                    })
                    this.channelMessageEvent(0, socketMessage, user)
                    user.socketManager.send(socketMessage)
                }
                break
            case 4: // Drive
                if (this.user.id != user.id) return
                this.drive(user, socketMessage.bitReadBoolean(), {
                    isTeleport: true
                })
                break
            case 5: // Intercom
                const text: string = socketMessage.bitReadString()
                for (let item of this.getListUser()) {
                    item.interface.addLocalMessage(text, {
                        isMap: false,
                        userPseudo: user.pseudo,
                        userPID: user.pid
                    })
                }
                break
            case 6: // Close
                this.close()
                break
            default:
                console.log(`House params ${type} not supported`)
                break
        }
    }

    /**
     * @param user
     * @param options
     */
    join(user: User, options?: {positionX?: number, positionY?: number}): void {
        if (user.id !== this.user.id) this.addListUser(user)
        let socketMessage: SocketMessage = this.header({
            isSendMap: true
        })
        this.channelMessageEvent(2, socketMessage, user)

        for (let user of this.universeManager.getMapById(this.maps[0]).getListUser()) {
            user.socketManager.send(socketMessage)
        }

        const house = Houses.find(house => house.id == this.objectId)
        if (house) {
            user.getCamera()?.gotoMap(this.maps[0], {
                mapFileId: house.maps[0],
                positionX: options?.positionX ?? house.positionX * 100,
                positionY: options?.positionY ?? house.positionY * 100,
                method: 1
            })
        }

        socketMessage = this.header({
            isSendMap: true
        })
        this.channelMessageEvent(1, socketMessage, user)

        for (let user of this.getListUser()) {
            let socketMessage = this.header({
                isSendMap: true
            })
            this.channelMessageEvent(2, socketMessage, user)
            socketMessage.bitWriteUnsignedInt(32, 0)
            user.socketManager.send(socketMessage)
        }
    }

    /**
     *
     * @param user
     * @param method
     * @param options
     */
    leave(user: User, method?: number, options?: {isTeleport?: boolean}): void {
        const dateServer: number = Date.now()
        if (user.id == this.user.id) {
            this.user = user
            let socketMessage: SocketMessage = this.header({
                isSendMap: true
            })
            this.channelMessageEvent(6, socketMessage, user, {
                isDispose: false,
                timeAccept: Math.floor((Date.now() / 1000) + 15)
            })
            user.socketManager.send(socketMessage)
            socketMessage = this.header({
                isSendMap: true
            })
            socketMessage = this.channelMessageEvent(2, socketMessage, user)
            socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer + 10000 / 1000))
            for (let item of this.universeManager.getMapById(this.mapId).getListUser()) {
                item.socketManager.send(socketMessage)
            }
            this.timeoutClose = setTimeout((): void => {
                if (this.timeoutClose) {
                    this.close({
                        method: 4
                    })
                }
            }, 15000)
        } else {
            this.removeListUser(user)
        }

        if (options?.isTeleport) {
            const mapId: number = this.isDrive ? this.user.mapId : this.mapId
            const positionX: number = this.isDrive ? this.user.walker.positionX : this.positionX
            const positionY: number = this.isDrive ? this.user.walker.positionY : this.positionY
            user.getCamera()?.gotoMap(mapId, {
                method: method ?? 1,
                positionX: positionX,
                positionY: positionY
            })
        }

        let socketMessage: SocketMessage = this.header({
            isSendMap: true
        })
        socketMessage = this.channelMessageEvent(2, socketMessage, user)

        for (let item of this.universeManager.getMapById(this.mapId).getListUser()) {
            item.socketManager.send(socketMessage)
            const authorizedFound: Authorized|undefined = this.getAuthorizedByUser(item)
            socketMessage = this.header({
                isSendMap: true
            })
            this.channelMessageEvent(1, socketMessage, item, {
                accept: !!authorizedFound || item.isAdmin()
            })
            item.socketManager.send(socketMessage)
        }
    }

    /**
     * @param user
     */
    enter(user: User): void {
        if (user.id === this.user.id) {
            this.user = user
            clearTimeout(this.timeoutClose)
            this.timeoutClose = undefined
        }
        if (user.id === this.user.id || (this.getAuthorizedByUser(user)
            && this.getListUser().length < this.nbSlot) || user.isAdmin()) {
            return this.join(user)
        } else if (!this.getAuthorizedByUser(user)
            && !this.getListTimerByUser(user)) {
            const socketMessage: SocketMessage = this.header({
                isSendMap: true
            })
            this.channelMessageEvent(3, socketMessage, user)
            this.user.socketManager.send(socketMessage)
            user.socketManager.send(socketMessage)
            this.addListTimer(user)

            setTimeout(() => {
                this.removeListTimer(user)
            }, 5000)
        }
    }

    close(options?: {method?: number}): void {
        if (this.isDrive) {
            this.drive(this.user, false, {
            isDispose: true
            })
        } else {
            const socketMessage: SocketMessage = this.header({
                isSendMap: true
            })
            this.channelMessageEvent(6, socketMessage, this.user, {
                isDispose: true
            })
            this.user.socketManager.send(socketMessage)
        }
        if (this.user.mapId >= 1000) {
            this.addListUser(this.user)
        }
        for (let user of this.getListUser()) {
            if (this.maps.includes(user.mapId)) {
                user.getCamera()?.gotoMap(this.mapId, {
                    method: options?.method ?? 0
                })
            }
        }
        this.active(this.user, {
            isActive: false,
            isDispose: true
        })
        this.universeManager.getHouseManager().removeHouseById(this.id)
    }

    /**
     * @param user
     * @param socketMessage
     * @param mapId
     * @param type
     */
    action(user: User, socketMessage: SocketMessage, mapId: number, type: number): void {
        if (type === 0) {
            this.binary = socketMessage.bitReadBinaryData()

            socketMessage = this.header({
                isSendMap: true
            })
            this.channelMessageEvent(4, socketMessage, user)
            user.socketManager.sendAll(socketMessage)
        } else if (type === 1) {
            socketMessage.bitReadBoolean()
            const isData: boolean = socketMessage.bitReadBoolean()
            const packet: SocketMessage = this.header({
                isSendMap: true
            })
            packet.bitWriteUnsignedInt(5, 5)
            packet.bitWriteBoolean(isData)

            if (isData) {
                packet.bitWriteBinaryData(socketMessage.bitReadBinaryData())
            }
            user.socketManager.sendAll(packet)
        }
    }

    /**
     * @param user
     * @param isDrive
     * @param options
     */
    drive(user: User, isDrive: boolean, options?: {isTeleport?: boolean, isDispose?: boolean, mapId?: number}): void {
        this.isDrive = isDrive
        let socketMessage: SocketMessage = this.header({
            isSendMap: true
        })
        this.channelMessageEvent(6, socketMessage, user, {
            isDispose: options?.isDispose,
            timeAccept: Math.floor((Date.now() / 1000) + 15)
        })
        user.socketManager.send(socketMessage)
        if (this.isDrive) {
            socketMessage = new SocketMessage()
            this.user.walker.writeStateToMessage(socketMessage)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, user.pid)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SKIN_ID, user.skinId)
            socketMessage.bitWriteString(user.pseudo)
            SkinColor.exportBinaryColor(socketMessage, user.skinColor)
            this.universeManager.getMapById(this.maps[0]).mapFX.writeChange(user, {
                id: 5,
                identifier: `AVATAR_DRIVE_${this.user.id}`,
                data: [33, 2, socketMessage],
                memory: [this.user.walker.positionX, this.user.walker.positionY]
            })
            user.userFX.writeChange({
                id: 4,
                sid: 72,
                data: { skinId: this.objectId == 1 ? 583 : 599 }
            })
            this.user.getCamera()?.gotoMap(this.mapId, {
                positionX: this.positionX,
                positionY: this.positionY,
                method: 1
            })
        } else {
            this.changeMap(user, options?.mapId)
            const map = this.universeManager.getMapById(this.maps[0])
            let FX: ParamsFX|undefined = this.user.hasFX(4, `72`)
            if (FX) {
                this.user.userFX.dispose(FX)
            }
            FX = map.hasFX(5, `AVATAR_DRIVE_${user.id}_`)
            if (FX) {
                this.positionX = user.walker.positionX
                this.positionY = user.walker.positionY
                map.mapFX.dispose(user, FX)
                if (options?.isTeleport) {
                    this.join(user, {
                        positionX: FX.memory[0],
                        positionY: FX.memory[1]
                    })
                } else {
                    this.leave(user, 0, {
                        isTeleport: false
                    })
                }
            }
        }
    }

    /**
     * @param user
     * @param text
     */
    intercom(user: User, text: string): void {
        if (user.id != this.user.id) {
            const socketMessage: SocketMessage = this.header({
                isSendMap: true
            })
            this.channelMessageEvent(7, socketMessage, user, {
                text: text
            })
            this.user.socketManager.send(socketMessage)
        }
    }

    /**
     *
     * @param user
     * @param mapId
     */
    changeMap(user: User, mapId?: number): void {
        if ([10, 60].includes(user.mapId) && !mapId) {
            mapId = 9
        }
        this.active(this.user, { isActive: false, isDispose: true })
        this.active(this.user, { isActive: true, mapId: mapId ?? user.mapId })
    }

    /**
     *
     * @param mapPos
     * @param mapId
     * @private
     */
    private async decorations(mapPos: number, mapId: number) {
        const decorations: Array<any> = await global.db.select('*').from('decorations')
            .where('player_id', this.user.id)
            .where('map_id', mapId)

        if (decorations) {
            for (let item of decorations) {
                const objects = Objects.find(obj => obj.id === item.power_id)
                if (objects) {
                    let socketMessage = new SocketMessage()
                    socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, this.user.id)
                    socketMessage.bitWriteSignedInt(17, item.positionX)
                    socketMessage.bitWriteSignedInt(17, item.positionY)
                    socketMessage.bitWriteUnsignedInt(8, item.surfaceBody)
                    socketMessage.bitWriteBoolean(item.direction)
                    socketMessage.bitWriteUnsignedInt(4, item.model)

                    this.universeManager.getMapById(mapPos).mapFX.writeChange(this.user, {
                        id: 5,
                        identifier: `DECORATION_${objects.id}`,
                        data: [objects.fxFileId, objects.id, socketMessage],
                    })
                }
            }
        }
    }

    /**
     * @param options
     */
    header(options?: {channelId?: number, mapId?: number; isSendMap?: boolean}): SocketMessage {
        const packetSender: Packet = {
            type: 1,
            subType: 16
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CHANNEL_ID, options?.channelId ?? 1)
        if (options?.isSendMap) {
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, options?.mapId ?? this.maps[0])
        }
        return socketMessage
    }

    /**
     * @param messageType
     * @param socketMessage
     * @param user
     * @param options
     * @private
     */
    private channelMessageEvent(messageType: number, socketMessage: SocketMessage, user: User, options?: {accept?: boolean, typeAccept?: number, timeAccept?: number, isDispose?: boolean, text?: string}): SocketMessage {
        const house = Houses.find(house => house.id == this.objectId)
        switch (messageType) {
            case 0:
                socketMessage.bitWriteUnsignedInt(5, 0)
                for (let item of this.getListUser()) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, item.id)
                    socketMessage.bitWriteString(item.username)
                }
                socketMessage.bitWriteBoolean(false)
                break
            case 1: // state
                let dateServer: number = Date.now()
                socketMessage.bitWriteUnsignedInt(5, 1)
                socketMessage.bitWriteUnsignedInt(10, this.getListUser().length)
                socketMessage.bitWriteUnsignedInt(10,  house?.slots ?? 4) // Max user
                socketMessage.bitWriteBoolean(user.id === this.user.id) // insideOwner
                socketMessage.bitWriteBoolean(this.isDrive) // drive
                socketMessage.bitWriteUnsignedInt(3, this.protectMode) // protect mode
                socketMessage.bitWriteUnsignedInt(3, this.ringMode) // ringMode
                socketMessage.bitWriteBoolean(options?.accept ?? false)
                if (options?.accept) {
                    socketMessage.bitWriteUnsignedInt(4, options.typeAccept ?? 2) // Type
                    socketMessage.bitWriteUnsignedInt(32, options.timeAccept ?? Math.floor(dateServer / 1000) + 10)
                }
                break
            case 2: // send ProtectMode && ringMode
                socketMessage.bitWriteUnsignedInt(5, 2)
                socketMessage.bitWriteUnsignedInt(3, this.protectMode) // protect mode
                socketMessage.bitWriteUnsignedInt(3, this.ringMode) // ringMode
                break
            case 3: // DingDong
                socketMessage.bitWriteUnsignedInt(5, 3)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, user.pid)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, 0)
                socketMessage.bitWriteString(user.pseudo)
                break
            case 4:
                socketMessage.bitWriteUnsignedInt(5, 4)
                socketMessage.bitWriteBinaryData(this.binary)
                break
            case 6:
                socketMessage.bitWriteUnsignedInt(5, 6)
                socketMessage.bitWriteBoolean(options?.isDispose ?? false)
                socketMessage.bitWriteBoolean(this.isDrive)
                socketMessage.bitWriteUnsignedInt(32, options?.timeAccept ??  0)
                break
            case 7: // Intercom
                socketMessage.bitWriteUnsignedInt(5, 7)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, user.pid)
                socketMessage.bitWriteString(user.pseudo)
                socketMessage.bitWriteString(options?.text ?? '')
                break
            default:
                break
        }
        return socketMessage
    }

    /**
     * get list user
     */
    getListUser(): Array<User> {
        return this.listUser
    }

    /**
     * get list authorized
     */
    getListAuthorized(): Array<Authorized> {
        return this.listAuthorized
    }

    getListTimer(): Array<number> {
        return this.listTimer
    }

    /**
     * @param user
     */
    getAuthorizedByUser(user: User): Authorized|undefined {
        return this.getListAuthorized()
            .find(authorized => authorized.user.id === user.id || authorized.user.pid == user.pid)
    }

    getListTimerByUser(user: User): number|undefined {
        return this.getListTimer().find(timer => timer === user.pid)
    }

    /**
     * Add list user
     * @param user
     */
    addListUser(user: User) {
        let listUser = this.getListUser().find(u => u.id === user.id)
        if (!listUser) {
            this.listUser.push(user)
        }
    }

    /**
     * Time ding house
     * @param user
     */
    addListTimer(user: User) {
        let listTimer = this.getListTimer().find(pid => pid === user.pid)
        if (!listTimer) {
            this.listTimer.push(user.pid)
        }
    }

    /**
     * Remove list user
     * @param user
     */
    removeListUser(user: User) {
        this.listUser = this.getListUser()
            .filter(u => !(u.id === user.id || u.pid === user.pid))
    }

    /**
     * Remove list timer
     * @param user
     */
    removeListTimer(user: User) {
        this.listTimer = this.getListTimer()
            .filter(timer => !(timer === user.pid))
    }

    /**
     * Add list autorized
     * @param authorized
     */
    addListAuthorized(authorized: Authorized): void {
        this.listAuthorized.push(authorized)
        this.removeListAuthorized(authorized)
    }

    /**
     * Remove list authorized
     * @param authorized
     */
    removeListAuthorized(authorized: Authorized) {
        authorized.timeout = setTimeout(() => {
            this.listAuthorized = this.getListAuthorized()
                    .filter(a => !(a.user.id === authorized.user.id || a.user.pid == authorized.user.pid))
            let socketMessage: SocketMessage = this.header({
                isSendMap: true
            })
            socketMessage = this.channelMessageEvent(1, socketMessage, authorized.user, {
                accept: true,
                typeAccept: 0,
                timeAccept: 0
            })
            authorized.user.socketManager.send(socketMessage)
        }, 10000)
    }
}

export default House