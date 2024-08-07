import Universe from "../network/Universe"
import User from "../blablaland/User"
import Camera from "../blablaland/Camera"
import SocketMessage from "../blablaland/network/SocketMessage"
import { BadWordDefinition, MapDefinition, Packet, ParamsFX, Right } from "../../interfaces/blablaland"
import { BadWordDatabase } from "../../interfaces/database"
import NavalBattleManager from "./NavalBattleManager"
import Maps from "../../json/maps.json"

class ServerManager {

    private readonly listUniverse: Array<Universe>
    private listCamera: Array<Camera>
    private listUser: Array<User>
    private listUserConsole: Array<User>
    private listBadWord: Array<BadWordDefinition>
    private listRights: Array<Right>
    private readonly navalBattleManager: NavalBattleManager
    private nextIrwish: number

    countPID: number
    irwishScene: number

    constructor() {
        this.listUniverse = new Array<Universe>()
        this.listCamera = new Array<Camera>()
        this.listUser = new Array<User>()
        this.listUserConsole = new Array<User>()
        this.listBadWord = new Array<BadWordDefinition>()
        this.listRights = new Array<Right>()
        this.navalBattleManager = new NavalBattleManager()
        this.countPID = 0

        this.irwishScene = 0
        this.nextIrwish = +new Date
        this.updateListBadWord().then()
        this.updateListRight().then()


        setInterval( this.loop.bind(this), 1000)
        setInterval(this.sendFuryPowa.bind(this), 1000 * 20)
        setInterval((): void => {
            this.sendGift(0)
            this.sendGift(1)
        }, 100000)
    }

    /**
     * @param  {Universe} universe
     * @returns void
     */
    push(universe: Universe): void {
        this.listUniverse.push(universe)
        universe.launch()
    }

    /**
     * @param  {Camera} camera
     * @returns void
     */
    addListCamera(camera: Camera): void {
        this.listCamera.push(camera)
    }
    
    /**
     * @returns Array
     */
    getListUniverse(): Array<Universe> {
        return this.listUniverse
    }

    /**
     * @param user
     */
    addListUser(user: User): void {
        this.listUser.push(user)
    }

    /**
     * @param user
     */
    addListUserConsole(user: User): void {
        this.listUserConsole.push(user)
    }

    /**
     * @param badWord
     */
    addListBadWord(badWord: BadWordDefinition): void {
        this.listBadWord.push(badWord)
    }

    /**
     * @param right
     */
    addListRight(right: Right): void {
        this.listRights.push(right)
    }

    /**
     * @returns Array
     */
    getListCamera(): Array<Camera> {
        return this.listCamera
    }

    /**
     * getListUser
     */
    getListUser(): Array<User> {
        return this.listUser
    }

    /**
     * getListUser
     */
    getListUserConsole(): Array<User> {
        return this.listUserConsole
    }

    /**
     * getListBadWord
     */
    getListBadWord(): Array<BadWordDefinition> {
       return this.listBadWord
    }

    /**
     * getListRight
     */
    getListRight(): Array<Right> {
        return this.listRights
    }

    /**
     * getNavalBattleManager
     */
    getNavalBattleManager(): NavalBattleManager {
        return this.navalBattleManager
    }
    
    /**
     * @param  {number} id
     * @returns Universe
     */
    getUniverseById(id: number): Universe|undefined {
        return this.listUniverse.find(universe => universe.universe.id == id)
    }

    /**
     * hasFX
     * @param id
     * @param identifier
     * @param options
     */
    hasFX(id: number, identifier: string, options?: {isSearchStrict?: boolean}) {
        for (let universe of this.getListUniverse()) {
            for (let item of universe.universeManager.getListMap()) {
                const FX: ParamsFX|undefined = item.hasFX(id, identifier, options)
                if (FX) {
                    return {
                        map: item,
                        item: item.hasFX(id, identifier)
                    }
                }
            }
        }
    }

    /**
     * @param {number} id
     * @param options
     * @returns boolean|User
     */
    getUserById(id: number, options: {inConsole: boolean}): User|undefined {
        for (let user of this.getListUser()) {
            if (user.id === id && options.inConsole == user.inConsole) {
                return user
            }
        }
    }

    /**
     * @param {number} pid
     * @returns boolean|User
     */
    getUserByPid(pid: number): User|undefined {
        for (let user of this.getListUser()) {
            if (user.pid === pid) {
                return user
            }
        }
    }

    /**
     * @param pseudo
     * @param options
     */
    getUserByPseudo(pseudo: string, options: {inConsole: boolean}): User|undefined {
        for (let user of this.getListUser()) {
            if (user.pseudo.toLowerCase() === pseudo.toLowerCase()
                && options.inConsole == user.inConsole) {
                return user
            }
        }
    }

    /**
     * @param name
     */
    getRightByName(name: string): Right|undefined {
        return this.getListRight().find((right: Right): boolean => right.name === name)
    }

    /**
     * @param user
     */
    removeCameraUser(user: User): void {
        this.listCamera = this.listCamera.filter((camera: Camera) => !(camera.user.pid === user.pid))
    }

