import User from "../../../libs/blablaland/User"
import { SkinEvent } from "../../../interfaces/blablaland"
import Maps from "../../../json/maps.json"

class FlyingSaucer {

    /**
     *
     * @param user
     */
    execute(user: User): void {
        const mapFound = Maps.find(m => m.id == user.mapId)
        user.getCamera()?.gotoMap(mapFound?.planetId == 1 ? 9 : 408, { method: 14 })
    }
}

export default FlyingSaucer