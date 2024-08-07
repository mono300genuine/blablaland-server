import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { MiniMonster as Monster, Packet, ParamsFX } from "../../../interfaces/blablaland"
import { MiniMonsterDatabase } from "../../../interfaces/database"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
class BlibliMonster {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (!user.hasRight('UPDATEPSEUDO')) return
        const type: number = packet.bitReadUnsignedInt(8)
        const channelId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_CHANNEL_ID)
        const dateServer: number = Date.now()

        const packetSender: Packet = {
            type: 1,
            subType: 16
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CHANNEL_ID, channelId)
        socketMessage.bitWriteUnsignedInt(8, type)

        if (type === 1) {
            const name: string = packet.bitReadString()

            const miniMonsters: MiniMonsterDatabase[] = await global.db.select('*')
                .from('mini_monsters')
                .where('name', 'like', `${name}%`)

            if (miniMonsters) {
                socketMessage.bitWriteUnsignedInt(8, 0)
                for (let miniMonster of miniMonsters) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteUnsignedInt(32, miniMonster.player_id)
                    socketMessage.bitWriteUnsignedInt(32, miniMonster.power_id)
                    socketMessage.bitWriteString(miniMonster.name)
                    socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
                }
                socketMessage.bitWriteBoolean(false)
            } else {
                socketMessage.bitWriteUnsignedInt(8, 1)
            }
            user.socketManager.send(socketMessage)
        } else if (type === 2) {
            const userId: number = packet.bitReadUnsignedInt(32)
            const bddId: number = packet.bitReadUnsignedInt(32)

            const miniMonster: MiniMonsterDatabase = await db.select('*')
                .from('mini_monsters')
                .where('player_id', userId)
                .where('power_id', bddId)
                .first()

            if (miniMonster) {
                await global.db.insert({
                    reason: `Reset Blibli Monstre (${miniMonster.name})`,
                    duration: 0,
                    type: 'INFO',
                    moderator_id: user.id,
                    player_id: userId,
                    created_at: global.db.fn.now(),
                    updated_at: global.db.fn.now()
                }).into('punishments')

                await global.db('mini_monsters')
                    .where('player_id', userId)
                    .where('power_id', bddId)
                    .update({ name: null })

                socketMessage.bitWriteUnsignedInt(8, 0)
                socketMessage.bitWriteUnsignedInt(32, bddId)
                const userFound: User|undefined = serverManager.getUserById(userId, {
                    inConsole: false
                })

                if (userFound) {
                    const FX: ParamsFX|undefined = userFound.hasFX(6, `BLIBLI_${bddId}`)
                    if (FX) {
                        const miniMonster: Monster|undefined = userFound.getListMiniMonster()
                            .find((miniMonster: Monster): boolean => miniMonster.objectId === bddId)
                        if (miniMonster) {
                            miniMonster.name = 'MINI-MONSTRE'
                            userFound.userFX.dispose(FX)
                        }
                    }
                    socketMessage.bitWriteBoolean(!!FX)
                }
            } else {
                socketMessage.bitWriteUnsignedInt(8, 1)
            }
            user.socketManager.send(socketMessage)
        }
    }
}

export default BlibliMonster