    /**
     * @param id
     * @param user
     */
    removeCameraById(id: number, user: User): void {
        this.listCamera = this.getListCamera().filter((camera: Camera) => !(camera.id === id && camera.user.pid === user.pid))
    }

    /**
     * @param pid
     */
    removeUserByPid(pid: number): void {
        this.listUser = this.getListUser().filter((user: User) => !(user.pid == pid))
    }

    /**
     * @param pid
     */
    removeUserConsoleByPid(pid: number): void {
        this.listUserConsole = this.getListUserConsole().filter((user: User) => !(user.pid == pid))
    }

    loop() {
        if (+new Date > this.nextIrwish) {
            this.irwishScene = +new Date + 260000
            this.nextIrwish = this.irwishScene
        }
    }

    sendGift(serverId: number = 0): void {
        const filteredMaps: MapDefinition[] = Maps.filter((map) => map.giftReceiver)
        const user: User|undefined = this.getListUser().filter((user: User): boolean => user.serverId === serverId).shift()
        if (!user) return

        for (let i = 0; i < 20; i++) {
            const type: number = [1, 2, 6][Math.floor(Math.random() * 3)]
            const value: number[] = type === 6 ? [10, 25, 50] : [25, 50, 100, 200, 250, 500]
            const dateServer: number = Date.now()

            const socketMessage: SocketMessage = new SocketMessage()
            socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
            socketMessage.bitWriteUnsignedInt(10, dateServer % 1000)
            // 1: Yellow, 2: Key, 3: Fake, 5: Pink, 6: Star
            socketMessage.bitWriteUnsignedInt(8, type)

            const randomMap: MapDefinition = filteredMaps[Math.floor(Math.random() * filteredMaps.length)]
            this.getUniverseById(serverId)?.universeManager.getMapById(randomMap.id).mapFX.writeChange(user, {
                id: 5,
                identifier: `GIFT`,
                data: [7, 1, socketMessage],
                memory: [1, value[Math.floor(Math.random() * value.length)]],
                duration: 180
            })
        }
    }

    /**
     * @param serverId
     */
    sendFuryPowa(serverId: number = 2): void {
        const user: User|undefined = this.getListUser().filter((user: User): boolean => user.serverId === serverId).shift()
        if (!user) return

        for (let i = 0; i < 30; i++) {
            const randomPowa: { [key: number]: number } = { 0: 50, 1: 25, 2: 50, 3: 10, 4: 25, 5: 10, 6: 75, 7: 25, 8: 10, 9: 25, 10: 25}
            const powaId: number = Math.floor(Math.random() * 11)
            const powaValue: number = randomPowa[powaId]
            const dateServer: number = Date.now()

            const socketMessage: SocketMessage = new SocketMessage()
            socketMessage.bitWriteUnsignedInt(4, powaId)
            socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))

            const randomMap: MapDefinition = Maps[Math.floor(Math.random() * Maps.length)]
            this.getUniverseById(serverId)?.universeManager.getMapById(randomMap.id).mapFX.writeChange(user, {
                id: 5,
                data: [13, 3, socketMessage],
                memory: [powaId, powaValue],
                duration: 90,
            })
        }
    }

    /**
     * @param universeId
     */
    getUsersCount(universeId: number): SocketMessage {
        const packetSender: Packet = {
            type: 1,
            subType: 7
        }
        const countUniverse: number = this.getCountUsers(universeId)
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(16, countUniverse) // countUniverse
        socketMessage.bitWriteUnsignedInt(16, this.getListUser().filter(user => !user.inConsole).length) // countGlobal
        this.getListUniverse().forEach(universe => {
            let countUsers: number = 0
            if (universeId !== universe.universeManager.getServerId()) {
                countUsers = this.getCountUsers(universe.universeManager.getServerId())
            } else countUsers = countUniverse
            socketMessage.bitWriteUnsignedInt(16, countUsers) // countUniverse loop
        })
        return socketMessage
    }

    async updateListBadWord(): Promise<void> {
        const badWord: BadWordDatabase[] = await global.db.select('*').from('bad_words')
        if (badWord) {
            this.listBadWord = new Array<BadWordDefinition>()
            for (let item of badWord) {
                this.addListBadWord({
                    id: item.id,
                    query: item.query,
                    replace: item.replace,
                    point: item.point,
                    public: item.public,
                    private: item.private,
                    extraChar: item.extra_char,
                    censorship: item.censorship,
                    censorshipAll: item.censorship_all
                })
            }
        }
    }

    async updateListRight(): Promise<void> {
        const rights = await global.db.select('*').from('rights')
        if (rights) {
            this.listRights = new Array<Right>()
            for (let right of rights) {
                this.addListRight({
                    name: right.name,
                    gradeId: right.grade_id
                })
            }
        }
    }

    /**
     * @param universeId
     */
    getCountUsers(universeId: number): number {
        return this.getListUser().filter((user: User) => user.serverId == universeId && !user.inConsole).length
    }
}

export default ServerManager