import User from "../../User"
import SocketMessage from "../../network/SocketMessage"
import GlobalProperties from "../../network/GlobalProperties"
import { ParamsFX } from "../../../../interfaces/blablaland"
import ShotMode from "./ShotMode"
import StatGame, { Game } from "../StatGame"

type Point = [number, number]
type Boat = Point[][]
type BoatList = Boat[][]

class NavalBattle {

    id: number

    sender: User
    receiver: User

    boatListSender: any
    boatListReceiver: any

    defaultShotModeGrid: ShotMode[] = []
    shotModeGridSender: ShotMode[] = []
    shotModeGridReceiver: ShotMode[] = []

    shotModeSender: number = 0
    shotModeReceiver: number = 0

    isStart: boolean = false
    isReady: boolean = false
    endGame: boolean = false

    constructor(id: number, sender: User, receiver: User) {
        this.id = id
        this.sender = sender
        this.receiver = receiver
        this.defaultShotModeGrid = [
            ShotMode.NORMAL,
            ShotMode.STARS,
            ShotMode.SUPER_STARS,
            ShotMode.DOUBLE_VERTICAL,
            ShotMode.DOUBLE_HORIZONTAL,
            ShotMode.PLUS,
            ShotMode.CRATER,
            ShotMode.APOCALYPSE,
            ShotMode.DONUTS,
            ShotMode.COLUMN_OF_FIRE,
            ShotMode.TRAIT_OF_DEATH
        ]
    }

