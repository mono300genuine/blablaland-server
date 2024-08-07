import User from "../../libs/blablaland/User"
import {ObjectDefinition, ParamsFX} from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import { MiniMonsterDatabase } from "../../interfaces/database"

class MiniMonster {

    /**
     * @param user
     * @param item
     */
    async execute(user: User, item: ObjectDefinition): Promise<void> {
        const FX: ParamsFX | undefined = user.hasFX(6, `BLIBLI_${item.type.id}`)
        let miniMonster = user.getListMiniMonster().find(miniMonster => miniMonster.objectId === item.type.id)

        if (!miniMonster) {
            const newMiniMonster: MiniMonsterDatabase = await global.db.select('*')
                .from('mini_monsters')
                .where('player_id', user.id)
                .where('power_id', item.type.id)
                .first()
            if (newMiniMonster) {
                miniMonster = user.addListMiniMonster({
                    id: newMiniMonster.id,
                    objectId: newMiniMonster.power_id,
                    name: newMiniMonster.name,
                    typeX: newMiniMonster.typeX,
                    typeY: newMiniMonster.typeY,
                    worm: newMiniMonster.worm,
                    apple: newMiniMonster.apple,
                    ant: newMiniMonster.ant,
                })
            } else {
                return
            }
        }

        const socketMessage: SocketMessage = new SocketMessage()
        socketMessage.bitWriteUnsignedInt(32, item.database.id ?? 0)
        const evol: number = miniMonster.worm + miniMonster.apple + miniMonster.ant
        
        const sm: SocketMessage = new SocketMessage
        sm.bitWriteUnsignedInt(8, 1)
        sm.bitWriteUnsignedInt(8, 1)
        sm.bitWriteUnsignedInt(8, miniMonster.typeX)
        sm.bitWriteUnsignedInt(8, 2)
        sm.bitWriteUnsignedInt(8, 1)
        sm.bitWriteUnsignedInt(8, miniMonster.typeY)
        sm.bitWriteUnsignedInt(8, 4)
        sm.bitWriteUnsignedInt(8, 2)
        sm.bitWriteUnsignedInt(8, 0)
        sm.bitWriteUnsignedInt(8, evol)
        if (miniMonster.name) {
            sm.bitWriteUnsignedInt(8, 5)
            sm.bitWriteUnsignedInt(8, 0)
            sm.bitWriteString(miniMonster.name)
        }
        sm.bitWriteUnsignedInt(8, 0)
        sm.bitWriteUnsignedInt(8, 0)

        socketMessage.bitWriteBinaryData(sm)

        if (!FX) {
            const listBlibli: ParamsFX[] = user.userFX.getListFX().filter((FX: ParamsFX) => FX.identifier?.includes('BLIBLI_'))
            if (listBlibli.length >= 2) {
                if (user.skinId != 387 || listBlibli.length >= 3) {
                    user.userFX.dispose(listBlibli[0])
                }
            }

            user.userFX.writeChange({
                id: 6,
                data: [item.type.fxFileId, item.type.id, socketMessage],
                identifier: `BLIBLI_${item.type.id}`,
                isMap: true
            })
        } else {
            user.userFX.dispose(FX)
        }
    }
}

export default MiniMonster