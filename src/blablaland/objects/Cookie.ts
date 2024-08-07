import User from "../../libs/blablaland/User"
import UniverseManager from "../../libs/manager/UniverseManager"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import ServerManager from "../../libs/manager/ServerManager"
import Winner, { Power, PowerWithKey } from "../../libs/blablaland/Winner"
import { Knex } from "knex"

class Cookie {

    private initialPowers: { [key: number]: Power } = {
        1: { chatMessage: 'Mmh, bonne racine !', popupMessage: 'Tu gagnes une graine de rose, de tulipe et de lys', action: (user: User) => {
                user.inventory.reloadOrInsertObject(183, { isSubtraction: false })
                user.inventory.reloadOrInsertObject(184, { isSubtraction: false })
                user.inventory.reloadOrInsertObject(182, { isSubtraction: false })
            }
        },
        2: { chatMessage: 'C\'est avec des cailloux que l\'on construit une montagne', popupMessage: 'Tu gagnes 10 Blabillons',action: (user: User) => user.updateBBL(10, false).then() },
        4: { chatMessage: 'Tu as de la confiture sur le visage, essuie-toi !', popupMessage: 'Tu gagnes 3 lingettes', action: (user: User) => user.inventory.reloadOrInsertObject(4, { isSubtraction: false }, 3) },
        5: { chatMessage: 'Un tempérament explosif que tu as !', popupMessage: 'Tu gagnes une bombe', action: (user: User) => user.inventory.reloadOrInsertObject(5, { isSubtraction: false }) },
        13: { chatMessage: 'Trop mangé sûrement tu as... ton transit semble délicat !', popupMessage: 'Tu gagnes un flageolet magique', action: (user: User) => user.inventory.reloadOrInsertObject(13, { isSubtraction: false }) },
        14: { chatMessage: 'Rien ne sert de courir, mais c\'est tellement mieux !', popupMessage: 'Effet potion Rapidité', action: (user: User) => user.transform.potion(14) },
        82: { chatMessage: 'La richesse éclate au visage de qui la traque', popupMessage: 'Tu gagnes un faux cadeau', action: (user: User) => user.inventory.reloadOrInsertObject(82, { isSubtraction: false }) },
        85: { chatMessage: 'Léger comme l\'air te voilà !', popupMessage: 'Tu gagnes une bulle de savon', action: (user: User) => user.inventory.reloadOrInsertObject(85, { isSubtraction: false }) },
        15: { chatMessage: 'Le plus haut point, à la portée il sera maintenant', popupMessage: 'Effet potion Saut', action: (user: User) => user.transform.potion(15) },
        162: { chatMessage: 'Le vent souffle, mais solide comme un roc tu seras', popupMessage: 'Effet potion Pierre', action: (user: User) => user.transform.potion(162) },
        165: { chatMessage: 'La Foudre, maîtriser tu vas !', popupMessage: 'Effet potion Foudre', action: (user: User) => user.transform.potion(165) },
    }

    /**
     * @param user
     * @param item
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, item: ObjectDefinition, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        const isAPresent: boolean = item.packet.bitReadBoolean()

        if (isAPresent) {
            const userId: number = item.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
            const userFound: User|undefined = serverManager.getUserById(userId, {
                inConsole: false
            })
            if (!userFound) return
            user.interface.addInfoMessage(`Tu viens d'offrir un Fortune Cookie !`)

            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, item.type.id)
            socketMessage.bitWriteString(user.pseudo)
            socketMessage.bitWriteString(`t'offre un Fortune Cookie !`)

            userFound.userFX.writeChange({
                id: 6,
                data: [32, 1, socketMessage],
                isMap: false,
                isPersistant: false
            })

            userFound.inventory.reloadOrInsertObject(item.type.id, {
                isSubtraction: false
            })
        } else {
            const winner: Winner = new Winner(this.initialPowers)

            const isWinner: boolean = winner.isWinner(300, 1) // 1 sur 300
            const socketMessage: SocketMessage = new SocketMessage()

            socketMessage.bitWriteUnsignedInt(4, isWinner ? 1 : 0) // Display pop-up
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)

            if (isWinner) {
                await global.db.transaction(async (trx: Knex.Transaction): Promise<void> => {
                    try {
                        const winName: string = await this.determineWinnerSkin(user, winner, trx)
                        socketMessage.bitWriteString(`Tu a trouvé ${winName} !!!`)
                        await trx.commit()
                    } catch (error) {
                        await trx.rollback()
                        // return console.error('Transaction failed Cookie:', error)
                    }
                });
            } else {
                const randomPower: PowerWithKey|null = winner.getRandomPower()
                if (randomPower) {
                    this.handlePower(user, randomPower.power)
                }
            }

            const params: ParamsFX = {
                id: 6,
                data: [item.type.fxFileId, item.type.id, socketMessage],
                isPersistant: false
            }

            user.userFX.writeChange(params)
        }
        item.database.quantity--
        user.inventory.reloadObject(item.database)
    }

    async determineWinnerSkin(user: User, winner: Winner, trx: Knex.Transaction): Promise<string> {
        let winName: string = `le Sage Chinois [Collector]`
        const chineseSageId: boolean = await winner.determineWinnerSkin(trx, user, 574)

        if (!chineseSageId) {
            await winner.insertSkin(trx, user, 574)
        } else {
            winName = `le Maître Samouraï [Collector]`
            const chineseMasterId: boolean = await winner.determineWinnerSkin(trx, user, 575)

            if (!chineseMasterId) {
                await winner.insertSkin(trx, user, 575)
            } else {
                winName = `1000 Blabillons`
                await user.updateBBL(1000, false)
            }
        }
        return winName
    }

    /**
     * @param user
     * @param power
     * @private
     */
    private handlePower(user: User, power: Power): void {
        if (power) {
            if (power.popupMessage) {
                this.popupCookie(user, power.chatMessage, power.popupMessage)
            }
            if (power.action) {
                power.action(user)
            }
        }
    }

    /**
     *
     * @param user
     * @param chatMessage
     * @param popupMessage
     * @private
     */
    private popupCookie(user: User, chatMessage: string, popupMessage: string): void {
        user.interface.addInfoMessage(chatMessage)
        user.interface.addInfoMessage(popupMessage)

        const socketMessage: SocketMessage = new SocketMessage()
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, 217)
        socketMessage.bitWriteString('')
        socketMessage.bitWriteString(popupMessage)

        user.userFX.writeChange({
            id: 6,
            data: [32, 1, socketMessage],
            isMap: false,
            isPersistant: false
        })
    }
}

export default Cookie
