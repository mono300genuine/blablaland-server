import User from "../../../libs/blablaland/User"
import { MapEvent } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import Winner from "../../../libs/blablaland/Winner"
import { ObjectDatabase } from "../../../interfaces/database"
import { Knex } from "knex"

class Siren {

    /**
     *
     * @param user
     * @param event
     */
    async execute(user: User, event: MapEvent): Promise<void> {
        if (event.type === 0) {
            const type: number = event.packet.bitReadUnsignedInt(3)
            const socketMessage: SocketMessage = new SocketMessage()

            const nbPearl: number = [10, 50, 400, 400, 400][type - 1]
            const pearl: ObjectDatabase | undefined = user.inventory.getObject(233)
            const isAuthorized: boolean = !!((nbPearl && pearl) && (pearl.quantity >= nbPearl))

            if (isAuthorized && pearl) {
                const winner: Winner = new Winner()
                let initialPowers = null
                let message: string = ''
                let giveBBL: number = winner.isWinner(3, 1) ? 1 : 0

                const numberToPhraseMap: { [key: number]: string } = {
                    83: "La Bouée Donut !!!",
                    81: "La Bouée Girafe !!!",
                    84: "La Bouée Militaire !!!",
                    87: "La Bouée Kawaii !!!",
                    99: "La Bouée Pirate !!!",
                    595: "Le skin Ondine !!!",
                    596: "Le skin Ondin !!!"
                }

                if (type === 1) {
                    if (giveBBL) {
                        giveBBL = [20, 30, 40, 50, 60, 70][Math.floor(Math.random() * 6)]
                    } else {
                        initialPowers = {
                            26: {
                                chatMessage: '3 Coeur romantique Or',
                                action: (user: User) => user.inventory.reloadOrInsertObject(26, {}, 3)
                            },
                            16: {
                                chatMessage: '2 Potions de nage rapide !!!',
                                action: (user: User) => user.inventory.reloadOrInsertObject(16, {}, 2)
                            },
                            15: {
                                chatMessage: '2 Potions de saut !!!',
                                action: (user: User) => user.inventory.reloadOrInsertObject(15, {}, 2)
                            },
                            14: {
                                chatMessage: '2 Potions de rapidité !!!',
                                action: (user: User) => user.inventory.reloadOrInsertObject(14, {}, 2)
                            },
                            3: {
                                chatMessage: '5 Téléporteurs !!!',
                                action: (user: User) => user.inventory.reloadOrInsertObject(3, {}, 5)
                            },
                            6: {
                                chatMessage: '5 Coeur romantique !!!',
                                action: (user: User) => user.inventory.reloadOrInsertObject(6, {}, 5)
                            },
                            5: {
                                chatMessage: '5 Bombes !!!',
                                action: (user: User) => user.inventory.reloadOrInsertObject(5, {}, 5)
                            }
                        }
                    }
                } else if (type === 2) {
                    let hasWinnerObject = false
                    if (winner.isWinner(2, 1)) {
                        for (const objectId of [83, 81, 84, 87, 99]) {
                            if (!hasWinnerObject) {
                                if (!winner.determineWinnerObject(user, objectId)) {
                                    user.inventory.reloadOrInsertObject(objectId)
                                    message = numberToPhraseMap[objectId]
                                    hasWinnerObject = true
                                }
                            }
                        }
                    }
                    if (giveBBL && !hasWinnerObject) {
                        giveBBL = [100, 150, 200, 300, 400, 500][Math.floor(Math.random() * 6)]
                    } else {
                        initialPowers = {
                            26: {
                                chatMessage: '10 Coeur romantique Or',
                                action: (user: User) => user.inventory.reloadOrInsertObject(26, {}, 10)
                            },
                            16: {
                                chatMessage: '20 Potions de nage rapide !!!',
                                action: (user: User) => user.inventory.reloadOrInsertObject(16, {}, 20)
                            },
                            15: {
                                chatMessage: '20 Potions de saut !!!',
                                action: (user: User) => user.inventory.reloadOrInsertObject(15, {}, 20)
                            },
                            14: {
                                chatMessage: '20 Potions de rapidité !!!',
                                action: (user: User) => user.inventory.reloadOrInsertObject(14, {}, 20)
                            },
                            6: {
                                chatMessage: '15 Coeur romantique !!!',
                                action: (user: User) => user.inventory.reloadOrInsertObject(6, {}, 15)
                            },
                            5: {
                                chatMessage: '25 Coeur !!!',
                                action: (user: User) => user.inventory.reloadOrInsertObject(5, {}, 25)
                            }
                        }
                    }
                } else if (type === 3) {
                    if (user.inventory.getObject(234)) {
                        giveBBL = [3500, 4000, 5000, 5500, 6000, 7000, 8000, 10000][Math.floor(Math.random() * 8)]
                    } else {
                        initialPowers = {
                            234: {
                                chatMessage: 'Le Drapeau Pirate',
                                action: (user: User) => user.inventory.reloadOrInsertObject(234, {}, 1)
                            }
                        }
                    }
                } else if (type === 4) {
                    await global.db.transaction(async (trx: Knex.Transaction): Promise<void> => {
                        if (!await winner.determineWinnerSkin(trx, user, 595)) {
                            try {
                                await winner.insertSkin(trx, user, 595)
                                await trx.commit()
                                message = numberToPhraseMap[595]
                            } catch (error) {
                                await trx.rollback()
                                // return console.error('Transaction failed Siren:', error)
                            }
                        } else {
                            giveBBL = [3500, 4000, 5000, 5500, 6000, 7000, 8000, 10000][Math.floor(Math.random() * 8)]
                        }
                    });
                } else if (type === 5) {
                    await global.db.transaction(async (trx: Knex.Transaction): Promise<void> => {
                        if (!await winner.determineWinnerSkin(trx, user, 596)) {
                            try {
                                await winner.insertSkin(trx, user, 596)
                                await trx.commit()
                                message = numberToPhraseMap[596]
                            } catch (error) {
                                await trx.rollback()
                               // return console.error('Transaction failed Siren:', error)
                            }
                        } else {
                            giveBBL = [3500, 4000, 5000, 5500, 6000, 7000, 8000, 10000][Math.floor(Math.random() * 8)]
                        }
                    });
                }

                if (initialPowers) {
                    winner.addPower(initialPowers)
                    const randomPower = winner.getRandomPower()
                    if (randomPower) {
                        message = randomPower.power.chatMessage
                        winner.handlePower(user, randomPower.power)
                    }
                } else if (!message) {
                    message = `${giveBBL} Blabillons !!!`
                    user.updateBBL(giveBBL, false).then()
                }

                socketMessage.bitWriteUnsignedInt(3, 0)
                socketMessage.bitWriteBoolean(true)
                socketMessage.bitWriteString(message)
                user.interface.addInfoMessage(message)

                pearl.quantity -= nbPearl
                user.inventory.reloadObject(pearl)
            } else {
                socketMessage.bitWriteUnsignedInt(3, 0)
                socketMessage.bitWriteBoolean(false)
            }

            user.userFX.writeChange({
                id: 8,
                data: socketMessage,
                isMap: false,
                isPersistant: false
            })
        }
    }
}

export default Siren