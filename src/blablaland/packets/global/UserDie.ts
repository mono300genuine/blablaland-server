import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import { MapDefinition, ParamsFX } from "../../../interfaces/blablaland"
import Maps from "../../../json/maps.json"
import Camera from "../../../libs/blablaland/Camera"


class UserDie {

    /**
     * Teleportation of a user to Heaven
     * @param user
     * @param packet
     * @param universeManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager): void {
        let text: string = packet.bitReadString()
        let method: number = packet.bitReadUnsignedInt(8)
        let isTeleport: boolean = true

        const cameraFound: Camera|undefined = user.getCamera()
        if (cameraFound && cameraFound.mapReady && !user.inConsole && user.mapId !== 10) {
            const map = universeManager.getMapById(user.mapId)

            if (!map.isParadis()) {
                const mapFound: MapDefinition|undefined = Maps.find((m) => m.id == map.id)
                const paradisId: number = mapFound?.paradisId ?? 253 // default "Paradis Musée"

                if (!text) {
                    text = `Que le blablateur ${user.pseudo} repose en paix.`
                } else {
                    text = `${user.pseudo} ${text}`
                }

                universeManager.getMapById(user.mapId).mapFX.writeChange(user,{ // FX Die
                    id: 1,
                    memory: user.mapId,
                    duration: 15
                })

                user.interface.addInfoMessage(text, {
                    isMap: true,
                    isHtml: false,
                    isWarning: false
                })

                if (!map.isGame()) {
                    user.transform.ghostParadise(26, 15)
                }

                if (user.skinId === 604 || user.skinId === 605) { // Spectre
                    for (let map of universeManager.getListMap()) {
                        for (let FX of map.mapFX.getListFX()) {
                            if (FX.identifier?.includes(`TOMB_${user.id}_`)) {
                                isTeleport = false
                                user.getCamera()?.gotoMap(FX.memory[0], {
                                    positionX: FX.memory[1],
                                    positionY: FX.memory[2],
                                    method: user.mapId === FX.memory[0] ? method : 0
                                })
                            }
                        }
                    }
                }
                if (isTeleport) {
                    const FX: ParamsFX|undefined = user.hasFX(6,`1`)
                    if (FX) {
                        user.userFX.dispose(FX)
                    }
                    if (!map.isSpecial()) {
                        const FX: ParamsFX|undefined = user.hasFX(4, `26`)
                        if (FX) {
                            const FX: ParamsFX|undefined = user.hasFX(6, '1')
                            if (FX) user.userFX.dispose(FX)
                            user.userFX.writeChange({ // Pop-up respawn
                                id: 6,
                                sid: 1,
                                data: [8, 1, new SocketMessage],
                                memory: map.id,
                                duration: 15,
                                isMap: false
                            })
                        }
                    }

                    cameraFound.gotoMap(paradisId, {
                        method: method
                    })
                }
            }
        }
    }
}

export default UserDie