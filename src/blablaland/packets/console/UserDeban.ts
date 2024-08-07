import User from "../../../libs/blablaland/User"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"

class UserBan {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (!user.hasRight('FREEPRISON')) return
        const userID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
        const text: string = packet.bitReadString()

        const userFound: User|undefined = serverManager.getUserById(userID, {
            inConsole: false
        })
        if (userFound && !userFound.getCamera()?.mapReady) return

        const userDatabase = await global.db.select('*').from('players').where('user_id', userID).first()
        if (userDatabase) {
            await global.db('players')
                .where('user_id', userID)
                .update({ map_id: 9, experience_ban: 0 })

            await global.db.insert({
                reason: text,
                duration: 0,
                type: 'LIBERE',
                moderator_id: user.id,
                player_id: userDatabase.id,
                created_at: global.db.fn.now(),
                updated_at: global.db.fn.now()
            }).into('punishments')
        }

        if(userFound) {
            userFound.getCamera()?.gotoMap(9, { method: 6 })
        }
    }
}

export default UserBan