import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import UniverseManager from "../../libs/manager/UniverseManager"
import ServerManager from "../../libs/manager/ServerManager"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"

class AprilFish {

    /**
     * @param user
     * @param item
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager, serverManager: ServerManager): void {
        const userPID: number = item.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_PID)
        const color: number = item.packet.bitReadUnsignedInt(16)

        const userFound: User|undefined = serverManager.getUserByPid(userPID)
        if (userPID && userFound) {
            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteSignedInt(16, color)

            const params: ParamsFX = {
                id: 6,
                data: [item.type.fxFileId, item.type.id, socketMessage],
                duration: 1200
            }
            userFound?.userFX.writeChange(params)

            user.interface.addInfoMessage(`${user.pseudo} vient de coller un poisson d'avril dans le dos de ${userFound?.pseudo} :D`, {
               isMap: true,
               isWarning: false,
               except: userFound
            })

            item.database.quantity--
            user.inventory.reloadObject(item.database)
        }
    }
}

export default AprilFish