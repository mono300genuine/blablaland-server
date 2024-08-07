import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import {Packet } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import User from "../../../libs/blablaland/User"
import { AffinityDatabase, MiniMonsterDatabase, UserDatabase } from "../../../interfaces/database"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import Variables from "../../../libs/blablaland/maps/Variables"
import Universe from "../../../libs/network/Universe"
import Respawn from "../../../json/respawn.json"
import Maps from "../../../json/maps.json"
class Login {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        const session: string = packet.bitReadString()

        const userDatabase: UserDatabase = await global.db.select('*').from('users')
                                        .join('players', 'users.id', 'players.user_id')
                                        .join('player_skin', 'players.id', 'player_skin.player_id')
                                        .where('players.skin_id', global.db.raw('player_skin.skin_id'))
                                        .where('players.session', session).first()
        if (userDatabase) {
            const packetSender: Packet = {
                type: 2,
                subType: 1
            }
            user.isTouriste = false
            user.id =  userDatabase.player_id
            user.username = userDatabase.username
            user.pseudo = userDatabase.pseudo
            user.experience = userDatabase.experience
            user.experienceBan = userDatabase.experience_ban
            user.rewarded_at = userDatabase.rewarded_at
            user.spooky_at = userDatabase.spooky_at
            user.secretChat = userDatabase.secret_chat
            user.secretTracker = userDatabase.secret_tracker
            user.gender = userDatabase.gender
            user.grade = userDatabase.grade_id
            user.skinId = userDatabase.skin_id
            user.skinColor = this.convertColor(userDatabase.color)
            user.mapId = userDatabase.map_id
            user.serverId = userDatabase.server_id
            user.walker.positionX = userDatabase.positionX
            user.walker.positionY = userDatabase.positionY
            user.walker.direction = userDatabase.direction
            if (userDatabase.chat_color) {
                user.chatColor = userDatabase.chat_color
            }

            if (user.serverId !== universeManager.getServerId()) {
                const universe: Universe|undefined = serverManager.getUniverseById(user.serverId)
                if (universe) {
                    const variable: Variables = new Variables(user.serverId)
                    user.socketManager.send(variable.getListVariables())
                    user.socketManager.setUniverseManager(universe.universeManager)
                }
            }

            if (userDatabase.clan) {
                user.transform.clan(userDatabase.clan)
            }
            if (userDatabase.shine && user.isModerator()) {
                user.userFX.writeChange({
                    id: 1,
                    identifier: 'SHINE',
                    data: userDatabase.shine,
                    isYourself: true
                })
            }

            const mapFound = Maps.find(m => m.id == user.mapId)
            if (user.experience < user.experienceBan && user.mapId != 10) {
                user.mapId = 10
                user.walker.positionX = 40352
                user.walker.positionY = 24650
            } else if (mapFound && mapFound.gradeId > user.grade || user.mapId === 339 && user.skinId !== 387 || user.mapId >= 1000) {
                user.mapId = 9
                user.walker.positionX = 71534
                user.walker.positionY = 29125
            } else {
               const respawnFound = Respawn.find(map => map.id === user.mapId)
                if (respawnFound) {
                    user.mapId = respawnFound.respawnId
                    user.walker.positionX = respawnFound.respawnX
                    user.walker.positionY = respawnFound.respawnY
                }
            }

            const listObjects = await global.db.select('*').from('player_power')
                                    .where('player_id', user.id)
                                    .orderBy('id', 'asc')
            listObjects.forEach(item => user.inventory.addListObject({ id: item.id, quantity: item.quantity, objectId: item.power_id }))

            const listSmileys = await global.db.select('*').from('player_smiley')
                                    .where('player_id', user.id)
            listSmileys.forEach(item => user.addListPackSmiley(item.smiley_id))

            const listAffinities: AffinityDatabase[] = await global.db.select('sender.id as sender_id', 'receiver.id as receiver_id', 'sender.pseudo as sender_pseudo', 'receiver.pseudo as receiver_pseudo', 'type', 'accepted')
                                    .from('affinities')
                                    .leftJoin('players as receiver', 'receiver_id', 'receiver.id')
                                    .leftJoin('players as sender', 'sender_id', 'sender.id')
                                    .where('sender_id', user.id)
                                    .orWhere('receiver_id', user.id)
            listAffinities.forEach(affinity => this.setAffinity(user, affinity))

            const listMiniMonsters: MiniMonsterDatabase[] = await global.db.select('*')
                .from('mini_monsters')
                .where('player_id', user.id)
            listMiniMonsters.forEach(miniMonster => user.addListMiniMonster({ id: miniMonster.id, objectId: miniMonster.power_id, name: miniMonster.name, typeX: miniMonster.typeX, typeY: miniMonster.typeY, worm: miniMonster.worm, apple: miniMonster.apple, ant: miniMonster.ant }))

            const socketMessage: SocketMessage = new SocketMessage(packetSender)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
            socketMessage.bitWriteString(user.pseudo)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_GRADE, user.grade)
            socketMessage.bitWriteUnsignedInt(32, user.experience)
            user.socketManager.send(socketMessage)

            user.intervalExperience = setInterval(user.setIntervalExperience.bind(user), 80000)
        } else {
            user.socketManager.close(`Session non valide, merci de vous reconnecter au site.`)
        }
    }

    /**
     * @param color
     * @private
     */
    private convertColor(color: string): number[] {
        return color.split(';').map(x => (parseInt(x) - 1))
    }

    /**
     * @param user
     * @param affinity
     */
    setAffinity(user: User, affinity: AffinityDatabase) {
        switch (affinity.type) {
            case 'FRIEND':
                user.addListFriend({
                    userId: affinity.receiver_id != user.id ? affinity.receiver_id : affinity.sender_id,
                    pseudo: affinity.receiver_id != user.id ? affinity.receiver_pseudo : affinity.sender_pseudo,
                    isAccepted: affinity.accepted,
                    isSender: affinity.sender_id === user.id
                })
                break
            case 'WEDDING':
                user.wedding_id = affinity.receiver_id != user.id ? affinity.receiver_id : affinity.sender_id
                break
            case 'BLACKLIST':
                if (affinity.sender_id === user.id) {
                    user.addListEnemy({ userId: affinity.receiver_id, pseudo: affinity.receiver_pseudo })
                }
                break
            default:
                break
        }
    }
}

export default Login