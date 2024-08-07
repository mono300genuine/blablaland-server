import User from "../../../libs/blablaland/User"
import { ParamsFX } from "../../../interfaces/blablaland"

class NecroHit {

    /**
     *
     * @param user
     */
    execute(user: User): void {
        const FX: ParamsFX|undefined = user.hasFX(6, `NECRO_HIT`)
        if (!FX) {
            let params: ParamsFX = {
                id: 6,
                identifier: `NECRO_HIT`,
                data: [34, 3],
                duration: 20
            }
            user.userFX.writeChange(params)
        }
    }
}

export default NecroHit