import User from "../../../libs/blablaland/User"
import {FXEvent, ParamsFX} from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"

class Fish {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: FXEvent, universeManager: UniverseManager): void {
        const currentDate: Date = new Date()
        const startDate: Date = new Date(currentDate.getFullYear(), 2, 31, 18) // 31 mars
        const endDate: Date = new Date(currentDate.getFullYear(), 3, 9, 21) // 9 avril

        if ((currentDate >= startDate && currentDate <= endDate)) {
            if (!universeManager.getMapById(user.mapId).isGame()) {
                user.transform.fish()
            }
        } else {
            const FX: ParamsFX|undefined = user.hasFX(4, '13')
            if (FX) {
                user.userFX.dispose(FX)
            }
        }
    }
}

export default Fish