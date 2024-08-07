import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"
import Winner, { Power, PowerWithKey } from "../../libs/blablaland/Winner"
import StatGame, { Game } from "../../libs/blablaland/games/StatGame"

class Pickaxe {

    private initialPowers: { [key: number]: Power } = {
        246: { chatMessage: '1 Boîte de conserve', action: (user: User) =>user.inventory.reloadOrInsertObject(246, { isSubtraction: false }) },
        247: { chatMessage: '1 Pneu abîmé', action: (user: User) => user.inventory.reloadOrInsertObject(247, { isSubtraction: false }, ) },
        248: { chatMessage: '1 Peau de banane', action: (user: User) => user.inventory.reloadOrInsertObject(248, { isSubtraction: false }) },
        249: { chatMessage: '1 Os mâché', action: (user: User) => user.inventory.reloadOrInsertObject(249, { isSubtraction: false }) },
        250: { chatMessage: '1 Chaussure', action: (user: User) => user.inventory.reloadOrInsertObject(250, { isSubtraction: false }) },
        183: { chatMessage: '1 Graine de Roses', action: (user: User) => user.inventory.reloadOrInsertObject(183, { isSubtraction: false }) },
        89: { chatMessage: '1 Super Banane', action: (user: User) => user.inventory.reloadOrInsertObject(89, { isSubtraction: false }) },
        5: { chatMessage: '1  Bombe', action: (user: User) => user.inventory.reloadOrInsertObject(5, { isSubtraction: false }) },
    }

    execute(user: User, item: ObjectDefinition): void {
        let FX: ParamsFX|undefined = user.hasFX(6, `PICKAXE`)
        let type: number = item.packet.bitReadUnsignedInt(2)

        const socketMessage: SocketMessage = new SocketMessage()
        if (type === 0) {
            if (FX) {
                user.userFX.dispose(FX)
            }
            const duration: number = 3
            const dateServer: number = Date.now()
            socketMessage.bitWriteUnsignedInt(2, 0)
            socketMessage.bitWriteUnsignedInt(5, duration - 1)
            socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))

            const params : ParamsFX = {
                id: 6,
                identifier: 'PICKAXE',
                data: [item.type.fxFileId, item.type.id, socketMessage],
                isPersistant: false,
                duration: duration,
            }
            user.userFX.writeChange(params)

            if (! user.inventory.getObject(251)) {
                user.inventory.reloadOrInsertObject(251)
            }
        } else if (type === 2) {
            if (FX) user.userFX.dispose(FX)
        } else if (type === 3) {
            let onFloor: number = item.packet.bitReadUnsignedInt(2)
            let positionX: number = item.packet.bitReadSignedInt(17)

            if (FX) {
                user.userFX.dispose(FX)

                let isFound: boolean = false
                let reward: string = ''
                let positionMysthoria: number = this.getRandomNumber(5, 1000)
                let nbMysthoria: number = this.getRandomNumber(1, 5)
                let winner: Winner = new Winner(this.initialPowers)
                let randomPower: PowerWithKey | null = winner.getRandomPower()

                if (!randomPower) return

                winner.handlePower(user, randomPower.power)
                reward = randomPower.power.chatMessage

                item.database.quantity--
                user.inventory.reloadObject(item.database)

                FX = user.hasFX(6, `POPUP_PICKAXE_${user.mapId}`)

                if (FX) {
                    positionMysthoria = FX.memory[1] === user.mapId ? -1 : FX.memory[0]
                    isFound = positionMysthoria !== -1 && Math.abs(positionX - positionMysthoria) <= 80
                    if (isFound) {
                        reward = `${nbMysthoria} fragment(s) de Mysthoriä !`
                        this.animMysthoria(user, 0)
                        user.interface.addInfoMessage(`${user.pseudo} vient de trouver du Mysthoriä !`, {
                            isMap: true,
                            except: user
                        })
                        StatGame.upsertPlayerStats(Game.MYSTHORIA, user.id, 0, 0, 0, nbMysthoria).then()
                    } else {
                        reward = randomPower.power.chatMessage
                    }
                    user.userFX.dispose(FX)
                }

                if (!isFound && positionMysthoria !== -1) {
                    const isBadLuck: boolean = this.getRandomNumber(0, 10) <= 2
                    if (isBadLuck) {
                        return this.animMysthoria(user, this.getRandomNumber(0, 10) <= 5 ?  3 : 2)
                    }

                    const direction: boolean = positionX > positionMysthoria
                    const indication: string = `(il y a des fragments de Mysthoriä plus ${direction ? "à l'Ouest" : "à l'Est"})`

                    let socketMessage = new SocketMessage()
                    socketMessage.bitWriteUnsignedInt(2, 2)
                    socketMessage.bitWriteBoolean(direction)
                    let params = {
                        id: 6,
                        data: [item.type.fxFileId, item.type.id, socketMessage],
                        duration: 60,
                        isPersistant: false,
                        isMap: false
                    }
                    user.userFX.writeChange(params)
                    user.interface.addInfoMessage(indication)
                }

                const message: string = `Tu viens de trouver ${reward}`

                const socketMessage: SocketMessage = new SocketMessage()
                socketMessage.bitWriteUnsignedInt(2, 1)
                socketMessage.bitWriteUnsignedInt(5, 0)
                socketMessage.bitWriteUnsignedInt(3, isFound ? 3 : (randomPower.key >= 246 && randomPower.key <= 251) ? 1 : 2)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, randomPower.key)
                socketMessage.bitWriteUnsignedInt(5, 1)
                socketMessage.bitWriteString(reward)

                let params: ParamsFX = {
                    id: 6,
                    identifier: `POPUP_PICKAXE_${user.mapId}`,
                    memory: [positionMysthoria, isFound ? user.mapId : null],
                    data: [item.type.fxFileId, item.type.id, socketMessage],
                    isPersistant: false,
                    duration: 180,
                    isMap: false
                }
                user.userFX.writeChange(params)
                user.interface.addInfoMessage(message)
            }
        }
    }

    private getRandomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    private animMysthoria(user: User, type: number): void {
        user.userFX.writeChange({
            id: 6,
            data: [37, type],
            isPersistant: false,
            isMap: true
        })
    }
}

export default Pickaxe