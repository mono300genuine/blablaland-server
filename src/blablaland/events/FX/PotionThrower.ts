import User from "../../../libs/blablaland/User"
import { FXEvent } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"

class PotionThrower {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: FXEvent, universeManager: UniverseManager): void {
        for (let FX of universeManager.getMapById(user.mapId).mapFX.getListFX()) {
            if (FX.identifier?.includes(`POTION_THROWER`)) {
                user.transform.potion(FX.data[3])
            }
        }
    }
}

export default PotionThrower