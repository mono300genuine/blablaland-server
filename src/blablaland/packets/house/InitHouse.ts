import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import House from "../../../libs/blablaland/House"

class InitHouse {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param  {UniverseManager} universeManager
     * @returns void
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager): void {
        const houseId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_MAP_ID)
        const house: House|undefined = universeManager.getHouseManager().getHouseById(houseId)
        if (house) {
            house.init(user)
        }
    }
}

export default InitHouse