import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { ParamsFX } from "../../../interfaces/blablaland"
import ServerManager from "../../../libs/manager/ServerManager"
import UserDie from "../global/UserDie"
import Maps from "../../../json/maps.json"

class SkinEventToUser {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        const userId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
        const skinId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SKIN_ID)
        const map = universeManager.getMapById(user.mapId)
        const dateServer: number = Date.now()

        if ([565, 566].includes(user.skinId) ||
            ([661, 662].includes(user.skinId) && user.walker.isDance)) {
            return
        } else if (!map.isObjectAllowed && !user.isModerator()) {
            return user.interface.addInfoMessage(`Les pouvoirs sont temporairement désactivés sur cette map`)
        }

        if (skinId === 232 || skinId === 303) { // CitrouilleParty09, Cavalier sans tête
            let skinColor: number = 74
            if (skinId == 303) {
                skinColor = packet.bitReadUnsignedInt(8)
            }
            user.transform.paint(new Array(10).fill(skinColor))
        } else if (skinId === 31 || skinId === 306 || skinId === 559 || skinId == 560) { // Chef Indien, Monture lavage
            const FX: ParamsFX|undefined = user.hasFX(3, `PAINT`)
            if (FX) user.userFX.dispose(FX)
        } else if (skinId === 402 || skinId === 403) { // Ghost Buster
            if (user.mapId !== 10 && user.mapId !== 336 && user.mapId !== 337 && user.mapId !== 338) {
                user.getCamera()?.gotoMap(336, {
                    method: 3
                })
            }
        } else if (skinId === 310 || skinId === 311) { // Archers
            if (!map.isProtected()) user.transform.apple()
        } else if ([164, 165, 166, 167, 240, 421, 440, 441, 442, 443, 485].includes(skinId)) {
            const type: number = packet.bitReadUnsignedInt(2)
            if (type === 0) {
                const isShield: boolean = packet.bitReadBoolean()
                const isMute: boolean = packet.bitReadBoolean()
                if (!isShield && !isMute) {
                    if (skinId === 421) { // Blabla'ToyZ - Spécial Halloween
                        user.transform.lollipop()
                    } else if (skinId === 440) { // Blabla'ToyZ Cristal
                        user.transform.crystal()
                    } else if (skinId === 441) { // Blabla'ToyZ Poussin
                        user.transform.chick()
                    } else if (skinId === 442) { // Blabla'ToyZ Pingouin
                        user.transform.iceCube()
                    } else if (skinId === 443) { // Blabla'ToyZ Électrique
                        user.transform.electrify(5)
                    } else if (skinId === 485) { // Blabla'ToyZ St Valentin
                        user.transform.stValentineHeart()
                    } else {
                        const userFound: User|undefined = serverManager.getUserById(userId, {
                            inConsole: false
                        })

                        packet = new SocketMessage()
                        packet.bitWriteString(`s'est fait griller par ${userFound?.pseudo ?? 'un blabla'} :)`)
                        packet.bitWriteUnsignedInt(8, 8)
                        new UserDie().execute(user, packet, universeManager)
                    }
                }
            }
        } else if ( skinId === 451 || skinId === 452) { // Archers Noel
            if (!map.isProtected()) user.transform.snowman()
        } else if (skinId === 455 || skinId === 456) { // Lutin
            user.transform.gift()
        } else if (skinId === 480) { // Fraise Powa
            user.transform.strawberry()
        } else if (skinId === 482) {
            user.transform.lapinou()
        } else if (skinId === 485) { // Toyz St Valentin
            user.transform.heart()
        } else if (skinId === 486) {
            user.transform.heartBubble()
        } else if (skinId === 582) { // Exo Armure ThunderBolt
         user.transform.lightningEffect()
        } else if (skinId === 603) { // Clown Diabolique du Manoir Hanté
            user.transform.zombie([74, 74, 74, 74, 74, 74, 74, 74, 74, 74])
        } else if (skinId === 611) {
            user.transform.lapinouChristmas()
        } else if(skinId === 653 || skinId == 654) { // Boulet Sherif
            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
            socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000) + 30)

            let params: ParamsFX = {
                id: 6,
                data: [48, 0, socketMessage],
                duration: 30
            }
            user.userFX.writeChange(params)
        } else if (skinId === 674) { // Epouvantail
            user.userFX.writeChange({
                id: 4,
                data: {
                    skinColor: new Array(10).fill(59)
                },
                duration: 15
            })
        } else if (skinId === 678) {
            user.transform.skeleton()
        } else if (skinId === 679 || skinId === 680 || skinId == 681) { // Robot
            user.transform.cow()
        } else if (skinId === 698) { // Roi Singe
            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(8, 15)

            user.userFX.writeChange({
                id: 6,
                data: [30, 4, socketMessage],
                duration: 15
            })
        } else if (skinId === 253 || skinId === 254 || skinId === 255 || skinId === 262) { // Spies
            const userFound: User | undefined = serverManager.getUserById(userId, {
                inConsole: false
            })

            const type: number = packet.bitReadUnsignedInt(3)
            if (type === 0) {
                const mapId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_MAP_ID)
                const myMap = universeManager.getMapById(user.mapId)
                const map = universeManager.getMapById(mapId)
                const myMapFound = Maps.find(m => m.id == user.mapId)
                const mapFound = Maps.find(m => m.id == mapId)

                if (map.isSpecial() || myMap.isSpecial() || (userFound?.mapId === user.mapId) || myMapFound?.gradeId !== 0 || mapFound?.gradeId !== 0) {
                    return user.interface.addInfoMessage(`Impossible de rejoindre ${userFound?.pseudo ?? 'ton ami'} !!`)
                } else {
                    user.getCamera()?.gotoMap(mapId)
                }
            }
        }
        else {
            console.warn('\x1b[31m%s\x1b[0m', `SkinEventToUser ${user.mapId} not found`)
        }
    }
}

export default SkinEventToUser