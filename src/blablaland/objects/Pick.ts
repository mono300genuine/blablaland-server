import User from "../../libs/blablaland/User"
import UniverseManager from "../../libs/manager/UniverseManager"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"
import { ParamsFX } from "../../interfaces/blablaland"

class Pick {

    /**
     * @param user
     * @param packet
     * @param universeManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager): void {
        const type: number = packet.bitReadUnsignedInt(2)
        const FX_SID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
        const map = universeManager.getMapById(user.mapId)

        for (let FX of map.mapFX.getListFX()) {
            if (FX.memory && FX.memory[0] === `FLOWER` && (FX_SID === FX.sid || type == 0)) {
                let socketMessage: SocketMessage = new SocketMessage
                if (!FX.memory[1] && type == 0) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteBinary(FX.memory[2])
                    FX.memory[1] = true // isWatered
                    map.mapFX.writeChange(user, {
                        id: 5,
                        sid: FX.sid,
                        data: [FX.data[0], FX.data[1], socketMessage],
                        memory: FX.memory
                    })
                } else if (type == 1) {
                    const userFlower: ParamsFX|undefined = user.hasFX(6, `FLOWER`)
                    const random: number = Math.floor(Math.random() * 5)

                    if (!userFlower) {
                        let colorModel: number|undefined = undefined
                        let text: string = ``
                        let canHasTrefle: boolean = false
                        switch (FX.data[1]) {
                            case 102:
                                colorModel = 4
                                canHasTrefle = true
                                 if (random == 2) {
                                    text = `Tu viens de cueillir une fleur qui apparait pendant 1 minute sous ton pseudo et en plus elle contenait une potion de miniaturisation !`
                                    user.transform.potion(17)
                                } else {
                                    text = `Tu viens de trouver une fleur qui apparait pendant 1 minute sous ton pseudo !`
                                }
                                break
                            case 140:
                                colorModel = 6
                                if (random == 1) {
                                    colorModel = 7
                                    text = `Tu viens de trouver une étoile dans le sapin qui apparait pendant 1 minute sous ton pseudo et en plus il contenait une potion multicolore et une potion de rapidité !`
                                    user.transform.potion(14)
                                    user.transform.potion(18)
                                } else if (random == 2) {
                                    colorModel = 8
                                    text = `Whouaaa, en cueillant un sapinou tu as trouvé un cadeau, et en plus il contenait 10 blabillons, troooop cool!`
                                    user.updateBBL(10, false).then()
                                } else {
                                    text = `Tu viens de cueillir un sapinou qui apparait pendant 1 minute sous ton pseudo et en plus il contenait une potion de miniaturisation !`
                                    user.transform.potion(17)
                                }
                                break
                            case 182:
                                colorModel = 0
                                canHasTrefle = true
                                text = `une lys`
                                break
                            case 183:
                                colorModel = 1
                                text = `une rose`
                                canHasTrefle = true
                                break
                            case 184:
                                colorModel = 2
                                canHasTrefle = true
                                text = `une tulipe`
                                break
                            case 332:
                                colorModel = 11
                                text = 'une noix de coco'
                                user.transform.coconut()
                                break
                            default:
                                break
                        }

                        const blibli: ParamsFX|undefined = user.hasFX(6, `BLIBLI_343`)
                        if (blibli) {
                            const found: string = FX.data[1] == 140 ? 'une graine de sapinou' : (FX.data[1] == 102 ? 'une graine d\'oeuf de pâques' : text)
                            user.interface.addInfoMessage(`Supercureuil a trouvé ${found} !`)
                            user.inventory.reloadOrInsertObject(FX.data[1], {
                                isSubtraction: false
                            })
                        }

                        if (FX.data[1] != 102 && FX.data[1] != 140) {
                            text = `Tu viens de cueillir ${text} qui apparait pendant 1 minute sous ton pseudo !`
                        }

                        if (canHasTrefle) {
                            let isLuckLeprechaun: boolean = ([266, 267, 268].includes(user.skinId) && random === 3)
                            if (random == 1 || isLuckLeprechaun) {
                                colorModel = 3
                                text = `Whouaaa, en cueillant une fleur tu as trouvé un trèfle à 4 feuilles, il va te porter bonheur pendant 1 minute, la preuve, tu viens déjà de gagner en plus 10 blabillons, troooop cool !`
                                user.updateBBL(10, false).then()
                            }
                        }

                        socketMessage.bitWriteUnsignedInt(5, colorModel ?? 0)
                        socketMessage.bitWriteUnsignedInt(5, 1)

                        user.userFX.writeChange({
                            id: 6,
                            identifier: `FLOWER`,
                            memory: colorModel,
                            data: [5, 42, socketMessage],
                            isProtected: true,
                            duration: 60
                        })
                        return user.interface.addInfoMessage(text)
                    } else {
                        return user.interface.addInfoMessage(`Tu ne peux rien cueillir de plus pour le moment !!`)
                    }
                }
            }
        }
    }
}

export default Pick