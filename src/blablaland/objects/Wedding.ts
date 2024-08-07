import User from "../../libs/blablaland/User"
import UniverseManager from "../../libs/manager/UniverseManager"
import ServerManager from "../../libs/manager/ServerManager"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"
import {MapDefinition, ObjectDefinition} from "../../interfaces/blablaland"
import Camera from "../../libs/blablaland/Camera"
import Maps from "../../json/maps.json"

class Wedding {

    /**
     * @param user
     * @param item
     * @param universeManager
     * @param serverManager
     */
   async execute(user: User, item: ObjectDefinition, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        const type: number = item.packet.bitReadUnsignedInt(3)
        const socketMessage: SocketMessage = new SocketMessage()
        socketMessage.bitWriteUnsignedInt(3, type)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)

        if (type === 0) { // Send
            const userId: number = item.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
            const userFound: User | undefined = serverManager.getUserById(userId, {
                inConsole: false
            })
            if (userFound && userFound.wedding_id == 0 && user.wedding_id == 0
            && userFound.id != user.id) {
                socketMessage.bitWriteString(user.pseudo)
                userFound.userFX.writeChange({
                    id: 6,
                    data: [item.type.fxFileId, item.type.id, socketMessage],
                    isPersistant: false,
                    isMap: false
                })
                user.interface.addInfoMessage(`Demande d'union transmise à ${userFound.pseudo} !`)
            }
        } else if (type === 2) { // Teleport
            const userFound: User|undefined = serverManager.getUserById(user.wedding_id, {
                inConsole: false
            })
            if (!userFound) {
                return
            }
            const cameraFound: Camera|undefined = userFound.getCamera()
            if (cameraFound && cameraFound.mapReady) {
                const mapFound: MapDefinition|undefined = Maps.find((m): boolean => m.id == cameraFound.currMap)
                const map = universeManager.getMapById(cameraFound.currMap)

                if (map.isSpecial() || mapFound && user.grade < mapFound.gradeId) {
                    return user.interface.addInfoMessage(`Impossible de rejoindre ${userFound?.pseudo ?? 'ton ami'} !!`)
                } else {
                    user.getCamera()?.gotoMap(cameraFound.currMap, {
                        serverId: cameraFound.user.serverId != user.serverId ? cameraFound.user.serverId : undefined
                    })
                }
            }
        } else if (type === 3) { // Remove
            if (!user.wedding_id) return

            const affinity: number = await global.db('affinities')
                .where('type', 'WEDDING')
                .andWhere(function () {
                    this.where('sender_id', user.wedding_id)
                        .orWhere('receiver_id', user.wedding_id);
                })
                .delete();
            if (!affinity) return

            const userFound: User|undefined = serverManager.getUserById(user.wedding_id, {
                inConsole: false
            })
            if (userFound) {
                userFound.wedding_id = 0
                userFound.inventory.reloadOrInsertObject(109, {
                    isSubtraction: true
                })
            }
            user.wedding_id = 0
            user.inventory.reloadOrInsertObject(109, {
                isSubtraction: true
            })
        }
    }
}

export default Wedding