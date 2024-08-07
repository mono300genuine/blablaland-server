import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import House from "../../../libs/blablaland/House"

class HouseAction {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param  {UniverseManager} universeManager
     * @returns void
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager): void {
        const mapId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_MAP_ID)
        const type: number = packet.bitReadUnsignedInt(5)

        const house: House|undefined = universeManager.getHouseManager().getHouseById(mapId)
        if (house) {
            house.action(user, packet, mapId, type)
        }
    }
}

export default HouseAction