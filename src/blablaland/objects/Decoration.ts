import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import UniverseManager from "../../libs/manager/UniverseManager"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"
import House from "../../libs/blablaland/House"

class Decoration {

    /**
     * @param user
     * @param item
     * @param universeManager
     */
    async execute(user: User, item: ObjectDefinition, universeManager: UniverseManager): Promise<void> {
        const userId: number = item.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
        const positionX: number = item.packet.bitReadSignedInt(17)
        const positionY: number = item.packet.bitReadSignedInt(17)
        const surfaceBody: number = item.packet.bitReadUnsignedInt(8)
        const model: number = item.packet.bitReadUnsignedInt(5)

        const map = universeManager.getMapById(user.mapId)
        if (!map.isHouse()) {
            return user.interface.addInfoMessage(`Tu ne peux mettre des décorations que lorsque tu es dans une maison.`)
        } else {
            let house: House|undefined = universeManager.getHouseManager().getHouseById(user.mapId)
            if (house && house.user.id != user.id) {
                return user.interface.addInfoMessage(`Tu ne peux pas mettre de décorations dans la maison de quelqu'un d'autre.`)
            }
        }

        let FX: ParamsFX|undefined = map.hasFX(5, `DECORATION_${item.type.id}`)
        if (!FX) {
            const params: ParamsFX = {
                id: 5,
                identifier: `DECORATION_${item.type.id}`,
                data: [item.type.fxFileId, item.type.id, item.packet],
            }
            map.mapFX.writeChange(user, params)
            await global.db.insert({
                player_id: user.id,
                power_id: item.type.id,
                map_id: map.fileId,
                model: model,
                surfaceBody: surfaceBody,
                direction: user.walker.direction,
                positionX: positionX,
                positionY: positionY,
                created_at: global.db.fn.now(),
                updated_at: global.db.fn.now()
            }).into('decorations')
        } else {
            map.mapFX.dispose(user, FX)
            await global.db('decorations')
                .where('player_id', user.id)
                .where('power_id', item.type.id)
                .where('map_id', map.fileId)
                .delete()
        }
    }
}

export default Decoration