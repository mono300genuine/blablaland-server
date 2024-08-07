import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import { exec } from "child_process"

class UserSearch {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (!user.hasRight('ADVACCESS')) return
        const text: string = packet.bitReadString()
        const isReboot: boolean = packet.bitReadBoolean()

        for (let item of serverManager.getListUser()) {
            item.socketManager.close(text)
        }
        if (isReboot) {
            exec(process.env.CMD_REBOOT ?? 'pm2 restart blablaland')
        } else {
            exec(process.env.CMD_REBOOT ?? 'pm2 stop blablaland')
        }
    }
}

export default UserSearch