    /**
     *
     */
    invite(): void {
        const socketMessage: SocketMessage = new SocketMessage
        socketMessage.bitWriteString(this.sender.pseudo)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, this.sender.id)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, this.sender.pid)

        this.receiver.userFX.writeChange({
            id: 6,
            data: [10, 1, socketMessage],
            isPersistant: false,
            isMap: false
        })
        this.sender.interface.addInfoMessage(`Demande transmise, en attente de la réponse de ${this.receiver.pseudo} !`)
    }

    /**
     *
     */
    open(): void {
        const FXReceiver: ParamsFX|undefined = this.receiver.hasFX(6, `BLIBLI_193`)
        const FxSender: ParamsFX|undefined = this.sender.hasFX(6, `BLIBLI_193`)

        this.shotModeGridSender = this.getAvailableShotModes(FxSender)
        this.sender.userFX.writeChange({
            id: 6,
            data: [10, 2, this.writeShotModeGrid(this.receiver, this.defaultShotModeGrid)],
            isPersistant: false,
            isMap: false
        })

        this.shotModeGridReceiver = this.getAvailableShotModes(FXReceiver)
        this.receiver.userFX.writeChange({
            id: 6,
            data: [10, 2, this.writeShotModeGrid(this.sender, this.defaultShotModeGrid)],
            isPersistant: false,
            isMap: false
        })
        this.isStart = true
    }

    /**
     * @param user
     * @param reason 1 logout, 3 leave, 4 error, 5 jail
     */
    close(user: User, reason: number): void {
        if (this.isStart) {
            const receiver: User = user.id === this.receiver.id ? this.sender : this.receiver
            reason = this.endGame ? 2 : reason

            let message: string|undefined = {
                1: "déconnexion",
                3: "fermeture du jeu",
                5: "prison"
            }[reason]

            const socketMessage: SocketMessage = this.messageEvent()
            socketMessage.bitWriteUnsignedInt(8, reason)

            const params: ParamsFX = {
                id: 6,
                data: [10, 3, socketMessage],
                isPersistant: false,
                isMap: false
            }

            if (reason === 1 || reason === 3) {
                receiver.userFX.writeChange(params)
            } else {
                this.receiver.userFX.writeChange(params)
                this.sender.userFX.writeChange(params)
            }


            if (message) {
                message =  `Pouf ! La partie a été annulée par ${user.pseudo} (${message})`
                const isSameMap: boolean = receiver.mapId === user.mapId

                user.interface.addInfoMessage(message, { isMap: true })
                if (!isSameMap) receiver.interface.addInfoMessage(message, { isMap: true })
            }
        }
    }

    /**
     * @param user
     * @param socketMessage
     */
    ready(user: User, socketMessage: SocketMessage) {
        const boatList = []
        while (socketMessage.bitReadBoolean()) {
            const type: number = socketMessage.bitReadUnsignedInt(3)
            const positionX: number = socketMessage.bitReadUnsignedInt(5)
            const positionY: number = socketMessage.bitReadUnsignedInt(5)
            const rotV: number = socketMessage.bitReadUnsignedInt(2)
            const AB = []
            while (socketMessage.bitReadBoolean()) {
                let AA: number = positionX + socketMessage.bitReadSignedInt(3)
                let BB: number = positionY + socketMessage.bitReadSignedInt(3)
                AB.push([AA, BB])
            }
            boatList.push(AB)
        }
        if (user.id === this.receiver.id) {
            this.boatListReceiver = []
            this.boatListReceiver.push(boatList)
        } else {
            this.boatListSender = []
            this.boatListSender.push(boatList)
        }

        if (!this.isReady) {
           this.isReady = true
           user.userFX.writeChange({
               id: 6,
               data: [10, 4, this.messageEvent()],
               isPersistant: false,
               isMap: false
           })
        } else {
           this.receiver.userFX.writeChange({
               id: 6,
               data: [10, 5, this.messageEvent(5, this.receiver)],
               isPersistant: false,
               isMap: false
           })
           this.sender.userFX.writeChange({
               id: 6,
               data: [10, 5, this.messageEvent(5, this.sender)],
               isPersistant: false,
               isMap: false
           })
       }
    }

    /**
     * @param user
     * @param socketMessage
     */
    sendSelectionChanged(user: User, socketMessage: SocketMessage) {
        const receiver: User = user.id === this.receiver.id ? this.sender : this.receiver
        receiver.userFX.writeChange({
            id: 6,
            data: [10, 6, this.messageEvent(6, user, socketMessage)],
            isPersistant: false,
            isMap: false
        })
    }

    /**
     * @param user
     * @param socketMessage
     */
    sendMyShot(user: User, socketMessage: SocketMessage) {
        const positionX: number = socketMessage.bitReadSignedInt(6)
        const positionY: number = socketMessage.bitReadSignedInt(6)
        const boatListEnemy = user.id === this.receiver.id ? this.boatListSender : this.boatListReceiver

        // I retrieve my myShotModeGrid and my current shotMode
        const myShotMode: number = user.id === this.receiver.id ? this.shotModeReceiver : this.shotModeSender
        const myShotModeGrid: ShotMode[] = user.id === this.receiver.id ? this.shotModeGridReceiver : this.shotModeGridSender

        socketMessage = this.messageEvent()
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
        socketMessage.bitWriteSignedInt(6, positionX)
        socketMessage.bitWriteSignedInt(6, positionY)
        socketMessage.bitWriteUnsignedInt(4, myShotMode) // shotMode

        const resultHitList: number[] = []
        const hitList: number[][] = this.getHitList(myShotModeGrid, positionX, positionY, myShotMode)
        for (const [dx, dy] of hitList) {
            const newPoint = [positionX + dx, positionY + dy]
            if (newPoint[0] < 0 || newPoint[0] > 14 || newPoint[1] < 0 || newPoint[1] > 11) {
                resultHitList.push(3)
                continue
            }
            this.processBoats(boatListEnemy, newPoint, resultHitList)
        }

        // I randomly define next shot player
        const myNextShotMode: number = this.getRandomShotMode(user)
        user.id === this.receiver.id ? this.shotModeReceiver = myNextShotMode : this.shotModeSender = myNextShotMode

        socketMessage.bitWriteUnsignedInt(7, resultHitList.length) // nbShot
        for (let result of resultHitList) {
            socketMessage.bitWriteUnsignedInt(2, result) // hitList
        }
         // Next shot of the player who is going to play
        socketMessage.bitWriteUnsignedInt(4,  user.id === this.receiver.id ? this.shotModeSender : this.shotModeReceiver) // nextShotMode
        socketMessage.bitWriteUnsignedInt(4, myNextShotMode)
        socketMessage.bitWriteBoolean(this.endGame) // endGame

        if (this.endGame) {
            this.handleEndGame(user, user.id === this.receiver.id ? this.sender : this.receiver)
        }

        const params: ParamsFX = {
            id: 6,
            data: [10, 7, socketMessage],
            isPersistant: false,
            isMap: true
        }
        this.sender.userFX.writeChange(params)
        this.receiver.userFX.writeChange(params)
        user.clearIntervalDodo(true)
    }

    private handleEndGame(winner: User, loser: User): void {
        let tokenWinner: number = Math.floor(Math.random() * 16) + 15
        let tokenLoser: number = Math.floor(Math.random() * 5) + 4

        tokenWinner += winner.hasFX(6, 'BLIBLI_193') ? Math.floor(tokenWinner * 0.2) : 0
        tokenLoser += loser.hasFX(6, 'BLIBLI_193') ? Math.floor(tokenLoser * 0.2) : 0

        const updateToken = (player: User, token: number, isWin: boolean): void => {
            StatGame.upsertPlayerStats(
                Game.NAVAL_BATTLE,
                player.id,
                isWin ? token : -token,
                isWin ? 1 : 0,
                isWin ? 0 : 1,
                token
            ).then((): void => {
                    const socketMessage: SocketMessage = new SocketMessage()
                    socketMessage.bitWriteUnsignedInt(7, token)
                    socketMessage.bitWriteUnsignedInt(16, this.id)
                    player.userFX.writeChange({
                        id: 6,
                        data: [10, 8, socketMessage],
                        isPersistant: false,
                        isMap: true
                    })
                })
        }

        updateToken(winner, tokenWinner, true)
        updateToken(loser, tokenLoser, false)

        const message: string = `${winner.pseudo} vient de gagner ${tokenWinner} jetons 'Blablataille Navale' contre ${loser.pseudo} qui en gagne ${tokenLoser} :D`
        const isSameMap: boolean = winner.mapId === loser.mapId

        winner.interface.addInfoMessage(message, { isMap: true })
        if (!isSameMap) loser.interface.addInfoMessage(message, { isMap: true })
    }

    /**
      * @param messageType
     * @param user
     * @param packet
     * @private
     */
    private messageEvent(messageType?: number, user?: User, packet?: SocketMessage): SocketMessage {
        const socketMessage: SocketMessage = new SocketMessage()
        socketMessage.bitWriteUnsignedInt(16, this.id)
        switch (messageType) {
            case 5:
                socketMessage.bitWriteBoolean(user?.id == this.receiver.id) //isReceiverId ??
                socketMessage.bitWriteUnsignedInt(4, 0) //shotMode
                break
            case 6:
                if (packet?.bitReadBoolean()) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteSignedInt(6, packet?.bitReadSignedInt(6) ?? 0)
                    socketMessage.bitWriteSignedInt(6, packet?.bitReadSignedInt(6) ?? 0)
                } else {
                    socketMessage.bitWriteBoolean(packet?.bitReadBoolean() ?? false)
                }
                break
            default:
                break
        }
        return socketMessage
    }

    private getAvailableShotModes(isWithBlibli: ParamsFX|undefined): ShotMode[] {
        const defaultShotModes: ShotMode[] = [ShotMode.NORMAL, ShotMode.STARS, ShotMode.DOUBLE_VERTICAL, ShotMode.DOUBLE_HORIZONTAL]
        const additionalShotModes: ShotMode[] = [
            ShotMode.SUPER_STARS,
            ShotMode.PLUS,
            ShotMode.CRATER,
            ShotMode.APOCALYPSE,
            ShotMode.DONUTS,
            ShotMode.COLUMN_OF_FIRE,
            ShotMode.TRAIT_OF_DEATH
        ]
        const availableModes: ShotMode[] = defaultShotModes

        additionalShotModes.forEach((mode: ShotMode): void => {
            if (isWithBlibli) {
                availableModes.push(new ShotMode(mode.id, mode.targets, mode.luckyDrawChance))
            }
        })

        return availableModes
    }

    getRandomShotMode(user: User): number {
        let availableShotModes: ShotMode[] = user.id === this.receiver.id ? this.shotModeGridReceiver : this.shotModeGridSender || []
        const selectedMode: ShotMode[] = availableShotModes.filter((mode: ShotMode): boolean => Math.floor(Math.random() * 30) + 1 === mode.luckyDrawChance)
        if (selectedMode.length > 0) {
            return selectedMode[Math.floor(Math.random() * selectedMode.length)].id
        }

        availableShotModes = [ShotMode.NORMAL, ShotMode.STARS, ShotMode.DOUBLE_VERTICAL, ShotMode.DOUBLE_HORIZONTAL]
        return (availableShotModes.length > 0) ? availableShotModes[Math.floor(Math.random() * availableShotModes.length)].id : 0
    }

    /**
     * @param user
     * @param shotModeGrid
     * @private
     */
    private writeShotModeGrid(user: User, shotModeGrid: ShotMode[]): SocketMessage {
        const socketMessage: SocketMessage = this.messageEvent()
        socketMessage.bitWriteString(user.pseudo)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
        for (let grid of shotModeGrid) {
            socketMessage.bitWriteBoolean(true)
            socketMessage.bitWriteUnsignedInt(8, grid.targets.length)
            for (let element of grid.targets) {
                socketMessage.bitWriteSignedInt(4, element[0])
                socketMessage.bitWriteSignedInt(4, element[1])
            }
        }
        socketMessage.bitWriteBoolean(false)
        return socketMessage
    }

    private getHitList(shotModeGrid: ShotMode[], positionX: number, positionY: number, shotMode: number): number[][] {
        let hitList: number[][] = []
        if (positionX !== -10 && positionY !== -10) {
            hitList = this.defaultShotModeGrid[shotMode].targets
        }
        return hitList
    }

    processBoats(boatList: BoatList, newPoint: any, d: any): void {
        let hitMode = 0
        for (let i = 0; i < boatList.length; i++) {
            const boatLevel: Boat[] = boatList[i]
            for (let j = 0; j < boatLevel.length; j++) {
                const boat = boatLevel[j]
                for (let k: number = 0; k < boat.length; k++) {
                    const p: Point[] = boat[k]
                    if (p[0] === newPoint[0] && p[1] === newPoint[1]) {
                        hitMode = 1
                        boat.splice(k, 1)
                        if (boat.length === 0) {
                            hitMode = 2
                            boatLevel.splice(j, 1)
                            if (boatLevel.length === 0) {
                                boatList.splice(i, 1)
                                if (boatList.length === 0) {
                                    this.endGame = true
                                }
                            }
                        }
                        break
                    }
                }
                if (hitMode !== 0) {
                    break
                }
            }
        }
        d.push(hitMode)
    }
}

export default NavalBattle