import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import UserDie from "../global/UserDie"

class KillUser {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        const FX_ID: number = packet.bitReadUnsignedInt(4)
        let isProtected: boolean =  false
        let text: string = ``
        let method: number = 7

        if (FX_ID === 1) {
            const unknown: number = packet.bitReadUnsignedInt(16)
            const userId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
            isProtected = packet.bitReadBoolean()
            const userContent: number = packet.bitReadUnsignedInt(8)
            const userFound: User|undefined = serverManager.getUserById(userId, {
                inConsole: false
            })

            if (userFound) {
                isProtected = !isProtected ? user.hasEnemy(userFound.id) : true
                if (userFound.id === user.id) {
                    text = `a été tué par sa propre bobombe :)`
                } else text = `a été tué par une bobombe placée par ${userFound.pseudo} !!`
            } else {
                text = `a été tué par une bobombe placée par un blablateur.`
            }
        } else if (FX_ID === 2) {
            text = `s'est fait griller par un laser !!`
            method = 8
        }

        if (!isProtected && !user.hasFX(4, `26`)) {
            packet = new SocketMessage()
            packet.bitWriteString(text)
            packet.bitWriteUnsignedInt(8, method)
            new UserDie().execute(user, packet, universeManager)
        }
    }
}

export default KillUser