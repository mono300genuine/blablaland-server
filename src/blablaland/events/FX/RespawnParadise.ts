import User from "../../../libs/blablaland/User"
import Camera from "../../../libs/blablaland/Camera"
import { ParamsFX } from "../../../interfaces/blablaland"

class RespawnParadise {

    /**
     *
     * @param user
     */
    async execute(user: User): Promise<void> {
        const cameraFound: Camera|undefined = user.getCamera()
        const FX: ParamsFX|undefined = user.hasFX(6, `1`)

        if (cameraFound && FX) {
            user.userFX.dispose(FX)
            if (await user.updateBBL(5, true) > 5) {
                cameraFound.gotoMap(FX.memory, {
                    method: 11
                })
            }
        }
    }
}

export default RespawnParadise