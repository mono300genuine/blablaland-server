import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import House from "../../../libs/blablaland/House"

class EnterHouse {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param  {UniverseManager} universeManager
     * @param  {ServerManager} serverManager
     * @returns void
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        const houseId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_MAP_ID)
        const type: number = packet.bitReadUnsignedInt(5)

        const house: House|undefined = universeManager.getHouseManager().getHouseById(houseId)
        if (house) {
            house.params(user, packet, type, serverManager)
        }
    }
}

export default EnterHouse