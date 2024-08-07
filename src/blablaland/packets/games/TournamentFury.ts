import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import { ParamsFX } from "../../../interfaces/blablaland"
import StatGame, { Game } from "../../../libs/blablaland/games/StatGame"

interface Tournament {
    isStarted?: boolean;
    isMort?: boolean;
    selectedGun?: number;
    ptsLife?: number;
    ptsShot?: number,
}

interface Gun {
    minDamage: number;
    maxDamage: number;
    cooldown: number;
}

class TournamentFury {

    guns: { [key: number]: Gun } = {
        0: { minDamage: 15, maxDamage: 20, cooldown: 300 },
        1: { minDamage: 15, maxDamage: 20, cooldown: 200 },
        2: { minDamage: 15, maxDamage: 20, cooldown: 200 },
        3: { minDamage: 130, maxDamage: 150, cooldown: 500 },
        4: { minDamage: 15, maxDamage: 20, cooldown: 200 },
        5: { minDamage: 15, maxDamage: 20, cooldown: 200 },
        6: { minDamage: 5, maxDamage: 10, cooldown: 200 },
        7: { minDamage: 60, maxDamage: 80, cooldown: 300 },
        8: { minDamage: 130, maxDamage: 150, cooldown: 500 },
        9: { minDamage: 40, maxDamage: 50, cooldown: 300 },
        10: { minDamage: 40, maxDamage: 50, cooldown: 300 },
    }

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     * @returns void
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager) {
        const type: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_STYPE)

        if (type === 1) { // setServerMoveUOL
            const moveClient: boolean = packet.bitReadBoolean()
            const moveUOL: boolean = packet.bitReadBoolean()
        } else if (type === 2) { // sendServerAskSelectGun
            const selectedGun: number = packet.bitReadSignedInt(5)
            TournamentFury.sendPlayerInfo(user, {
                isStarted: true,
                selectedGun: selectedGun
            })
        } else if (type === 3) { // sendShotToServer
            let color: number = 0
            let curlAngle: number = 0
            let canShot: boolean = true
            let direction: boolean = false
            let shotUse: boolean = false

            const selectedGun: number = packet.bitReadSignedInt(5)
            if (selectedGun === 5) {
                shotUse = packet.bitReadBoolean()
            }
            const positionX: number = packet.bitReadSignedInt(16)
            const positionY: number = packet.bitReadSignedInt(16)
            if (selectedGun === 0 || selectedGun === 6) {
                color = packet.bitReadUnsignedInt(10)
            }
            if (selectedGun !== 5) {
                curlAngle = packet.bitReadUnsignedInt(8)
                direction = packet.bitReadBoolean()
            }

            const socketMessage: SocketMessage = new SocketMessage()
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
            if (selectedGun === 5) {
                socketMessage.bitWriteBoolean(shotUse)
            }
            socketMessage.bitWriteSignedInt(16, positionX)
            socketMessage.bitWriteSignedInt(16, positionY)
            if (selectedGun === 0 || selectedGun === 6) {
                socketMessage.bitWriteUnsignedInt(10, color)
            }
            if (selectedGun !== 5) {
                socketMessage.bitWriteUnsignedInt(8, curlAngle)
                if ([1, 3, 4, 7, 8].includes(selectedGun)) {
                    const dateServer: number = Date.now()

                    socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
                    socketMessage.bitWriteUnsignedInt(10, dateServer % 1000)
                }
                socketMessage.bitWriteBoolean(direction)
            }

            if (!(selectedGun === 6 || (selectedGun === 5 && !shotUse))) {
                canShot = this.sendPowaInfo(user, selectedGun, 1, true)
            }

            if (canShot) {
                if (selectedGun === 10) {
                    user.userFX.writeChange({
                        id: 6,
                        identifier: 'SHOT_FURY',
                        data: [13, 100 + selectedGun, socketMessage],
                        isPersistant: true
                    })
                } else {
                    universeManager.getMapById(user.mapId).mapFX.writeChange(user, {
                        id: 5,
                        identifier: 'SHOT_FURY',
                        data: [13, 100 + selectedGun, socketMessage],
                        isPersistant: true,
                        duration: 2
                    })
                }

            }
        } else if (type === 4) { // makeExplosion
            const userId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
            const objectId: number = packet.bitReadSignedInt(5)
            const gun: Gun = this.guns[objectId]

            const userFound: User|undefined = serverManager.getUserById(userId, {
                inConsole: false
            })
            if (userFound) {
                let damage: number = Math.floor(Math.random() * (gun.maxDamage - gun.minDamage + 1)) + gun.minDamage
                const randomNumber: number = Math.floor(Math.random() * 20) + 1
                let type: number = 3

                if (randomNumber === 5) {
                    damage = gun.maxDamage
                    type = 5
                } else if (randomNumber === 4) {
                    type = 4
                }
                const socketMessage: SocketMessage = new SocketMessage()
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_STYPE, type)
                socketMessage.bitWriteSignedInt(16, damage)

                user.userFX.writeChange({
                    id: 6,
                    data: [13, 2, socketMessage],
                    isPersistant: false
                })
                if (type !== 4) {
                    const playerInfo: Tournament = TournamentFury.sendPlayerInfo(user, {
                        ptsShot: damage
                    })

                    if (playerInfo.isMort) {
                        user.interface.addInfoMessage(`Tu as été tué par '${userFound.pseudo}' !!`)
                        userFound.interface.addInfoMessage(`Tu as tué '${user.pseudo}' !!`)

                        if (userFound.id !== user.id) {
                            await StatGame.upsertPlayerStats(Game.TOURNAMENT_FURY, userFound.id, 6, 1, 0, 0)
                            await StatGame.upsertPlayerStats(Game.TOURNAMENT_FURY, user.id, -2, 0, 1, 0)
                        }

                        setTimeout((): void => {
                            TournamentFury.sendPlayerInfo(user, {isMort: false, ptsLife: 100})
                        }, 10 * 1000)
                    }
                }
            }
        } else if (type === 5) { // Powa
            const FX_SID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
            const map = universeManager.getMapById(user.mapId)

            const FX: ParamsFX | undefined = map.mapFX.getListFX()
                .find((FX: ParamsFX) => FX.id === 5 && FX.sid === FX_SID)

            if (FX) {
                if (FX.memory[0] === 0) {
                    TournamentFury.sendPlayerInfo(user, {
                        ptsLife: 100,
                    })
                } else {
                    this.sendPowaInfo(user, FX.memory[0] !== 6 ? FX.memory[0] : 0, FX.memory[1], false)
                }
                FX.close = 0
                map.mapFX.dispose(user, FX)
            }
        } else if (type === 6) { // Fire
            const type: number = packet.bitReadSignedInt(5)
            if (type === 1) {
                const FX: ParamsFX | undefined = user.hasFX(6, `SHOT_FURY`)
                if (FX) {
                    user.userFX.dispose(FX)
                }
            }
        }
    }

    /**
     *
     * @param user
     * @param powaId
     * @param powaQuantity
     * @param isSubstraction
     */
    private sendPowaInfo(user: User, powaId: number, powaQuantity: number, isSubstraction: boolean): boolean {
        const FX: ParamsFX | undefined = user.userFX.getListFX()
            .filter((FX: ParamsFX) => FX.id === 6 && FX.identifier?.includes(`POWA_FURY`)).pop()

        const records: Record<number, { value: number; timestamp: number }> = FX?.memory ?? {}
        let canShot: boolean = FX?.memory && isSubstraction ? (records[powaId].value || 0) >= 1 : true

        if (isSubstraction) {
            const elapsedTime: number = Date.now() - (records[powaId]?.timestamp || 0)
            if (elapsedTime >= this.guns[powaId].cooldown) {
                records[powaId] = {
                    value: Math.max((records[powaId]?.value || 0) - powaQuantity, 0),
                    timestamp: Date.now()
                }
            } else {
                canShot = false
            }
        } else {
            records[powaId] = {
                value: (records[powaId]?.value || 0) + powaQuantity,
                timestamp: Date.now()
            }
        }

        if (canShot) {
            const socketMessage: SocketMessage = new SocketMessage()
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_STYPE, 2)
            socketMessage.bitWriteSignedInt(5, powaId)
            socketMessage.bitWriteUnsignedInt(16, records[powaId].value)
            user.userFX.writeChange({
                id: 6,
                identifier: 'POWA_FURY',
                data: [13, 2, socketMessage],
                isSendOther: false,
                isMap: false,
                memory: records
            })
        }

        return canShot
    }

    /**
     *
     * @param user
     * @param options
     */
    static sendPlayerInfo(user: User, options?: Tournament): Tournament {
        let memory: Tournament = this.initializeMemory(options)

        const FX: ParamsFX | undefined = user.userFX.getListFX()
            .filter((FX: ParamsFX) => FX.id === 6 && FX.identifier?.includes(`POPUP_FURY`)).pop()

        if (FX) {
            memory = this.processFX(FX, options)
        }

        const socketMessage: SocketMessage = new SocketMessage()
        socketMessage.bitWriteBoolean(memory.isStarted!)
        socketMessage.bitWriteBoolean(memory.isMort!)
        socketMessage.bitWriteSignedInt(5, memory.selectedGun!)
        socketMessage.bitWriteUnsignedInt(8, memory.ptsLife!)

        user.userFX.writeChange({
            id: 6,
            identifier: `POPUP_FURY`,
            data: [13, 1, socketMessage],
            memory: memory,
        })

        return memory
    }

    /**
     *
     * @param options
     */
    static initializeMemory(options?: Tournament): Tournament {
        return {
            isStarted: options?.isStarted ?? true,
            isMort: options?.isMort ?? false,
            selectedGun: options?.selectedGun ?? -1,
            ptsLife: options?.ptsLife ?? 100
        }
    }

    /**
     *
     * @param FX
     * @param options
     */
    static processFX(FX: ParamsFX, options?: Tournament): Tournament {
        let isStarted: boolean = options?.isStarted ?? FX.memory.isStarted
        let isMort: boolean = options?.isMort ?? FX.memory.isMort
        let selectedGun: number = options?.selectedGun ?? FX.memory.selectedGun
        let ptsLife: number = options?.ptsLife ?? FX.memory.ptsLife

        if (options?.ptsShot) {
            ptsLife = Math.max(0, ptsLife - options.ptsShot)
            if (ptsLife <= 0) {
                isMort = true
            }
        }

        return { isStarted, isMort, selectedGun, ptsLife }
    }

}

export default TournamentFury