import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import UniverseManager from "../../libs/manager/UniverseManager"
import ServerManager from "../../libs/manager/ServerManager"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"


class SendPresent {

    /**
     * @param user
     * @param item
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager, serverManager: ServerManager): void {
        const userId: number = item.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
        const userFound: User|undefined = serverManager.getUserById(userId, {
            inConsole: false
        })
        if (!userFound) return
        const FX: ParamsFX|undefined = userFound.hasFX(6, `PRESENT_${item.type.id}`)

        let modelColor: number = 1
        let text: undefined|string = undefined
        switch (item.type.id) {
            case 158:
                modelColor = 9
                break
            default:
                modelColor = 10
                break
        }

        const presentList: {[key: number] : string } = {
            157: 'e magnifique rose',
            158: ' morceau de chocolat',
        }


        const socketMessage: SocketMessage = new SocketMessage
        socketMessage.bitWriteUnsignedInt(5, modelColor)
        socketMessage.bitWriteUnsignedInt(5, 3) // heart

        const params: ParamsFX = {
            id: 6,
            sid: FX?.sid ? FX.sid : 0,
            identifier: `PRESENT_${item.type.id}`,
            data: [5, 42, socketMessage],
            duration: 60
        }
        if (presentList[item.type.id]) {
            user.interface.addInfoMessage(`Tu viens d'offrir un${presentList[item.type.id]} à ${userFound.pseudo} !`)
            userFound.interface.addInfoMessage(`Ohh !! ${user.pseudo} t'offre un${presentList[item.type.id]} qui apparait pendant une minute sous ton pseudo !`)
        }

        userFound.userFX.writeChange(params)
        item.database.quantity--
        user.inventory.reloadObject(item.database)
    }
}

export default SendPresent