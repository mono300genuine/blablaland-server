import User from "../../../libs/blablaland/User"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import NavalBattleManager from "../../../libs/manager/NavalBattleManager"
import NavalBattle from "../../../libs/blablaland/games/NavalBattle/NavalBattle"
import TrackerUser from "../../../libs/blablaland/tracker/TrackerUser"

class UserBan {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (!user.isModerator()) return
        const userID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
        packet.bitReadBoolean()
        const text: string = packet.bitReadString()
        let duration: number = packet.bitReadUnsignedInt(16)
        let experience: number = 0

        if (duration >= 999 && user.hasRight('MASSBAN')) {
            duration = 99999999
        }

        const userFound: User|undefined = serverManager.getUserById(userID, {
            inConsole: false
        })
        if (userFound && !userFound.getCamera()?.mapReady) {
            return
        }

        const userDatabase = await global.db.select('*').from('players').where('user_id', userID).first()
        if (userDatabase) {
            experience = userFound ? userFound.experience : userDatabase.experience

            await global.db('players')
                .where('user_id', userID)
                .update({
                    reason_ban: `${user.username} t'envoie en prison => ${duration}mn de prison : ${text}`,
                    experience_ban: experience +  (duration + (duration * 0.2))
                })

            await global.db.insert({
                reason: text,
                duration: duration,
                type: 'BAN',
                moderator_id: user.id,
                player_id: userDatabase.id,
                created_at: global.db.fn.now(),
                updated_at: global.db.fn.now()
            }).into('punishments')
        }

        if(userFound) {
            experience = userFound ? userFound.experience : userDatabase.experience
            userFound.experienceBan = experience + (duration + (duration * 0.2))

            for (let item of serverManager.getListUserConsole()) {
                for (let instance of item.tracker.getListInstance()) {
                    let userTracker: TrackerUser|undefined = item.tracker.getInstanceByUser(instance, userFound)
                    if (userTracker) {
                        item.tracker.sendPrivateMessage(instance, userTracker, `${user.username} t'envoie en prison => ${duration}mn de prison : ${text}`, {
                            isHtmlEncode: true,
                            isReceived: true,
                            pseudo: user.username
                        })
                    }
                }
            }

            userFound.interface.addInfoMessage(`${userFound.pseudo} a été mis en prison par ${user.username}.`, {
                isMap: true
            })
            userFound.interface.addUserMessage(`${user.username} t'envoie en prison => ${duration}mn de prison : ${text}`, {
                userId: 0,
                userPseudo: 'GRAND SAGE',
                isModo: true
            })

            userFound.getCamera()?.gotoMap(10, { method: 6 })

            const navalBattleManager: NavalBattleManager = serverManager.getNavalBattleManager()
            const listNavalBattle: NavalBattle[]|undefined = navalBattleManager.getListNavalBattleByUser(user)
            if (listNavalBattle) {
                for (let navalBattle of listNavalBattle) {
                    navalBattle.close(user, 5)
                    navalBattleManager.removeNavalBattleByGameId(navalBattle.id)
                }
            }
        }
    }
}

export default UserBan