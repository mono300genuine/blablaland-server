import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties";
import UniverseManager from "../../libs/manager/UniverseManager"
import ServerManager from "../../libs/manager/ServerManager"

class Drink {

    /**
     * @param user
     * @param item
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager, serverManager: ServerManager): void {
        item.packet.bitReadBoolean()
        const isAPresent: boolean = item.packet.bitReadBoolean()

        if (!isAPresent) {
            const FX: ParamsFX|undefined = user.hasFX(6, `DRINK`)
            let nbDrink = FX ? FX.memory : 0

            if (item.type.id === 371) { // Chocolate
                const FXPotion: ParamsFX|undefined = user.hasFX(6, `POTION_370`)
                if (FXPotion) user.userFX.dispose(FXPotion)
                const FXFrozen: ParamsFX|undefined = user.hasFX(6, `FROZEN`)
                if (FXFrozen && FXFrozen.memory >= 10) {
                    user.userFX.dispose(FXFrozen)
                }
            }

            if (item.type.fxFileId === 32) {
                const dateServer: number = Date.now()
                const socketMessage: SocketMessage = new SocketMessage
                socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
                socketMessage.bitWriteUnsignedInt(8, Math.floor(nbDrink))
                socketMessage.bitWriteBoolean(nbDrink >= 230)
                nbDrink = nbDrink + 12.5

                const params: ParamsFX = {
                    id: 6,
                    data: [32, 0, socketMessage],
                    duration: 60,
                    isMap: true
                }
                user.userFX.writeChange(params)

                setInterval(() => {
                    nbDrink = Math.max(nbDrink - 12.5, 0)
                    if (FX) FX.memory = nbDrink
                }, 1000)
            }

            const params: ParamsFX = {
                id: 6,
                data: [item.type.fxFileId, item.type.id],
                identifier: `DRINK`,
                memory: nbDrink,
                duration: 60
            }
            if (FX) user.userFX.dispose(FX)
            user.userFX.writeChange(params)
        } else {
            const userId: number = item.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
            const userFound: User|undefined = serverManager.getUserById(userId, {
                inConsole: false
            })
            if (!userFound) return
            const presentList: {[key: number] : string } = {
                203: 'Élixir de Leprechaun',
                204: 'Sirop de Trèfle',
                205: 'Pinte du Lutin',
                371: 'Chocolat chaud'
            }
            if (!presentList[item.type.id]) return
            user.interface.addInfoMessage(`Tu viens d'offrir un ${presentList[item.type.id]} à ${userFound.pseudo} !`)

            let socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, item.type.id)
            socketMessage.bitWriteString(user.pseudo)
            socketMessage.bitWriteString(`t'offre un ${presentList[item.type.id]} !`)

            userFound.userFX.writeChange({
                id: 6,
                data: [32, 1, socketMessage],
                isMap: false,
                isPersistant: false
            })

            userFound.inventory.reloadOrInsertObject(item.type.id, {
                isSubtraction: false
            })
        }
        item.database.quantity--
        user.inventory.reloadObject(item.database)
    }
}

export default Drink