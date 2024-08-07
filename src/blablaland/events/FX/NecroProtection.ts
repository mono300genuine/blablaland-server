import User from "../../../libs/blablaland/User"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import {FXEvent, ParamsFX} from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"

class NecroProtection {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: FXEvent, universeManager: UniverseManager): void {
        const FX_SID: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
        const map = universeManager.getMapById(user.mapId)
        const FX: ParamsFX|undefined = map.mapFX.getListFX().find(FX => FX.sid === FX_SID && FX.id === 5)
        if (FX) {
            map.mapFX.dispose(user, FX)
        }
    }
}

export default NecroProtection