import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import DungeonManager from "../../../libs/manager/DungeonManager"
import Dungeon from "../../../libs/blablaland/games/Dungeon/Dungeon"

class MedievalFantasy {

    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        const type: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_STYPE)
        const dungeonManager: DungeonManager = universeManager.getDungeonManager()
        const dungeonUser: Dungeon|undefined = dungeonManager.getDungeonByUser(user)


        if (type === 1) { // startLuncher
            if (!dungeonUser) {
                dungeonManager.setLastDungeonId()
                const dungeon: Dungeon = new Dungeon(dungeonManager.getLastDungeonId(), user)
                dungeonManager.addListDungeon(dungeon)
                dungeon.create(user, 0)
            } else {
                dungeonUser.create(user, 1)
            }
        } else if (type === 2) { // onLuncherKill
            if (dungeonUser && !universeManager.getMapById(user.mapId).isDungeon()) {
                dungeonManager.removeDungeon(dungeonUser)
            }
        } else if (type === 3) { // luncherStart
            const dungeon: Dungeon|undefined = dungeonManager.getDungeonByOwner(user)
            if (dungeon) {
                const getLastPrivateMapId: number = universeManager.getLastPrivateMapId()
                const map = universeManager.getMapById(getLastPrivateMapId + 1, 499, true)
                dungeon.launch(map.id)
            }
        } else if (type === 4) { // onLuncherInvitUser
            const userId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
            const userFound: User|undefined = serverManager.getUserById(userId, {
                inConsole: false
            })
            if (userFound && !dungeonManager.getDungeonByUser(userFound)) {
                dungeonManager.getDungeonByOwner(user)?.sendInvite(userFound)
            }
        } else if (type === 5) { // sendGuestAnswer
            const gameId: number = packet.bitReadUnsignedInt(32)
            const dungeon: Dungeon|undefined = dungeonManager.getDungeonByGameId(gameId)
            if (dungeon) {
                dungeon.responseInvite(user, packet)
            }
        } else if (type === 7) { // onKillGuest
            const userId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
            const userFound: User|undefined = serverManager.getUserById(userId, {
                inConsole: false
            })
            if (userFound) {
                const dungeon: Dungeon|undefined = dungeonManager.getDungeonByOwner(user)
                if (dungeon) {
                    dungeon.removeInvite(userFound)
                }
            }
        } else if (type === 8) { // onInteractivEvent
            dungeonUser?.onInteractivEvent(user)
        } else if (type === 9) { // xmlEvt
            dungeonUser?.onStart(user)
        } else if (type === 10) {
            dungeonUser?.reloadHUD(user)
        } else if (type === 11) { //onHudQuitConfirm
            dungeonUser?.leave(user)
        } else if (type === 12) { // giveRaytHit
            dungeonUser?.hitMonster(user, packet)
        } else if (type === 13) { // sendHitUser
            dungeonUser?.hitUser(user, packet)
        } else if (type === 14) { // activSpecial
            dungeonUser?.activSpecial(user, packet)
        } else if (type === 15) { // object
            dungeonUser?.object(user, packet)
        }
    }
}

export default MedievalFantasy