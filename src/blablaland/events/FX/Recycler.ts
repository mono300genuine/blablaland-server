import User from "../../../libs/blablaland/User"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import { FXEvent, Packet } from "../../../interfaces/blablaland"
import {ObjectDatabase} from "../../../interfaces/database";
import StatGame, { Game } from "../../../libs/blablaland/games/StatGame"

class Recycler {

    /**
     *
     * @param user
     * @param event
     */
    async execute(user: User, event: FXEvent): Promise<void> {
        const type: number = event.packet.bitReadUnsignedInt(3)
        const channelId: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_CHANNEL_ID)

        const packetSender: Packet = {
            type: 1,
            subType: 16
        }
        let socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CHANNEL_ID, channelId)

        if (type === 0) {
            StatGame.getPlayerStats(Game.MYSTHORIA, user.id).then((r): void => {
                socketMessage.bitWriteUnsignedInt(3, 0)
                socketMessage.bitWriteBoolean(true)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, 0)
                socketMessage.bitWriteUnsignedInt(16, r ? r.remaining_token : 0)

                for (let power of [246, 247, 248, 249, 250, 252]) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, power)
                    socketMessage.bitWriteUnsignedInt(16, user.inventory.getObject(power)?.quantity ?? 0)
                }
                socketMessage.bitWriteBoolean(false)
                user.socketManager.send(socketMessage)
            })
        } else if (type === 1) {
            const FX_SID: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)

            const tinCan: ObjectDatabase|undefined = user.inventory.getObject(246)
            const damagedTire: ObjectDatabase|undefined  = user.inventory.getObject(247)
            const bananaPeel: ObjectDatabase|undefined  = user.inventory.getObject(248)
            const chewedBone: ObjectDatabase|undefined  = user.inventory.getObject(249)
            const shoe: ObjectDatabase|undefined  = user.inventory.getObject(250)
            const miningCatalyst: ObjectDatabase|undefined  = user.inventory.getObject(252)
            if (!tinCan || !damagedTire || !bananaPeel || !chewedBone || !shoe || !miningCatalyst) return

            let status: number = 2
            const objectQuantities: { [key: number]: { [key: string]: number } } = {
                255: { miningCatalyst: 1, tinCan: 1, damagedTire: 1, bananaPeel: 0, chewedBone: 0, shoe: 1 },
                257: { miningCatalyst: 2, tinCan: 0, damagedTire: 60, bananaPeel: 10, chewedBone: 0, shoe: 20 },
                254: { miningCatalyst: 4, tinCan: 20, damagedTire: 0,  bananaPeel: 0, chewedBone: 100,  shoe: 20 },
                258: { miningCatalyst: 2, tinCan: 35, damagedTire: 20, bananaPeel: 35, chewedBone: 0, shoe: 0 },
                588: { miningCatalyst: 4, tinCan: 25, damagedTire: 25,  bananaPeel: 25, chewedBone: 0, shoe: 25 }
            }

            if (FX_SID === 588) {
                let result = await global.db('player_skin').where({
                    skin_id: 588,
                    player_id: user.id
                }).select('id').first()
                if (!result) {
                    const skin = await db.select('*').from('skins').where('id', 588).first()
                    if (skin) {
                        const quantities = objectQuantities[588]
                        if (
                            miningCatalyst.quantity >= quantities.miningCatalyst &&
                            tinCan.quantity >= quantities.tinCan &&
                            damagedTire.quantity >= quantities.damagedTire &&
                            shoe.quantity >= quantities.shoe &&
                            bananaPeel.quantity >= quantities.bananaPeel
                        ) {
                            await global.db.insert({
                                skin_id: 588,
                                player_id: user.id,
                                color: skin.color,
                                created_at: global.db.fn.now(),
                                updated_at: global.db.fn.now()
                            }).into('player_skin')

                            miningCatalyst.quantity -= quantities.miningCatalyst
                            tinCan.quantity -= quantities.tinCan
                            damagedTire.quantity -= quantities.damagedTire
                            shoe.quantity -= quantities.shoe
                            bananaPeel.quantity -= quantities.bananaPeel

                            user.inventory.reloadObject(miningCatalyst);
                            user.inventory.reloadObject(tinCan);
                            user.inventory.reloadObject(damagedTire);
                            user.inventory.reloadObject(shoe);
                            user.inventory.reloadObject(bananaPeel);
                        } else {
                            status = 0
                        }
                    }
                } else {
                    status = 1
                }
            } else if ([254, 258, 255, 257].includes(FX_SID)) {
                if (FX_SID === 255) {
                    if (miningCatalyst.quantity >= 1 && tinCan.quantity >= 1 && damagedTire.quantity >= 1 && shoe.quantity >= 1) {
                        user.inventory.reloadOrInsertObject(FX_SID, {isSubtraction: false}, 30)
                        miningCatalyst.quantity--
                        tinCan.quantity--
                        damagedTire.quantity--
                        shoe.quantity--

                        user.inventory.reloadObject(miningCatalyst)
                        user.inventory.reloadObject(tinCan)
                        user.inventory.reloadObject(damagedTire)
                        user.inventory.reloadObject(shoe)
                    } else {
                        status = 0
                    }
                } else if ([257, 254, 258].includes(FX_SID)) {
                    if (user.inventory.getObject(FX_SID)) {
                        status = 1
                    } else {
                        const quantities = objectQuantities[FX_SID]
                        if (
                            miningCatalyst.quantity >= quantities.miningCatalyst &&
                            bananaPeel.quantity >= quantities.bananaPeel &&
                            damagedTire.quantity >= quantities.damagedTire &&
                            shoe.quantity >= quantities.shoe &&
                            tinCan.quantity >= quantities.tinCan &&
                            chewedBone.quantity >= quantities.chewedBone
                        ) {
                            user.inventory.reloadOrInsertObject(FX_SID)
                            miningCatalyst.quantity -= quantities.miningCatalyst
                            bananaPeel.quantity -= quantities.bananaPeel
                            damagedTire.quantity -= quantities.damagedTire
                            shoe.quantity -= quantities.shoe
                            tinCan.quantity -= quantities.tinCan
                            chewedBone.quantity -= quantities.chewedBone

                            user.inventory.reloadObject(miningCatalyst)
                            user.inventory.reloadObject(bananaPeel)
                            user.inventory.reloadObject(damagedTire)
                            user.inventory.reloadObject(shoe)
                            user.inventory.reloadObject(tinCan)
                            user.inventory.reloadObject(chewedBone)
                        } else {
                            status = 0
                        }
                    }
                }
            }
            socketMessage.bitWriteUnsignedInt(3, status)
            user.socketManager.send(socketMessage)
        }
    }
}

export default Recycler