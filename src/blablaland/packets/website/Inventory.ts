import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import universeManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import { ObjectDatabase } from "../../../interfaces/database"

class Inventory {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param  {UniverseManager} universeManager
     * @param  {ServerManager} serverManager
     * @returns void
     */
    execute(user: User, packet: SocketMessage, universeManager: universeManager, serverManager: ServerManager): void {
        let userID: number = packet.bitReadUnsignedInt(24)
        let databaseId: number = packet.bitReadUnsignedInt(32)
        let objectId: number = packet.bitReadUnsignedInt(32)
        let quantity: number = packet.bitReadUnsignedInt(32)
        let sendBBL: boolean = packet.bitReadBoolean()

        const userFound: User|undefined = serverManager.getUserById(userID, {
            inConsole: false
        })
        if (!userFound) return

        const objectFound: ObjectDatabase|undefined = userFound.inventory.getObject(objectId)
        if (objectFound) objectFound.quantity = quantity
        userFound.inventory.reloadObject({ id: databaseId, objectId: objectId, quantity: quantity }, {
            isUpdate: false
        })
        if (sendBBL) {
            userFound.socketManager.send(new SocketMessage({ type: 2, subType: 13 }))
        }
    }
}

export default Inventory