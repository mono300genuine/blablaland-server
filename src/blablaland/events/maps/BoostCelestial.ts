import User from "../../../libs/blablaland/User"
import { MapEvent, ParamsFX } from "../../../interfaces/blablaland"
class BoostCelestial {

    /**
     *
     * @param user
     */
    execute(user: User): void {
        let FX: ParamsFX|undefined = user.hasFX(4, `BOOST_CELESTIAL`)
        if (!FX) {
            user.userFX.writeChange({
                id: 4,
                identifier: `BOOST_CELESTIAL`,
                duration: 20,
                data: {
                    walkspeed: 230
                }
            })
        }
    }
}

export default BoostCelestial