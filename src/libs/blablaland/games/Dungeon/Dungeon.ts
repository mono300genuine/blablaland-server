import User from "../../User"
import DungeonUser from "./DungeonUser"
import SocketMessage from "../../network/SocketMessage"
import GlobalProperties from "../../network/GlobalProperties"
import { Packet, ParamsFX } from "../../../../interfaces/blablaland"
import { ObjectDatabase } from "../../../../interfaces/database"
import StatGame, { Game } from "../StatGame"
import Winner, { Power, PowerWithKey } from "../../Winner"

interface DungeonSkin {
    maxLife: number;
    strength: number;
    agility: number;
}

class Dungeon {

    id: number
    private listUser: Array<DungeonUser>
    private isLaunch: boolean = false
    private mapLevel: number = 0
    private nextMap: number = 0

    private skins:{ [key: number]: DungeonSkin } = {
        627: {
            maxLife: 4,
            strength: 4,
            agility: 2,
        },
        628: {
            maxLife: 4,
            strength: 4,
            agility: 2,
        },
        631: {
            maxLife: 5,
            strength: 2,
            agility: 3,
        },
        632: {
            maxLife: 5,
            strength: 2,
            agility: 3,
        },
        633: {
            maxLife: 6,
            strength: 3,
            agility: 1,
        },
        634: {
            maxLife: 6,
            strength: 3,
            agility: 1,
        },
        635: {
            maxLife: 4,
            strength: 1.5,
            agility: 2
        },
        636: {
            maxLife: 5,
            strength: 3,
            agility: 1
        },
        637: {
            maxLife: 5,
            strength: 3,
            agility: 1
        },
        643: {
            maxLife: 4,
            strength: 2,
            agility: 1,
        },
        659: {
            maxLife: 4,
            strength: 2,
            agility: 3,
        },
        660: {
            maxLife: 4,
            strength: 2,
            agility: 3,
        },
    }

    constructor(id: number, user: User) {
        this.id = id

        this.listUser = new Array<DungeonUser>()
        this.addListUser(new DungeonUser(user, true))
    }

    /**
     * @param user
     * @param type
     */
    create(user: User, type: number): void {
        const socketMessage: SocketMessage = this.onLuncherMessage(user, 1, type)
        user.socketManager.send(socketMessage)
    }

