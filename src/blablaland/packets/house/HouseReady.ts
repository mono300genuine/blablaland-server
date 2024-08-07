import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import ServerManager from "../../../libs/manager/ServerManager"
import House from "../../../libs/blablaland/House"

class InitHouse {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param  {UniverseManager} universeManager
     * @param serverManager
     * @returns void
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        const channelId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_CHANNEL_ID)
        const mapId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_MAP_ID)

        const house: House|undefined = serverManager.getUniverseById(user.serverId)?.universeManager.getHouseManager().getHouseById(mapId)
        if (house) {
            house.ready(user, channelId, mapId)
        }
    }
}

export default InitHouse