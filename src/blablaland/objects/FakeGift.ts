import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import UniverseManager from "../../libs/manager/UniverseManager"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"

class FakeGift {

    /**
     * @param user
     * @param item
     * @param universeManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager): void {
        const map = universeManager.getMapById(user.mapId)
        if(map.isProtected()) {
            return user.interface.addInfoMessage(`Cette map est protégée contre les faux cadeaux ^^`)
        }

        const dateServer: number = Date.now()
        const socketMessage: SocketMessage = new SocketMessage
        socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
        socketMessage.bitWriteUnsignedInt(10, dateServer % 1000)
        socketMessage.bitWriteUnsignedInt(8, 3)

        let nbFakeGift = 0
        for (let FX of map.mapFX.getListFX()) {
            if (FX.identifier?.includes(`FAKEGIFT`)) {
                nbFakeGift++
            }
        }
        if(nbFakeGift >= 5) return

        const params: ParamsFX = {
            id: 5,
            identifier: `FAKEGIFT`,
            data: [7, 1, socketMessage],
            memory: [3, user.pseudo, nbFakeGift],
            duration: 90
        }
        map.mapFX.writeChange(user,params)
        item.database.quantity--
        user.inventory.reloadObject(item.database)
    }
}

export default FakeGift