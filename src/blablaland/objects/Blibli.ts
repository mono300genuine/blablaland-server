import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import UniverseManager from "../../libs/manager/UniverseManager"
import ServerManager from "../../libs/manager/ServerManager"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"
import Binary from "../../libs/blablaland/network/Binary"

class Blibli {

    /**
     * @param user
     * @param item
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager, serverManager: ServerManager): void {
        let type: number = item.packet.bitReadUnsignedInt(2)
        const FX: ParamsFX|undefined = user.hasFX(6, `BLIBLI_${item.type.id}`)
        const map = universeManager.getMapById(user.mapId)

        switch (type) {
            case 0:
                if (!FX) {
                    const listBlibli: ParamsFX[] = user.userFX.getListFX().filter((FX: ParamsFX) => FX.identifier?.includes('BLIBLI_'))
                    if (listBlibli.length >= 2) {
                        if (user.skinId != 387 || listBlibli.length >= 3) {
                            user.userFX.dispose(listBlibli[0])
                        }
                    }
                    const color: number = item.packet.bitReadUnsignedInt(5)
                    const socketMessage: SocketMessage = new SocketMessage
                    socketMessage.bitWriteUnsignedInt(5, color)

                    const params: ParamsFX = {
                        id: 6,
                        data: [item.type.fxFileId, item.type.id],
                        identifier: `BLIBLI_${item.type.id}`,
                        memory: item.type.id,
                        isPersistant: true,
                    }
                    if (color !== 0 || item.type.id === 375) {
                        params.data.push(socketMessage)
                    }
                    user.userFX.writeChange(params)
                } else {
                    user.userFX.dispose(FX)
                }
                break
            case 1:
                break
            case 2:
                if (FX) {
                    user.userFX.dispose(FX)
                }
                break
            case 3:
                type = item.packet.bitReadUnsignedInt(2)
                const socketMessage: Binary = item.packet.bitReadBinaryData()

                if (type == 0) {
                    user.userFX.writeChange({
                        id: 6,
                        data: [item.type.fxFileId, item.type.id, socketMessage],
                        identifier: `BLIBLI_${item.type.id}`,
                        isPersistant: false,
                        isMap: true
                    })
                } else if (type == 1) {
                    const userPID: number = socketMessage.bitReadUnsignedInt(GlobalProperties.BIT_USER_PID)
                    const userFound: User|undefined = serverManager.getUserByPid(userPID)
                    if (userFound && !map.isProtected() && !userFound.hasEnemy(user.id)) {
                        switch (item.type.id) {
                            case 38:
                                userFound.transform.alien()
                                break
                            case 101:
                                userFound.transform.easterEgg()
                                break
                            default:
                                break
                        }
                    }
                }
                break
            default:
                break
        }
    }
}

export default Blibli