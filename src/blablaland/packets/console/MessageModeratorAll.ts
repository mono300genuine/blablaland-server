import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import User from "../../../libs/blablaland/User"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import ServerManager from "../../../libs/manager/ServerManager"
import Camera from "../../../libs/blablaland/Camera"

class MessageModeratorAll {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param  {UniverseManager} universeManager
     * @param  {ServerManager} serverManager
     * @returns void
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        if (!user.hasRight('MSGALLMAP')) return
        const serverIdMsg: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SERVER_ID)
        const isHtml: boolean = packet.bitReadBoolean()
        const text: string = packet.bitReadString()
        const isAllUnivers: boolean = packet.bitReadBoolean()

        const processedUserPidsByMap: { [serverId: string]: { [map: string]: Set<number> } } = {}

        for (const camera of serverManager.getListCamera()) {
            const { currMap, serverId } = camera;

            processedUserPidsByMap[serverId] ??= {};
            processedUserPidsByMap[serverId][currMap] ??= new Set<number>();

            if ((!processedUserPidsByMap[serverId][currMap].has(camera.user.pid)) && (isAllUnivers || camera.serverId === serverIdMsg)) {
                camera.user.interface.addLocalMessage(text, {
                    userId: user.id,
                    userPID: user.pid,
                    mapId: camera.currMap,
                    serverId: camera.serverId,
                    userPseudo: user.pseudo,
                    isHtml: isHtml,
                    isMap: false,
                    isModo: true,
                })

                processedUserPidsByMap[serverId][currMap].add(camera.user.pid)
            }
        }
    }
}

export default MessageModeratorAll