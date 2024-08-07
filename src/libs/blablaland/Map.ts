import GlobalProperties from "../blablaland/network/GlobalProperties"
import {Packet, ParamsFX} from "../../interfaces/blablaland"
import SocketMessage from "./network/SocketMessage"
import User from "./User"
import MapFX from "./FX/MapFX"
import Maps from "../../json/maps.json"

class Map {

    id: number
    fileId: number

    mapFX: MapFX

    private listUser: Array<User>

    protected: number|undefined
    isMessageAllowed: boolean
    isObjectAllowed: boolean
    bypassAllowed: Array<number>

    private listPyramid: number[] = [448, 449, 450, 451, 452, 453, 454, 455, 456]
    private listManor: number[] = [491, 492, 493, 494, 495, 496]

    constructor(id: number, fileId?: number) {
        this.id = id
        this.fileId = fileId ?? id
        this.mapFX = new MapFX(this)
        this.listUser = new Array<User>()
        this.isMessageAllowed = true
        this.isObjectAllowed = true
        this.bypassAllowed = new Array<number>()
    }

    /**
     * User enter in map
     * @param user
     * @param options
     */
    enter(user: User, options?: {method?: number, individual?: number}): void {
        if (!this.hasUser(user) && !user.inConsole) {
            this.addListUser(user)

            if (!options?.individual) {
                const packet: Packet = {
                    type: 5,
                    subType: 1
                }
                const socketMessage: SocketMessage = new SocketMessage(packet)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, this.id)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, user.serverId)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, user.pid)
                socketMessage.bitWriteString(user.pseudo)
                socketMessage.bitWriteUnsignedInt(3, user.gender)
                socketMessage.bitWriteUnsignedInt(32, Math.floor(Date.now() / 1000))
                user.walker.writeStateToMessage(socketMessage, true, true)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_METHODE_ID, options?.method ?? 0)
                user.socketManager.sendAll(socketMessage, undefined, this.id)
            }
        }
    }

    /**
     * User leave map
     * @param  {User} user
     * @param method
     * @returns void
     */
    leave(user: User, method?: number): void {
        if (!user.inConsole) {
            this.removeListUser(user)

            const packet: Packet = {
                type: 5,
                subType: 2
            }
            const socketMessage: SocketMessage = new SocketMessage(packet)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, this.id)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, user.serverId)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, user.pid)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_METHODE_ID, method ?? 0)
            user.socketManager.sendAll(socketMessage, undefined, this.id)
        }
    }

    /**
     * I add the user in the map if he is not already there
     * (a console camera can be on several maps)
     * @param user
     */
    addListUser(user: User): void {
        for (let item of this.listUser) {
            if (item.pid == user.pid)
                return
        }
        this.listUser.push(user)
    }

    /**
     * @param user
     */
    removeListUser(user: User): void {
        this.listUser = this.listUser.filter(u => u.pid !== user.pid)
    }

    /**
     * @returns Array
     */
    getListUser(): Array<User> {
        return this.listUser
    }

    /**
     * @param user
     */
	hasUser(user: User) {
        return this.getListUser().find(u => u.pid === user.pid)
    }
	
	 /**
     * @param id
     * @param identifier
     * @param options
     */
    hasFX(id: number, identifier: string, options?: {isSearchStrict?: boolean}): ParamsFX|undefined {
         const search: string = `${id}_${identifier}`
        return this.mapFX.getListFX()
            .find((FX: ParamsFX): boolean|undefined => options?.isSearchStrict ? FX.identifier === search : FX.identifier?.includes(search))
    }

    isHouse(): boolean {
        return [457, 458, 459, 470, 472, 473, 497, 503, 504, 505, 506, 507, 518, 537, 538, 539].includes(this.fileId)
    }

    isGame(): boolean {
        return this.isPyramid() || this.isManor() || this.isDungeon()
    }

    isDungeon(): boolean {
        return this.fileId == 499
    }

    isPyramid(): boolean {
        return this.listPyramid.includes(this.id)
    }

    isManor(): boolean {
        return this.listManor.includes(this.id)
    }

    isParadis(): boolean {
        return !!Maps.find((m): boolean => m.paradisId === this.id)
    }

    isSpecial(): boolean {
        return this.isHouse() || this.isGame() || [10, 60, 340, 342, 344, 355].includes(this.id)
    }

    isProtected(): number {
        const map = Maps.find((m): boolean => m.id === this.id)
        return (map?.protected || this.protected) ?? 0
    }

    /**
     * @param user
     */
    getPercentageOfFriends(user: User): number {
        const userList: User[] = this.getListUser()
        const totalUsers: number = userList.length - 1

        if (totalUsers === 0) {
            return 0
        }

        const friendIds: number[] = user.getListFriend()
            .map(friend => friend.userId)
        const totalFriends: number = userList.filter((item: User) => friendIds.includes(item.id)).length
        const percentage: number = (totalFriends / totalUsers) * 100

        return Math.floor(percentage)
    }
}

export default Map