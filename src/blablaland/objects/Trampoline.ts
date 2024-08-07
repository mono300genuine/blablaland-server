import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import UniverseManager from "../../libs/manager/UniverseManager"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"

class Trampoline {

    /**
     * @param user
     * @param item
     * @param universeManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager): void {
        const positionX: number = item.packet.bitReadSignedInt(17)
        const positionY: number = item.packet.bitReadSignedInt(17)
        let nbTrampoline: number = 0
        let nbSupperoposed: number = 0
        let params: ParamsFX = {}

        const map = universeManager.getMapById(user.mapId)
        const socketMessage: SocketMessage = new SocketMessage()
        socketMessage.bitWriteUnsignedInt(2, 0)
        socketMessage.bitWriteSignedInt(17, positionX)
        socketMessage.bitWriteSignedInt(17, positionY)

        for (let FX of map.mapFX.getListFX()) {
            if (FX.identifier?.includes(`TRAMPOLINE`)) {
                const [posX, posY, nbSup]: [number, number, number] = FX.memory
                if (positionX <= posX + 60 &&
                    positionX >= posX - 60 &&
                    positionY <= posY + 60 &&
                    positionY >= posY - 60) {
                    params.sid = FX.sid
                    nbSupperoposed = FX.memory[2] += 1
                    socketMessage.bitWriteUnsignedInt(4, nbSupperoposed)
                }
                nbTrampoline++
            }
        }
        if (nbTrampoline >= 5) return
        params = {
            id: 5,
            sid: params.sid,
            identifier: `TRAMPOLINE`,
            data: [item.type.fxFileId, item.type.id, socketMessage],
            memory: [positionX, positionY, nbSupperoposed],
            duration: 60
        }
        map.mapFX.writeChange(user, params)
        item.database.quantity--
        user.inventory.reloadObject(item.database)
    }
}

export default Trampoline