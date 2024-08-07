
import SocketManager from "../network/SocketManager"
import UserFX from "./FX/UserFX"
import Walker from "./Walker"
import Transform from "./Transform"
import Interface from "./Interface"
import SocketMessage from "./network/SocketMessage"
import { ClientBytes, Enemy, Friend, MiniMonster, Packet, ParamsFX } from "../../interfaces/blablaland"
import ServerManager from "../manager/ServerManager"
import Camera from "./Camera"
import Tracker from "./tracker/Tracker"
import GlobalProperties from "./network/GlobalProperties"
import Inventory from "./Inventory"
import { MessageBuilder, Webhook } from "discord-webhook-node"
import Dungeon from "./games/Dungeon/Dungeon"

class User {

    id: number = 0 // id in database
    pid: number = 0
    username: string = '' // username
    pseudo: string = '' // pseudo
    IP: number = 0 // IP Address
    skinId: number = 7 // skin in game
    skinColor: Array<number> = [19, 0, 88, 44, 44, 58, 0, 0, 0, 0]
    gender: number = 0 // sex
    grade: number = 0 // grade (admin, moderator ..)
    experience: number = 0 // experience in game
    experienceDaily: number = 0
    experienceBan: number = 0
    rewarded_at: number|undefined = undefined
    spooky_at: number|undefined = undefined
    chatColor: string = '0129402a0a20333334' // chatColor
    mapId: number = 9 // id map
    serverId: number = 0
    mapPearl: number = 9 // map pearl mini game
    wedding_id: number = 0
    inConsole: boolean = false
    isTouriste: boolean = true
    nbAFK: number = 0

    clientBytes: ClientBytes
    isGameUnmodified: boolean = false

    secretChat: number = 0 // moderator secret chat
    secretTracker: number = 0 // moderator secret tracker

    intervalExperience: any = undefined
    intervalDodo: any = undefined

    objectCooldown: number = Date.now()
    connectedAt: number = Date.now()
    time: number = 0

    socketManager: SocketManager
    serverManager: ServerManager
    interface: Interface
    inventory: Inventory
    tracker: Tracker
    walker: Walker
    userFX: UserFX
    transform: Transform

    private readonly listPackSmiley: Array<number>
    private listFriend: Array<Friend>
    private listEnemy: Array<Enemy>
    private listMiniMonster: Array<MiniMonster>

    constructor(socketManager: SocketManager, serverManager: ServerManager) {
        this.socketManager = socketManager
        this.serverManager = serverManager
        this.interface = new Interface(this)
        this.inventory = new Inventory(this)
        this.tracker = new Tracker(this)
        this.walker = new Walker(this)
        this.userFX = new UserFX(this)
        this.transform = new Transform(this)
        this.listPackSmiley = []
        this.listFriend = []
        this.listEnemy = []
        this.listMiniMonster = []

        this.clientBytes = {
            id: Math.floor(Math.random() * 64),
            position: 680000,
            size: Math.floor(Math.random() * 15000),
        }
    }
    
    /**
     * @param  {number} id
     * @returns void
     */
    addListPackSmiley(id: number): void {
        this.listPackSmiley.push(id)
    }


    /**
     * @param friend
     */
    addListFriend(friend: Friend): void {
        this.listFriend.push(friend)
    }

    addListEnemy(enemy: Enemy): void {
        this.listEnemy.push(enemy)
    }

    addListMiniMonster(miniMonster: MiniMonster): MiniMonster {
        this.listMiniMonster.push(miniMonster)
        return miniMonster
    }
    
    /**
     * @returns Array
     */
    getListPackSmiley(): Array<number> {
        return this.listPackSmiley
    }


    /**
     * @returns Array
     */
    getListFriend(): Array<Friend> {
        return this.listFriend
    }

    /**
     * @returns Array
     */
    getListEnemy(): Array<Enemy> {
        return this.listEnemy
    }

    /**
     * @returns Array
     */
    getListMiniMonster(): Array<MiniMonster> {
        return this.listMiniMonster
    }

    /**
     * @returns boolean
     */
    isModerator(): boolean {
        return this.grade >= 90
    }

    /**
     * @returns boolean
     */
    isAdmin(): boolean {
        return this.grade >= 950
    }

    /**
     * @param cameraId
     */
    getCamera(cameraId?: number): Camera|undefined {
        return this.serverManager.getListCamera().find((camera: Camera): boolean => {
           if (!cameraId) {
               return camera.user.pid == this.pid
           } else {
               return cameraId === camera.id && camera.user.pid === this.pid
           }
        })
    }


