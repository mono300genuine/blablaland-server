import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import Binary from "../../../libs/blablaland/network/Binary"
import { ParamsFX } from "../../../interfaces/blablaland"
import { ObjectDatabase } from "../../../interfaces/database"

class SkinAction {

    /**
     *
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        const FX_SID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
        const skBytes: number = packet.bitReadUnsignedInt(32)
        const delayed: boolean = packet.bitReadBoolean()
        const latence: boolean = packet.bitReadBoolean()
        const userActivity: boolean = packet.bitReadBoolean()
        const isYourself: boolean = packet.bitReadBoolean()
        const isActive: boolean =  user.walker.isDance = packet.subType === 6
        let isPersistant: boolean = false
        let uniq: boolean = false
        let hasDuration: boolean = false
        let duration: number|undefined = undefined
        let data: Binary|undefined = undefined

        if (isActive) {
            isPersistant = packet.bitReadBoolean()
            uniq = packet.bitReadBoolean()
            const durationBlend: number = packet.bitReadUnsignedInt(2)
            hasDuration = packet.bitReadBoolean()
            if (hasDuration) {
                duration = packet.bitReadUnsignedInt(16)
            }
        }
        const hasData: boolean = packet.bitReadBoolean()
        if (hasData) {
            data = packet.bitReadBinaryData()
            if (!FX_SID) {
                data.bitReadUnsignedInt(8) // skinAction
            }
        }


        const skinAction: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SKIN_ACTION)
        if (hasData && data && skinAction) {
            const skinId: number = data.bitReadUnsignedInt(GlobalProperties.BIT_SKIN_ID)
            const type: number = data.bitReadUnsignedInt(3)

            if (skinId === 289) { // Princess Dragon
                const listUser: Array<User> = new Array<User>()
                while (data.bitReadBoolean()) {
                    const userPID: number = data.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
                    const userFound: User|undefined = serverManager.getUserByPid(userPID)
                    if (userFound) listUser.push(userFound)
                }
                for (let item of listUser) {
                    if (item.skinId == 292) item.transform.prince()
                }
            } else if (skinId === 376) { // Lapin plage
                if (type === 0) {
                    const userID: number = data.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
                    const positionX: number = data.bitReadSignedInt(17)
                    const positionY: number = data.bitReadSignedInt(17)
                    const direction: boolean = data.bitReadBoolean()
                    const surfaceBody: number = data.bitReadUnsignedInt(8)
                    const name: string = data.bitReadString()
                    const map = universeManager.getMapById(user.mapId)
                    const stock: number = 4

                    if (map.hasFX(5, `SANDCASTLE_${user.id}_`)) {
                        return
                    }

                    const socketMessage: SocketMessage = new SocketMessage()
                    socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, userID)
                    socketMessage.bitWriteSignedInt(17, positionX)
                    socketMessage.bitWriteSignedInt(17, positionY)
                    socketMessage.bitWriteBoolean(direction)
                    socketMessage.bitWriteUnsignedInt(4, stock)
                    socketMessage.bitWriteUnsignedInt(8, surfaceBody)
                    socketMessage.bitWriteString(name)

                    let params: ParamsFX = {
                        id: 5,
                        identifier: `SANDCASTLE_${user.id}`,
                        data: [30, 202, socketMessage],
                        memory: { userID, positionX, positionY, direction, stock },
                        duration: 90,
                    }
                    map.mapFX.writeChange(user, params)
                }
            } else if (skinId === 504 || skinId == 505) { // Alchimiste
                if (type === 0) {
                    const action: number = data.bitReadSignedInt(10)
                    const unknown: number = data.bitReadSignedInt(10)

                    if (type >= 0) {
                        const time: number = data.bitReadUnsignedInt(32)
                        const launcherAt: number = data.bitReadUnsignedInt(10)

                        if(! user.walker.isDodo) {
                            data = new SocketMessage
                            data.bitWriteSignedInt(10, action)
                            data.bitWriteSignedInt(10, unknown)
                            data.bitWriteUnsignedInt(32, time)
                            data.bitWriteUnsignedInt(10, launcherAt)
                        }
                    } else {
                        data = new SocketMessage
                        data.bitWriteUnsignedInt(GlobalProperties.BIT_SKIN_ID, user.skinId)
                        data.bitWriteUnsignedInt(3, type)
                        data.bitWriteSignedInt(10, action)
                        data.bitWriteSignedInt(10, unknown)
                    }
                }
            } else if (skinId === 562) { // Poupée Vaudou
                if (type === 0) {
                    const time: number = data.bitReadUnsignedInt(32)
                    const launcherAt: number = data.bitReadUnsignedInt(10)
                    const option: number = data.bitReadUnsignedInt(4)
                    const userId: number = data.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)

                    data = new SocketMessage
                    data.bitWriteUnsignedInt(32, time)
                    data.bitWriteUnsignedInt(10, launcherAt)
                    data.bitWriteUnsignedInt(4, option)
                    data.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, userId)

                    setTimeout((): void => {
                        if (user.walker.isDance) {
                            const socketMessage: SocketMessage = new SocketMessage()
                            socketMessage.bitWriteUnsignedInt(4, option)
                            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, userId)

                            const userFound: User | undefined = serverManager.getUserById(userId, {
                                inConsole: false
                            })
                            if (userFound && userFound.id !== user.id) {
                                userFound.userFX.writeChange({
                                    id: 6,
                                    identifier: `VOODOO_DOLL`,
                                    data: [28, 1, socketMessage],
                                    duration: 15,
                                    isMap: true
                                })
                            }
                        }
                    }, 2850)
                }
            } /*
                70: Karaté
                71: Karaté Fille
                74 : Escrime
                75 : Escrime Fille
                77 : Sorcière
                94 : Sorcier
                216 : Rhino féroce !
                218 : Baseballeur
                217 : Footballeur américain
                291 : Chevalier
                358 : MONTURE : Raptor
                575: Maître Samouraï [Collector]
                584 : MONTURE Raptor Undead
             */
             else if ([70, 71, 74, 75, 77, 94, 216, 217, 218, 291, 358, 575, 584].includes(skinId)) {
                if (type === 0) {
                    const positionX: number = data.bitReadSignedInt(17)
                    const positionY: number = data.bitReadSignedInt(17)
                    const listUser: [number, boolean][] = []

                    while (data.bitReadBoolean()) {
                        const userPID: number = data.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
                        const isShield: boolean = data.bitReadBoolean()
                        const userFound: User|undefined = serverManager.getUserByPid(userPID)
                        if (userFound && !isShield) {
                            listUser.push([userFound.pid, !isShield])
                        }
                    }

                    if (!universeManager.getMapById(user.mapId).isProtected()) {
                        data = new SocketMessage()
                        data.bitWriteSignedInt(17, positionX)
                        data.bitWriteSignedInt(17, positionY)
                        data.bitWriteBoolean(user.walker.direction)

                        for (let i = 0; i < listUser.length; i++) {
                            data.bitWriteBoolean(true)
                            data.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, listUser[i][0])
                            data.bitWriteBoolean(listUser[i][1])
                        }
                        data.bitWriteBoolean(false)
                    }
                }
            } else if ([591, 592, 593].includes(skinId)) { // Fumée Indien
                 if (type === 0) {
                     let text: string = data.bitReadString()
                     data = new SocketMessage()
                     data.bitWriteString(text)
                 }
            } /**
             476 : MONTURE : BBL-Solid Bi-Turbo
             477 : MONTURE : BBL-Solid SPORT 16V
             514 : MONTURE : Motor Spring Coupé
             515 : MONTURE : Motor Spring Bomber
             560 : MONTURE : Laveuse de Supermarché Tuning
             585 : MONTURE : Chariot des Mines
             586 : Mysthoriä : MONTURE Chariot de l'Enfer
             603 : Clown Diabolique du Manoir Hanté
             */
             else if ([476, 477, 514, 515, 560, 585, 586, 603].includes(skinId)) {
                const boost: ObjectDatabase|undefined = user.inventory.getObject(152)
                data = new SocketMessage()
                if (boost && boost.quantity > 0) {
                    boost.quantity--
                    user.inventory.updateObjectDatabase(boost).then()
                }
                data.bitWriteUnsignedInt(32, boost?.quantity ?? 0)
            } else {
                console.warn('\x1b[31m%s\x1b[0m', `SkinAction ${skinId} not found`)
            }
        }

        const FX: ParamsFX|undefined = user.hasFX(5, FX_SID.toString())
        if (isActive && user.getCamera()?.mapReady) {
            if (Date.now() - user.walker.danseCooldown >= 1000) {
                user.walker.danseCooldown = Date.now()
                user.walker.danseCooldownCount = 0
            }
            if (user.walker.danseCooldownCount <= 10) {
                if (user.skinId === 239 && FX_SID === 1 && FX) { // Provisoire à changer
                    return
                }
                user.userFX.writeChange({
                    id: 5,
                    sid: FX_SID,
                    data: hasData ? [skBytes, delayed, data] : [skBytes, delayed],
                    isYourself: isYourself,
                    isPersistant: isPersistant,
                    isActive: isActive,
                    duration: duration
                })
                user.walker.danseCooldownCount++
            }
        } else {
            if (FX) {
                if (delayed) {
                    setTimeout(() => user.userFX.dispose(FX), 50)
                } else {
                    user.userFX.dispose(FX)
                }
            }
        }
    }
}

export default SkinAction