import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import ServerManager from "../../../libs/manager/ServerManager"

class UserImpact {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param universeManager
     * @param serverManager
     * @returns void
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        const userPID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_PID)
        const FX_ID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_ID)
        const FX_SID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
        const FX_OID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_OID)
        let positionX: number = packet.bitReadSignedInt(17)
        let positionY: number = packet.bitReadSignedInt(17)
        let hasImpact: boolean = packet.bitReadBoolean()

        let userFound: User|undefined = serverManager.getUserByPid(userPID)
        if (!userFound) return

        universeManager.getMapById(user.mapId).mapFX.writeChange(user,{
            id: 3,
            data: [userPID, FX_ID, FX_OID, positionX, positionY, hasImpact],
            isPersistant: false
        })

        if (hasImpact) {
            let color: number[] = []
            let text = ``
            switch (FX_OID) {
                case 1: // Snow
                    color = [58, 58, 58, 58, 58, 58, 58, 58, 58, 58]
                    text = `${user.pseudo} s'est pris une boule de neige lancée par ${userFound.pseudo}.`
                    break
                case 2: // Tomato
                    color = [71, 71, 71, 71, 71, 71, 71, 71, 71, 71]
                    text = `${user.pseudo} s'est pris une tomate pourrie lancée par ${userFound.pseudo}.`
                    break
                case 3: // Sand
                    color = [76, 76, 76, 76, 76, 76, 76, 76, 76, 76]
                    text = `${user.pseudo} s'est pris une boule de sable lancée par ${userFound.pseudo}.`
                    break
                default:
                    break
            }
            if (color.length) {
                user.transform.paint(color)
                user.interface.addInfoMessage(text, {
                    isMap: true
                })
            }
        }

    }
}

export default UserImpact