    /**
     * @param user
     */
    sendInvite(user: User): void {
        const FX: ParamsFX|undefined = user.hasFX(6, `POPUP_DUNGEON`)
        if (!FX) {
            const socketMessage: SocketMessage = new SocketMessage()
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, this.getOwner().id)
            socketMessage.bitWriteString(this.getOwner().pseudo)
            socketMessage.bitWriteUnsignedInt(32, this.id)
            user.userFX.writeChange({
                id: 6,
                data: [45, 1, socketMessage],
                identifier: `POPUP_DUNGEON`,
                isPersistant: true,
                isSendOther: false,
                isMap: false
            })
            this.getOwner().socketManager.send(this.onLuncherMessage(user, 3))
            this.getOwner().socketManager.send(this.onLuncherMessage(user, 2))
        }
    }

    /**
     * @param user
     * @param socketMessage
     */
    responseInvite(user: User, socketMessage: SocketMessage): void {
        if (!this.isLaunch) {
            const isAccept: boolean = socketMessage.bitReadBoolean()
            const isMuted: boolean = socketMessage.bitReadBoolean()
            if (isAccept) {
                socketMessage = new SocketMessage()
                socketMessage.bitWriteUnsignedInt(32, this.id)
                user.userFX.writeChange({
                    id: 6,
                    data: [45, 2, socketMessage],
                    isPersistant: false,
                    isSendOther: false,
                    isMap: false
                })
                socketMessage = this.onLuncherMessage(user, 4)
                this.getOwner().socketManager.send(socketMessage)
                this.addListUser(new DungeonUser(user))
            } else {
                const FX: ParamsFX|undefined = user.hasFX(6, `POPUP_DUNGEON`)
                if (FX) user.userFX.dispose(FX)
                this.getOwner().socketManager.send(this.onLuncherMessage(user, 3))
                if (user.pid !== this.getOwner().pid) {
                    this.removeListUser(user)
                }
            }
        }
    }

    /**
     * @param user
     */
    removeInvite(user: User): void {
        const socketMessage: SocketMessage = this.onLuncherMessage(user, 3)
        this.getOwner().socketManager.send(socketMessage)
        user.socketManager.send(this.onGuestMessage(1))
        this.removeListUser(user)
    }

    /**
     * @param mapId
     */
    launch(mapId: number): void {
        this.isLaunch = true
        for (let dungeonUser of this.getListUser()) {
            const user: User = dungeonUser.getUser()
            const dungeonSkin: DungeonSkin = this.skins[user.skinId]
            user.transform.clearAll(user.transform.clearBlibli([304]))

            if (dungeonSkin) {
                dungeonUser.setLife(dungeonSkin.maxLife)
                dungeonUser.setMaxLife(dungeonUser.getLife())
                dungeonUser.setStrength(dungeonSkin.strength)
                dungeonUser.setAgility(dungeonSkin.agility)

                if ([636, 637].includes(user.skinId)) {
                    user.transform.marauder()
                }
            } else {
                if (![629, 630].includes(user.skinId)) {
                    user.transform.adventurer()
                }
            }

            user.socketManager.send(this.onGuestMessage(1))
            user.getCamera()?.gotoMap(mapId, {
                mapFileId: 499
            })
        }
    }

    /**
     * @param user
     */
    onStart(user: User): void {
        const socketMessage: SocketMessage = this.onGameMessage(user, 4)
        user.socketManager.send(socketMessage)
    }

    /**
     * @param user
     */
    leave(user: User): void {
        clearInterval(this.getUser(user).getIntervalDie())
        user.socketManager.send(this.onGameMessage(user, 15))
        user.getCamera()?.gotoMap(501)
        setTimeout(() => this.endGame(), 1000)
    }

    /**
     * @param user
     */
    onInteractivEvent(user: User): void {
        const dungeonUser: DungeonUser = this.getUser(user)

        if (!dungeonUser.getIsReady()) {
            user.socketManager.sendAll(this.onGameMessage(user, 9))
            clearInterval(dungeonUser.getIntervalDie())
            dungeonUser.setIsReady(true)

            if (this.areAllUsersReady()) {
                this.getListUser().forEach((dungeonUser: DungeonUser): void => {
                    if (!dungeonUser.getIsDead()) {
                        if (this.mapLevel !== 0 && this.mapLevel % 5 === 0) {
                            const randomPower: number = this.calculatePowerForLevel(this.mapLevel)
                            const socketMessage: SocketMessage = this.onGameMessage(user, 14)
                            socketMessage.bitWriteString(this.giveRandomPowers(dungeonUser.getUser(), randomPower))
                            dungeonUser.getUser().socketManager.send(socketMessage)
                        }
                        if (!dungeonUser.getIsDead() && this.mapLevel !== 0) {
                            dungeonUser.setToken(dungeonUser.getToken() + 1)
                        }
                    }
                })
                user.socketManager.sendAll(this.onGameMessage(user, 1))

                setTimeout((): void => {
                    this.mapLevel++
                    this.nextMap = this.getNextMap()
                    this.getListUser().forEach((dungeonUser: DungeonUser): void => {
                        dungeonUser.getUser().socketManager.send(this.onGameMessage(user, 2))
                        if (!dungeonUser.getIsDead()) {
                            dungeonUser.setLevel(this.mapLevel)
                            dungeonUser.setIsReady(false)
                      }
                    })
                }, 1500)
            }
        }
    }

    /**
     * @param user
     */
    reloadHUD(user: User): void {
        user.socketManager.send(this.onGameMessage(user, 3))
    }

    /**
     * @param user
     * @param socketMessage
     */
    hitMonster(user: User, socketMessage: SocketMessage): void {
        const mapPassedCount: number = socketMessage.bitReadUnsignedInt(32)
        const enemyId: number = socketMessage.bitReadUnsignedInt(32)
        const unknown: number = socketMessage.bitReadUnsignedInt(32)
        const damage: number = socketMessage.bitReadUnsignedInt(8)
        const positionX: number = socketMessage.bitReadSignedInt(32)
        const positionY: number = socketMessage.bitReadSignedInt(32)
        const isSpecial: boolean = socketMessage.bitReadBoolean()
        const dungeonUser: DungeonUser = this.getUser(user)

        if (!dungeonUser.getIsReady()) {
            socketMessage = this.onGameMessage(user, 5)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, mapPassedCount)
            socketMessage.bitWriteUnsignedInt(32, enemyId)
            socketMessage.bitWriteUnsignedInt(32, unknown)
            socketMessage.bitWriteUnsignedInt(8, damage + dungeonUser.getStrength())
            socketMessage.bitWriteSignedInt(32, positionX)
            socketMessage.bitWriteSignedInt(32, positionY)
            socketMessage.bitWriteBoolean(isSpecial)
            user.socketManager.sendAll(socketMessage)
        }
    }

    hitUser(user: User, socketMessage: SocketMessage): void {
        const dungeonUser: DungeonUser = this.getUser(user)
        const positionX: number = socketMessage.bitReadSignedInt(32)
        const positionY: number = socketMessage.bitReadSignedInt(32)
        const type: number = socketMessage.bitReadUnsignedInt(8)
        const damage: number = socketMessage.bitReadUnsignedInt(8)
        const isDodge: boolean =  Math.random() < 0.2

        if (dungeonUser.getLife() !== 0 && !dungeonUser.getIsReady()) {
            socketMessage = this.onGameMessage(user, 6)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
            socketMessage.bitWriteSignedInt(32, positionX)
            socketMessage.bitWriteSignedInt(32, positionY)
            socketMessage.bitWriteUnsignedInt(8, damage)
            socketMessage.bitWriteUnsignedInt(8, type)
            socketMessage.bitWriteBoolean(isDodge)
            user.socketManager.sendAll(socketMessage)

            if (!isDodge) {
                dungeonUser.setLife(Math.max(dungeonUser.getLife() - (damage === 0 ? 1 : damage), 0))
                user.socketManager.send(this.onGameMessage(user, 8))
                if (dungeonUser.getLife() === 0) {
                    this.die(user)
                    user.socketManager.sendAll(this.onGameMessage(user, 7))
                }
            }

            if (dungeonUser.getLife() !== 0) {
                setTimeout((): void => {
                    user.socketManager.sendAll(this.onGameMessage(user, 7))
                }, 1000)
            }
        }
    }

    activSpecial(user: User, socketMessage: SocketMessage): void {
        const unknown: number = socketMessage.bitReadUnsignedInt(8)
        const listUserId: number[] = new Array<number>()
        while (socketMessage.bitReadBoolean()) {
            listUserId.push(socketMessage.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID))
        }

        socketMessage = this.onGameMessage(user, 10)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
        socketMessage.bitWriteUnsignedInt(8, unknown)
        for (const userId of listUserId) {
            socketMessage.bitWriteBoolean(true)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, userId)
        }
        socketMessage.bitWriteBoolean(false)

        for (const userId of listUserId) {
            const dungeonUser: DungeonUser = this.getUserById(userId)
            const userFound: User = dungeonUser.getUser()

            if (user.skinId === 643) {
                if (dungeonUser.getLife() !== dungeonUser.getMaxLife()) {
                    dungeonUser.setLife(dungeonUser.getLife() + 1)
                    userFound.socketManager.send(this.onGameMessage(userFound, 13, {
                        nbLife: dungeonUser.getLife() - 1
                    }))
                }
            }
        }

        /**
         * _loc15_ = int(this.donjonChannel.message.bitReadUnsignedInt(2));
         *             _loc16_ = int(this.donjonChannel.message.bitReadUnsignedInt(32));
         *             _loc17_ = int(this.donjonChannel.message.bitReadUnsignedInt(this.GP.BIT_USER_ID));
         *             _loc18_ = int(this.donjonChannel.message.bitReadUnsignedInt(this.GP.BIT_USER_ID));
         *             _loc19_ = int(this.donjonChannel.message.bitReadUnsignedInt(8));
         *             _loc20_ = int(this.donjonChannel.message.bitReadUnsignedInt(8));
         *             _loc21_ = int(this.donjonChannel.message.bitReadUnsignedInt(32));
         *             _loc22_ = int(this.donjonChannel.message.bitReadUnsignedInt(16));
         *             _loc23_ = Number(this.donjonChannel.message.bitReadSignedInt(16));
         */

        /*
        console.log('unknown', unknown)
        const dateServer: number = Date.now()
        socketMessage = this.onGameMessage(user, 11)
        socketMessage.bitWriteUnsignedInt(2, 1) // 1, 0, 2
        socketMessage.bitWriteUnsignedInt(32, 1) // CAPA_ID"
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
        socketMessage.bitWriteUnsignedInt(8, user.id)
        socketMessage.bitWriteUnsignedInt(8, 0)
        socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000) + 15)
        socketMessage.bitWriteUnsignedInt(16, 1)
        socketMessage.bitWriteSignedInt(16, 1) // nb degats absorbé
        user.socketManager.send(socketMessage)

        socketMessage = this.onGameMessage(user, 11)
        socketMessage.bitWriteUnsignedInt(2, 1) // 1, 0, 2
        socketMessage.bitWriteUnsignedInt(32, 1) // CAPA_ID"
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, 0)
        socketMessage.bitWriteUnsignedInt(8, user.id)
        socketMessage.bitWriteUnsignedInt(8, 0)
        socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000) + 15)
        socketMessage.bitWriteUnsignedInt(16, 0)
        socketMessage.bitWriteSignedInt(16, 1) // nb degats absorbé
        user.socketManager.send(socketMessage)

          _loc3_.skin.setNearSpecialEffect(this.firstWalker,_loc16_,_loc19_,_loc21_,_loc23_);
          call => override public function setNearSpecialEffect(param1:Object, param2:int, param3:int, param4:int, param5:int) : void
          {
              param1.skin.setSpecialCameraIcon(true,param2,firstWalker.userId,param3,new CameraIconSpecial(),"Célérité ardente",param4);
              super.setNearSpecialEffect(param1,param2,param3,param4,param5);
          }
       */

        //       public function setSpecialCameraIcon(param1:Boolean, param2:int, param3:int, param4:int, param5:MovieClip = null, param6:String = "", param7:Number = 0) : *
        // param2 capa id
        // param3 from uid
        // param4 (sid)
        // param6 = time (s)
        // param7 = time (datetime)
    }

    object(user: User, socketMessage: SocketMessage): void {
        const objectId: number = socketMessage.bitReadUnsignedInt(32)
        const unknown: boolean = socketMessage.bitReadBoolean()
        const dungeonUser: DungeonUser = this.getUser(user)

        const object: ObjectDatabase|undefined = user.inventory.getObjectById(objectId)
        if (object && object.quantity > 0 && !dungeonUser.getIsDead()) {
            const FX: ParamsFX|undefined = user.hasFX(6,  `DONJON_${object?.objectId}`)
            if (!FX) {
                const isPersistant: boolean = [308, 309, 310, 311].includes(object.objectId)
                let updatedLife: number = 0
                let useObject: boolean = true

                switch (object.objectId) {
                    case 311: // Gros Talisman Force
                        dungeonUser.setStrength(dungeonUser.getStrength() + 3)
                        break
                    case 310: // Petit Talisman Force
                        dungeonUser.setStrength(dungeonUser.getStrength() + 1)
                        break
                    case 309: // Gros Talisman vie
                        updatedLife = 2
                        dungeonUser.setMaxLife(dungeonUser.getMaxLife() + 2)
                        dungeonUser.setLife(dungeonUser.getLife() + updatedLife)
                        break
                    case 308: // Petit Talisman vie
                        updatedLife = 1
                        dungeonUser.setMaxLife(dungeonUser.getMaxLife() + 1)
                        dungeonUser.setLife(dungeonUser.getLife() + updatedLife)
                        break
                    case 307: // Bandage
                        if (dungeonUser.getLife() !== dungeonUser.getMaxLife()) {
                            updatedLife = 1
                            dungeonUser.setLife(dungeonUser.getLife() + 1)
                        } else {
                            useObject = false
                        }
                        break
                    case 305: // Potion vie
                        if (dungeonUser.getLife() !== dungeonUser.getMaxLife()) {
                            updatedLife = dungeonUser.getMaxLife() - dungeonUser.getLife()
                            dungeonUser.setLife(dungeonUser.getMaxLife())
                        } else {
                            useObject = false
                        }
                        break
                    default:
                        break
                }

                if (useObject) {
                    if (updatedLife !== 0) {
                        user.socketManager.send(this.onGameMessage(user, 13, {
                            nbLife: dungeonUser.getLife() - updatedLife
                        }))
                    }

                    user.userFX.writeChange({
                        id: 6,
                        identifier: `DONJON_${object.objectId}`,
                        data: [46, object.objectId, new SocketMessage()],
                        isPersistant: isPersistant,
                        isMap: true
                    })

                    object.quantity--
                    user.inventory.reloadObject(object)
                }
            } else {
                user.interface.addInfoMessage(`On ne peut en porter qu'un seul à la fois dans une même partie :)`)
            }
        }
    }

    private die(user: User): void {
        const dungeonUser: DungeonUser = this.getUser(user)
        clearInterval(dungeonUser.getIntervalDie())
        dungeonUser.setIsDead(true)
        dungeonUser.setIsReady(true)
        user.transform.ghostParadise(0)
        user.interface.addInfoMessage(`${user.pseudo} succombe à ses blessures :/`, {
            isMap: true
        })
        setTimeout(() => this.endGame(), 1000)
    }

    private endGame(): void {
        let endGame: boolean = true
        for (const dungeonUser of this.getListUser()) {
            if (!dungeonUser.getIsDead()) {
                endGame = false
            }
        }
        if (endGame) {
            for (let userDungeon of this.getListUser()) {
                const user: User = userDungeon.getUser()
                user.socketManager.send(this.onGameMessage(user, 12))
                setTimeout((): void => {
                    user.socketManager.send(this.onGameMessage(user, 15))
                    if (user.mapId !== 501) {
                        user.getCamera()?.gotoMap(501)
                    }
                }, 2500)
            }
        }
    }

    private header(channelId: number): SocketMessage {
        const packetSender: Packet = {
            type: 1,
            subType: 16
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CHANNEL_ID, channelId)
        return socketMessage
    }


    private onGameMessage(user: User, type: number, options?: {nbLife?: number}): SocketMessage {
        const dungeonUser: DungeonUser = this.getUser(user)
        const socketMessage: SocketMessage = this.header(7)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_TYPE, type)
        const dateServer: number = Date.now()
        switch (type) {
            case 1: // end level
                break;
            case 2: // sendMap ?
                socketMessage.bitWriteUnsignedInt(9, this.nextMap)
                socketMessage.bitWriteUnsignedInt(10,  Math.floor((this.mapLevel - 1) / 5)) // bossKilled
                break
            case 3: // hud level
                socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
                socketMessage.bitWriteUnsignedInt(10, dateServer % 1000)
                socketMessage.bitWriteUnsignedInt(32, this.mapLevel)
                socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000) + 200)
                socketMessage.bitWriteUnsignedInt(16, 100)
                this.setIntervalDie(user)
                break
            case 4: // hud user
                socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000) + 200) // hudChronoAt
                socketMessage.bitWriteUnsignedInt(8, dungeonUser.getLife()) // life
                socketMessage.bitWriteUnsignedInt(8, dungeonUser.getMaxLife()) // maxLife
                socketMessage.bitWriteUnsignedInt(8, dungeonUser.getMaxLife()) // maxSpecial
                socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000) + 200) // timeOffset
                socketMessage.bitWriteUnsignedInt(10, dateServer % 1000) // timeOffset
                this.setIntervalDie(user)
                break
            case 5: // coffre
                break
            case 6: // sendDamage
                break
            case 7: // vuln user
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
                break
            case 8: // update life
                socketMessage.bitWriteUnsignedInt(8, dungeonUser.getLife()) // life
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
                break;
            case 9: // setLockUser
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
                break
            case 12: // Game over
                break
            case 13: // hud update
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
                socketMessage.bitWriteUnsignedInt(8, dungeonUser.getLife()) // life
                socketMessage.bitWriteUnsignedInt(8, dungeonUser.getMaxLife()) // maxLife
                socketMessage.bitWriteUnsignedInt(8, options?.nbLife ?? 0)
                socketMessage.bitWriteUnsignedInt(8, 0)
                break
            case 14: // pop-up rewards
                break
            case 15: // pop-up token
                if (user.hasFX(6, 'BLIBLI_304')) {
                    dungeonUser.setToken(dungeonUser.getToken() * 2)
                }
                socketMessage.bitWriteUnsignedInt(32, dungeonUser.getToken())
                if (dungeonUser.getLevel() !== 0) {
                    const score: number = dungeonUser.getLevel() < 11 ? -20 : dungeonUser.getLevel()
                    StatGame.upsertPlayerStats(
                        Game.DUNGEON, user.id,
                        score,
                        1,
                        0,
                        dungeonUser.getToken(),
                        dungeonUser.getLevel()
                    ).then()
                }
                break
            default:
                break
        }
        return socketMessage
    }

    private onGuestMessage(type: number): SocketMessage {
        const socketMessage: SocketMessage = this.header(6)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_TYPE, type)
        switch (type) {
            case 1: // dispose
                socketMessage.bitWriteUnsignedInt(32, this.id)
                break;
            default:
                break;
        }
        return socketMessage
    }

    onLuncherMessage(user: User, type: number, stype: number = 0): SocketMessage {
        const socketMessage: SocketMessage = this.header(5)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_STYPE, type)
        switch (type) {
            case 1:
                socketMessage.bitWriteUnsignedInt(10, stype)
                socketMessage.bitWriteUnsignedInt(32, this.id) // gameId
                break
            case 2: // addGuest
                socketMessage.bitWriteString(user.pseudo)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
                break
            case 3: // removeGuest
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
                break;
            case 4: // acceptGuest
                socketMessage.bitWriteString(user.pseudo)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
                break;
            default:
                break;
        }
        return socketMessage
    }

    private setIntervalDie(user: User): void {
        const dungeonUser: DungeonUser = this.getUser(user)
        if (!dungeonUser.getIsDead()) {
            dungeonUser.setIntervalDie(setInterval((): void => {
                if (!dungeonUser.getIsReady()) {
                    this.die(user)
                }
            }, 200 * 1000))
        }
    }

    /**
     * @param level
     * @private
     */
    private calculatePowerForLevel(level: number): number {
        const maxPower: number = Math.min(10, Math.floor((level - 10) / 5) + 1)
        const currentMaxPower: number = Math.min(10, Math.floor((level - 11) / 5) + 1)
        const powerIncrease: number = maxPower - currentMaxPower
        return Math.max(1, Math.min(maxPower, currentMaxPower + Math.floor(Math.random() * powerIncrease) + 1))
    }

    private giveRandomPowers(user: User, numberOfPowers: number): string {
        const powersArray: PowerWithKey[] = [];
        const initialPowers: { [key: number]: Power } = this.getInitialPowers()
        const winner: Winner = new Winner(initialPowers)
        const availablePowers: number[] = Object.keys(initialPowers).map(Number)

        for (let i = 0; i < numberOfPowers && availablePowers.length > 0; i++) {
            const randomIndex: number = Math.floor(Math.random() * availablePowers.length)
            const randomPowerKey: number = availablePowers[randomIndex]

            const randomPower: Power = initialPowers[randomPowerKey]
            powersArray.push({ key: randomPowerKey, power: randomPower })
            winner.handlePower(user, randomPower)
            availablePowers.splice(randomIndex, 1)
        }

        return this.formatPowersMessage(powersArray)
    }

    private getInitialPowers(): { [key: number]: Power } {
        let powers: { [key: number]: Power } = {
            0: { chatMessage: `jeton Donjon`, action: (user: User) => this.rewardObject(user, 0) },
            1: { chatMessage: `blabillon`, action: (user: User) => this.rewardObject(user, 1) },
            3: { chatMessage: `téléporteur`, action: (user: User) => this.rewardObject(user, 3) },
            6: { chatMessage: `coeur romantique`, action: (user: User) => this.rewardObject(user, 6) },
            25: { chatMessage: `onde de choc`, action: (user: User) => this.rewardObject(user, 25) },
            203: { chatMessage: `élixir Leprechaun`, action: (user: User) => this.rewardObject(user, 203) },
            245: { chatMessage: `pioche mysthoria`, action: (user: User) => this.rewardObject(user, 245) },
            305: { chatMessage: `potion de vie`, action: (user: User) => this.rewardObject(user, 305) },
            307: { chatMessage: `donjon bandage`, action: (user: User) => this.rewardObject(user, 307) }
        }

        if (this.mapLevel > 30) {
            powers = {
                ...powers,
                5: { chatMessage: `bombe`, action: (user: User) => this.rewardObject(user, 5) },
                12: { chatMessage: `laser`, action: (user: User) => this.rewardObject(user, 12) }
            }
        }

        for (const key in powers) {
            if (powers.hasOwnProperty(key)) {
                let quantity: number
                if (Number(key) !== 0 && Math.random() < 0.8) {
                    quantity = Math.random() < 0.8 ? 1 : (Math.random() < 0.8 ? 2 : 5);
                } else {
                    quantity = Math.floor(Math.random() * 10) + 1
                }
                powers[key].chatMessage = `${quantity}x ${powers[key].chatMessage}`
                powers[key].action = (user: User) => this.rewardObject(user, Number(key), quantity)
            }
        }

        return powers
    }

    private async rewardObject(user: User, objectId: number, quantity: number = 1): Promise<void> {
        if (objectId === 0) {
            await StatGame.upsertPlayerStats(Game.DUNGEON, user.id, 0, 0, 0, quantity)
        } else if (objectId === 1) {
            await user.updateBBL(quantity, false)
        } else {
            user.inventory.reloadOrInsertObject(objectId, { isSubtraction: false }, quantity)
        }
    }

    private formatPowersMessage(powersArray: PowerWithKey[]): string {
        return powersArray.map(({ power }) => power.chatMessage).join('\n')
    }


    areAllUsersReady(): boolean {
        for (const dungeonUser of this.getListUser()) {
            if (!dungeonUser.getIsReady() && !dungeonUser.getIsDead()) {
                return false
            }
        }
        return true
    }

    getIsLaunch(): boolean {
        return this.isLaunch
    }

    private getNextMap(): number {
        return this.mapLevel % 5 !== 0 ? Math.floor(Math.random() * 25) + 1 : Math.floor(Math.random() * 5) + 26
    }

    getOwner(): User {
        return <User>this.getListUser().find((dungeonUser: DungeonUser): boolean => dungeonUser.getOwner())?.getUser()
    }

    getUser(user: User): DungeonUser {
        return <DungeonUser>this.getListUser().find((dungeonUser: DungeonUser): boolean => dungeonUser.getUser().id === user.id)
    }
    getUserById(userId: number): DungeonUser {
        return <DungeonUser>this.getListUser().find((dungeonUser: DungeonUser): boolean => dungeonUser.getUser().id === userId)
    }


    addListUser(user: DungeonUser): void {
        this.listUser.push(user)
    }
    removeListUser(user: User): void {
        this.listUser = this.getListUser().filter((dungeonUser: DungeonUser): boolean => dungeonUser.getUser().id !== user.id)
    }

    getListUser(): Array<DungeonUser> {
        return this.listUser
    }
}

export default Dungeon