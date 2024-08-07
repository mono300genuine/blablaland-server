import User from "../../../libs/blablaland/User"
import { MapDefinition, SkinEvent } from "../../../interfaces/blablaland"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import Maps from "../../../json/maps.json"

class Spies {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, event: SkinEvent, universeManager: UniverseManager, serverManager: ServerManager): void {
        if (event.type === 0) {  // onTransAction
            user.transform.spies()
        } else if (event.type == 1) { // Teleport
            const mapFound: MapDefinition|undefined = Maps.find((m): boolean => m.id == user.mapId)

            const userId: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
            const userFound: User | undefined = serverManager.getUserById(userId, {
                inConsole: false
            })

            if (userFound && mapFound) {
                const myMap = universeManager.getMapById(user.mapId)
                const mapUser = universeManager.getMapById(userFound.mapId)
                const myMapFound = Maps.find(m => m.id == user.mapId)
                const mapUserFound = Maps.find(m => m.id == user.mapId)

                if (myMap.isSpecial() || mapUser.isSpecial() || myMapFound?.gradeId !== 0 || mapUserFound?.gradeId !== 0)  {
                    return user.interface.addInfoMessage(`Impossible d'inviter ${userFound.pseudo ?? 'ton ami'} !!`)
                }
                const socketMessage: SocketMessage = new SocketMessage()
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
                socketMessage.bitWriteString(user.pseudo)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, user.mapId)
                socketMessage.bitWriteString(mapFound.name)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SKIN_ID, user.skinId)

                userFound.userFX.writeChange({
                    id: 6,
                    data: [8, 33, socketMessage],
                    duration: 120,
                    isPersistant: false,
                    isMap: false
                })
            }
        }
    }
}

export default Spies