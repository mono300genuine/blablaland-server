import User from "../../../libs/blablaland/User"
import { MapEvent } from "../../../interfaces/blablaland"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import Winner from "../../../libs/blablaland/Winner"
import { Knex } from "knex"

class IrwishToilet {

    /**
     *
     * @param user
     * @param event
     */
    async execute(user: User, event: MapEvent): Promise<void> {
        if (event.type === 0) {
            if (user.gender == 2) {
                user.getCamera()?.gotoMap(344, {
                    method: 1,
                    positionX: 4550,
                    positionY: 35050
                })
            } else {
                user.interface.addInfoMessage(`Vous devez être une fille pour accéder à ces toilettes !`)
            }
        } else if (event.type === 1) {
            if (user.gender == 1) {
                user.getCamera()?.gotoMap(342, {
                    method: 1,
                    positionX: 90750,
                    positionY: 35050
                })
            } else {
                user.interface.addInfoMessage(`Vous devez être un garçon pour accéder à ces toilettes !`)
            }
        } else if (event.type === 3) {
            const socketMessage: SocketMessage = new SocketMessage()
            let reward: number = 4

            if (await user.updateBBL(1, true) > 0) {
                const winner: Winner = new Winner()
                let isWinner: boolean = winner.isWinner(300, 1)
                if (isWinner) {
                    const skinIds: number[] = [553, 554, 555]
                    const objectIds: number[] = [197, 198, 199]

                    const numberToPhraseMap: { [key: number]: string } = {
                        553: "le skin Madame Pipi",
                        554: "le skin \"Racing\" Madame Pipi",
                        555: "le skin \"Ultimate\" Madame Pipi",
                        197: "la monture Laveuse de Supermarché",
                        198: "la monture Laveuse de Supermarché Tuning",
                        199: "le drapeau Madame Pipi"
                    }

                    for (const skinId of skinIds) {
                        if (reward === 4) {
                            await global.db.transaction(async (trx: Knex.Transaction): Promise<void> => {
                                try {
                                    const isWinnerSkin: boolean = await winner.determineWinnerSkin(trx, user, skinId);
                                    if (!isWinnerSkin) {
                                        await winner.insertSkin(trx, user, skinId)
                                        reward = skinId
                                    }
                                    await trx.commit()
                                } catch (error) {
                                    await trx.rollback()
                                    // console.error('Transaction failed IrwishToilet:', error)
                                }
                            });
                        }
                    }
                    if (reward === 4) {
                        for (const objectId of objectIds) {
                            if (reward === 4) {
                                const hasObject: boolean = winner.determineWinnerObject(user, objectId)
                                if (!hasObject) {
                                    user.inventory.reloadOrInsertObject(objectId)
                                    reward = objectId
                                }
                            }
                        }
                    }
                    if (numberToPhraseMap[reward]) {
                        user.interface.addInfoMessage(`${user.pseudo} vient de gagner ${numberToPhraseMap[reward]} !!! :D`, {
                            isMap: true
                        })
                    }
                }

                if (reward === 4) {
                    isWinner = winner.isWinner(5, 1)
                    if (isWinner) {
                        user.inventory.reloadOrInsertObject(4)
                    }
                }
                socketMessage.bitWriteUnsignedInt(3, 1)
                socketMessage.bitWriteBoolean(true)
                socketMessage.bitWriteBoolean(isWinner)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SKIN_ID, reward)

                user.userFX.writeChange({
                    id: 8,
                    data: socketMessage,
                    isMap: false,
                    isPersistant: false
                })
            } else {
                user.interface.addInfoMessage('Pas assez de BBL :(')
            }
        }
    }
}

export default IrwishToilet