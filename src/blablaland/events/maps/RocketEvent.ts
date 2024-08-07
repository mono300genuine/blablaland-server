import User from "../../../libs/blablaland/User"
import Camera from "../../../libs/blablaland/Camera"

class RocketEvent {

    /**
     *
     * @param user
     */
    execute(user: User): void {
        const cameraFound: Camera|undefined = user.getCamera()
        if (cameraFound) {
            const mapTeleport: number = cameraFound.prevMap == 408 ? 445 : 408
            cameraFound.gotoMap(mapTeleport, {
                method: 1,
                positionX: mapTeleport == 445 ? 75650 : 74550,
                positionY: mapTeleport === 445 ? 36950 : 36550,
            })
        }
    }
}

export default RocketEvent