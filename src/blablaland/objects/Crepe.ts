import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../libs/manager/UniverseManager"
import ServerManager from "../../libs/manager/ServerManager"

class Crepe {

    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager, serverManager: ServerManager) {
        const unknown: boolean = item.packet.bitReadBoolean()
        const isAPresent: boolean = item.packet.bitReadBoolean()
        if (!isAPresent) {
            const FX: ParamsFX|undefined = user.hasFX(6, `CREPE`)
            if (!FX) {
                const params : ParamsFX = {
                    id: 6,
                    identifier: `CREPE`,
                    data: [item.type.fxFileId, item.type.id],
                    duration: 60
                }
                user.userFX.writeChange(params)
                user.inventory.reloadObject(item.database)
            }
        } else {
            const userId: number = item.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
            const userFound: User|undefined = serverManager.getUserById(userId, {
                inConsole: false
            })
            if (!userFound) return
            const presentList: {[key: number] : string } = {
                222: 'Crêpe',
            }
            if (!presentList[item.type.id]) return
            user.interface.addInfoMessage(`Tu viens d'offrir une ${presentList[item.type.id]} à ${userFound.pseudo} !`)

            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, item.type.id)
            socketMessage.bitWriteString(user.pseudo)
            socketMessage.bitWriteString(`t'offre une ${presentList[item.type.id]} !`)

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

export default Crepe