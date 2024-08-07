import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import Universe from "../../../libs/network/Universe"
import Map from "../../../libs/blablaland/Map"
import { Packet } from "../../../interfaces/blablaland"

class MapCount {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        const serverId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SERVER_ID)
        const universe: Universe|undefined = serverManager.getUniverseById(serverId)
        if (universe) {
            let packetSender: Packet = {
                type: 1,
                subType: 8
            }
            let socketMessage: SocketMessage = new SocketMessage(packetSender)
            while (packet.bitReadBoolean()) {
                let mapId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_MAP_ID)
                let map: Map|undefined = universe.universeManager.getMapById(mapId)

                socketMessage.bitWriteBoolean(true)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, mapId)

                if (map) {
                    let nbUser: number = 0
                    for (let user of map.getListUser()) {
                        if (!user.inConsole && user.getCamera()) nbUser++
                    }
                    socketMessage.bitWriteUnsignedInt(10, nbUser)
                } else {
                    socketMessage.bitWriteUnsignedInt(10, 0)
                }
            }
            socketMessage.bitWriteBoolean(false)
            user.socketManager.send(socketMessage)
        }
    }
}

export default MapCount