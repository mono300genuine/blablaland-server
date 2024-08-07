import User from "../../../libs/blablaland/User"
import { ParamsFX, SkinEvent } from "../../../interfaces/blablaland"
import { ObjectDatabase } from "../../../interfaces/database"

class Canon {

    /**
     *
     * @param user
     * @param event
     */
    execute(user: User, event: SkinEvent): void {
        const FX: ParamsFX|undefined = user.hasFX(4, `CANON`)
        if (event.type === 0) {
            if (FX) {
                FX.memory = true
                setTimeout((): void => {
                    const object: ObjectDatabase|undefined = user.inventory.getObject(92)
                    if (FX && object) {
                        user.userFX.dispose(FX)
                        object.quantity--
                        user.inventory.reloadObject(object)
                    }
                }, 2000)
            }
        }
    }
}

export default Canon