    /**
     * @param amount
     * @param isSubtraction
     */
    async updateBBL(amount: number, isSubtraction: boolean): Promise<number> {
        let newAmount: number = 0
        let user = await global.db.select('*')
            .from('players')
            .where('user_id', this.id)
            .first()
        if (user) {
            if (isSubtraction) {
                newAmount = user.blabillon - amount
            } else {
                newAmount = user.blabillon + amount
            }
            if (newAmount > 0) {
                await global.db('players')
                    .where('user_id', user.id)
                    .update({ blabillon: newAmount })
            }
        }
        this.socketManager.send(new SocketMessage({ type: 2, subType: 13 }))
        return newAmount
    }

    async disconnect(): Promise<void> {
        clearInterval(this.intervalExperience)
        clearInterval(this.intervalDodo)
        if (!this.inConsole) {
            for (let user of this.serverManager.getListUser()) {
                for (let instance of user.tracker.listInstance) {
                    if (instance.id === this.id || instance.IP === this.IP)
                        for (let item of instance.listUser) user.tracker.remove(instance, item)
                }
            }
            this.userFX.getListFX().forEach(FX => this.userFX.dispose(FX))
        } else {
            this.serverManager.removeUserConsoleByPid(this.pid)
            const packetSender: Packet = {
                type: 6,
                subType: 3
            }
            const socketMessage: SocketMessage = new SocketMessage(packetSender)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, this.pid)
            for (let user of this.serverManager.getListUserConsole()) {
                user.socketManager.send(socketMessage)
            }
            const webhook: string|undefined = process.env.WEBHOOK_CONSOLE
            if (webhook && !this.isAdmin()) {
                const sender: Webhook = new Webhook(webhook)
                const embed: MessageBuilder = new MessageBuilder()
                    .setColor(3447003)
                    .setTitle('Console')
                    .setDescription(`Déconnexion de la console`)
                    .setAuthor(`${this.username} (${this.pseudo})`)
                const connectionTimeInMinutes: number = ((Date.now() - this.connectedAt) / 1000) / 60;
                if (connectionTimeInMinutes > 60) {
                    const connectionTimeInHours: number = Math.floor(connectionTimeInMinutes / 60)
                    const remainingMinutes: number = Math.floor(connectionTimeInMinutes % 60)
                    if (remainingMinutes > 0) {
                        embed.addField(`Temps de connexion`, `${connectionTimeInHours} heure(s) et ${remainingMinutes} minute(s)`)
                    } else {
                        embed.addField(`Temps de connexion`, `${connectionTimeInHours} heure(s)`)
                    }
                } else {
                    embed.addField(`Temps de connexion`, `${Math.floor(connectionTimeInMinutes)} minute(s)`)
                }
                embed.setTimestamp()
                await sender.send(embed)
            }
        }
        const universeManager = this.socketManager.getUniverseManager()
        const map = universeManager.getMapById(this.mapId)
        map?.leave(this, 3)
        if (!this.isTouriste && !this.inConsole) {
            const listNavalBattle = this.serverManager.getNavalBattleManager().getListNavalBattleByUser(this)
            if (listNavalBattle) {
                for (let navalBattle of listNavalBattle) {
                    navalBattle.close(this, 1)
                    this.serverManager.getNavalBattleManager().removeNavalBattleByGameId(navalBattle.id)
                }
            }
            const dungeon: Dungeon|undefined = universeManager.getDungeonManager().getDungeonByUser(this)
            if (dungeon) {
                if (!dungeon.getIsLaunch()) {
                    dungeon.getOwner().socketManager.send(dungeon.onLuncherMessage(this, 3))
                }
                if (dungeon.getListUser().length === 1) {
                    universeManager.getDungeonManager().removeDungeon(dungeon)
                } else {
                    dungeon.onInteractivEvent(this)
                    dungeon.removeListUser(this)
                }
                this.mapId = 501
                this.walker.positionX = 24850
                this.walker.positionY = 22777
            }
            let house = universeManager.getHouseManager().getHouseByUser(this)
            if (house) {
                if (house.isDrive) {
                    house.drive(this, false, {
                        isTeleport: false
                    })
                }
            }
            if (map?.isHouse() || house?.user.id === this.id) {
                if (!house) {
                    house = universeManager.getHouseManager().getHouseById(map?.id)
                }
                if (house) {
                    house.leave(this, 3, {
                        isTeleport: false
                    })
                    this.mapId = house.mapId
                    this.walker.positionX = house.positionX
                    this.walker.positionY = house.positionY
                } else this.mapId = 9
            } else if (map?.isDungeon()) {
                this.mapId = 501
            } else if (map?.isPyramid()) {
                this.mapId = 447
            } else if (map?.isManor()) {
                this.mapId = 490
            }
            await global.db('players')
                .where('user_id', this.id)
                .update({
                    map_id: this.mapId,
                    server_id: this.serverId,
                    positionX: this.walker.positionX,
                    positionY: this.walker.positionY,
                    direction: this.walker.direction,
                    experience: this.experience,
                    experience_daily: global.db.raw('experience_daily + ?',[this.experienceDaily]),
                    online: 0
                })
            const listIdentifier: string[] = [`CLOUD_${this.id}_`, `SCENE_${this.id}_`, `ASTRALBODY_${this.id}_`, `TOMB_${this.id}_`]
            listIdentifier.forEach((identifier: string) => this.disposeMapFX(5, identifier))
        }
        this.serverManager.removeCameraUser(this)
        this.serverManager.removeUserByPid(this.pid)
    }

    /**
     * setIntervalDodo
     */
    setIntervalDodo(): void {
        switch (++this.nbAFK) {
            case 4: // 3*30 => 2min
                this.walker.setDodo(true)
                break
            case 30: // 30x30 => 15min
                this.socketManager.close(`Vous avez été déconnecté pour inactivité :/`)
                break
        }
    }

    /**
     * @param isSenderPlayer
     */
    clearIntervalDodo(isSenderPlayer: boolean): void {
        if (!isSenderPlayer) return
        this.nbAFK = 0
        this.walker.setDodo(false)
        if (this.intervalDodo) clearInterval(this.intervalDodo)
        this.intervalDodo = setInterval(() => this.setIntervalDodo(), 30000)
    }

    /**
     * setIntervalExperience
     */
    setIntervalExperience(): void {
        let isUpdate: boolean = false
        if (!this.walker.isDodo && !this.inConsole) {
            const packetSender: Packet = {
                type: 2,
                subType: 11
            }
            const socketMessage: SocketMessage = new SocketMessage(packetSender)
            socketMessage.bitWriteUnsignedInt(32, ++this.experience)
            this.socketManager.send(socketMessage)
            ++this.experienceDaily
            isUpdate = this.experience % 5 === 0

            if (this.experienceBan <= this.experience && this.mapId === 10) {
                this.getCamera()?.gotoMap(9, { method: 6 })
                isUpdate = true
            }
            if (isUpdate) {
                global.db('players').where('user_id', this.id)
                    .update({
                        experience: this.experience,
                        experience_daily: global.db.raw('experience_daily + ?',[this.experienceDaily]),
                    })
                    .then((r: number): void => {
                        this.experienceDaily = 0
                    })
            }
        }
    }

    /**
     * @param id
     * @param identifier
     */
    hasFX(id: number, identifier: string): ParamsFX|undefined {
        const search: string = `${id}_${identifier}`
        return this.userFX.getListFX()
            .find((FX: ParamsFX): boolean => FX.identifier === search)
    }

    /**
     * @param name
     */
    hasRight(name: string): boolean {
        let isRight: boolean = false
        let right = this.serverManager.getRightByName(name)
        if (right && right.gradeId <= this.grade) {
            isRight = true
        }
        return isRight
    }

    /**
     *
     * @param userId
     */
    hasEnemy(userId: number): boolean {
        return !!this.getListEnemy().find((e: Enemy): boolean => e.userId == userId)
    }

    /**
     * @param id
     * @param identifier
     */
    disposeMapFX(id: number, identifier: string) {
        const FX = this.serverManager.hasFX(id, identifier)
        if (FX && FX.item) FX.map.mapFX.dispose(this, FX.item)
    }

    removeListFriend(userId: number): void {
        this.listFriend = this.getListFriend().filter((friend: Friend) => friend.userId !== userId)
    }

    removeListEnemy(enemy: Enemy): void {
        this.listEnemy = this.getListEnemy().filter((e: Enemy): boolean => e.userId !== enemy.userId)
    }

    /**
     * @param miniMonster
     */
    removeListMonster(miniMonster: MiniMonster): void {
        this.listMiniMonster = this.getListMiniMonster().filter(item => item.id !== miniMonster.id)
    }
}

export default User