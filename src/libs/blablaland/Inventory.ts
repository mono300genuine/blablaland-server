import User from "./User"
import { ObjectDatabase } from "../../interfaces/database"
import { MapDefinition, ObjectType, Packet} from "../../interfaces/blablaland"
import SocketMessage from "./network/SocketMessage"
import GlobalProperties from "./network/GlobalProperties"
import Objects from "../../json/objects.json"
import Maps from "../../json/maps.json"
import { Knex } from "knex"

class Inventory {

    private user: User

    private listObject: Array<ObjectDatabase>

    constructor(user: User) {
        this.user = user
        this.listObject = new Array<ObjectDatabase>()
    }

    /**
     * @returns Array
     */
    getListObject(): Array<ObjectDatabase> {
        return this.listObject
    }

    /**
     * @param objectId
     */
    getObject(objectId: number): ObjectDatabase|undefined  {
        return this.getListObject().find(obj => obj.objectId === objectId)
    }

    /**
     * Get by database id
     * @param id
     */
    getObjectById(id: number): ObjectDatabase|undefined  {
        return this.getListObject().find(obj => obj.id === id)
    }


    /**
     * @param objectId
     * @param options
     * @param quantity
     */
    reloadOrInsertObject(objectId: number, options?: {isSubtraction?: boolean}, quantity: number = 1): void {
        let object: ObjectDatabase|undefined = this.getObject(objectId)
        let isCanInsert: boolean = true

        if (!object) {
            object = {
                id : objectId,
                objectId: objectId,
                quantity: quantity
            }
        } else {
            isCanInsert = false
            if (options?.isSubtraction) {
                object.quantity -= quantity
            } else {
                object.quantity += quantity
            }
        }

        this.reloadObject(object, { isCanInsert: isCanInsert })
    }

    /**
     * @param object
     * @param options
     */
    reloadObject(object: ObjectDatabase, options?: {isUpdate?: boolean, isDelete?: boolean, isCanInsert?: boolean, isFirstLoading?: boolean }): void {
        const item: ObjectDatabase|undefined = this.getObject(object.objectId)
        const obj: ObjectType|undefined = Objects.find(o => o.id === object.objectId)
        if (!obj) return

        let packetSender: Packet = {
            type: 2,
            subType: 12
        }
        let socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteBoolean(true)
        socketMessage.bitWriteUnsignedInt(8, item && !options?.isFirstLoading ? 1 : 0)
        if (item && !options?.isFirstLoading) {
            socketMessage.bitWriteUnsignedInt(32, object.id) // objectId
            socketMessage.bitWriteUnsignedInt(32, object.quantity >= 0 ? object.quantity : 0) // count
            socketMessage.bitWriteUnsignedInt(32, obj.expireAt)
        } else {
            socketMessage.bitWriteUnsignedInt(32, object.id)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_ID, obj.fxFileId)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, object.objectId)
            socketMessage.bitWriteUnsignedInt(32, object.quantity >= 0 ? object.quantity : 0)
            socketMessage.bitWriteUnsignedInt(32, obj.expireAt)
            socketMessage.bitWriteUnsignedInt(3, obj.visibility)
            socketMessage.bitWriteUnsignedInt(5, obj.genre)
            this.addListObject(object)
            if (options?.isCanInsert) { // Si je veux insérer l'objet
                this.insertObjectDatabase(object).then().catch(r => console.error(`Err insertObjectDatabase : ${r}`))
            }
        }
        this.writeBinaryDataObject(socketMessage, object)
        socketMessage.bitWriteBoolean(false)
        this.user.socketManager.send(socketMessage)

        if (!options?.isCanInsert) {
            this.updateObjectDatabase(object).then().catch(r => console.error(`Err updateObjectDatabase : ${r}`))
        }
    }

    /**
     * @param socketMessage
     * @param object
     */
    addObject(socketMessage: SocketMessage, object: ObjectDatabase): SocketMessage|void {
        const obj: ObjectType|undefined = Objects.find(o => o.id === object.objectId)
        if (!obj) return
        socketMessage.bitWriteBoolean(true)
        socketMessage.bitWriteUnsignedInt(8, 0)
        socketMessage.bitWriteUnsignedInt(32, object.id)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_ID, obj.fxFileId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, object.objectId)
        socketMessage.bitWriteUnsignedInt(32, object.quantity >= 0 ? object.quantity : 0)
        socketMessage.bitWriteUnsignedInt(32, obj.expireAt)
        socketMessage.bitWriteUnsignedInt(3, obj.visibility)
        socketMessage.bitWriteUnsignedInt(5, obj.genre)
        this.writeBinaryDataObject(socketMessage, object)
        this.addListObject(object)
        return socketMessage
    }


    /**
     * @param socketMessage
     * @param object
     */
    writeBinaryDataObject(socketMessage: SocketMessage, object: ObjectDatabase): SocketMessage {
        const sm: SocketMessage = new SocketMessage()
        if (object.objectId === 109) { // Wedding
            sm.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, this.user.wedding_id)
        } else if (object.objectId === 231) {// Carte pirate
            const randomNumber: number = (Math.floor(Math.random() * (950 - 50 + 1)) + 50) * 100
            let filteredMaps: MapDefinition[] = Maps.filter((map) => map.giftReceiver)
            this.user.mapPearl = filteredMaps[Math.floor(Math.random() * filteredMaps.length)].id

            sm.bitWriteUnsignedInt(32, this.user.mapPearl)
            sm.bitWriteSignedInt(32, randomNumber) // posId
        } else if (object.objectId === 361 || object.objectId === 362) { // MiniMonster
            const miniMonster = this.user.getListMiniMonster().find(miniMonster => miniMonster.objectId === object.objectId)
            const evol: number = miniMonster ? miniMonster.worm + miniMonster.apple + miniMonster.ant : 0

            sm.bitWriteUnsignedInt(8, 1)
            sm.bitWriteUnsignedInt(8, 1)
            sm.bitWriteUnsignedInt(8, miniMonster?.typeX?? 0)
            sm.bitWriteUnsignedInt(8, 2)
            sm.bitWriteUnsignedInt(8, 1)
            sm.bitWriteUnsignedInt(8, miniMonster?.typeY?? 0)
            sm.bitWriteUnsignedInt(8, 4)
            sm.bitWriteUnsignedInt(8, 2)
            sm.bitWriteUnsignedInt(8, 0)
            sm.bitWriteUnsignedInt(8, evol)
            if (miniMonster?.name) {
                sm.bitWriteUnsignedInt(8, 5)
                sm.bitWriteUnsignedInt(8, 0)
                sm.bitWriteString(miniMonster.name)
            }
            sm.bitWriteUnsignedInt(8, 0)
            sm.bitWriteUnsignedInt(8, 0)
        }
        socketMessage.bitWriteBinaryData(sm)
        return socketMessage
    }

    /**
     * @param object
     */
    async insertObjectDatabase(object: ObjectDatabase) {
        await global.db.insert({
            power_id: object.objectId,
            player_id: this.user.id,
            quantity: object.quantity,
            created_at: global.db.fn.now(),
            updated_at: global.db.fn.now()
        }).into('player_power')
    }

    /**
     * @param object
     */
    async updateObjectDatabase(object: ObjectDatabase): Promise<void> {
        await global.db('player_power')
            .where('player_id', this.user.id)
            .where('power_id', object.objectId)
            .update({
                quantity: object.quantity
            })
    }


    /**
     * @param  {ObjectType} object
     * @returns void
     */
    addListObject(object: ObjectDatabase): void {
        this.listObject.push(object)
    }

    /**
     * @param object
     */
    async removeObject(object: ObjectDatabase): Promise<void> {
        await global.db.transaction(async (trx: Knex.Transaction): Promise<void> => {
            try {
                this.listObject = this.listObject.filter((item: ObjectDatabase): boolean => item.objectId !== object.objectId)
                const deletePower: number = await trx('player_power')
                    .where('player_id', this.user.id)
                    .where('power_id', object.objectId)
                    .delete()
                if (deletePower) {
                    this.listObject = this.listObject.filter((item: ObjectDatabase): boolean => item.objectId !== object.objectId)
                }
                await trx.commit()
            } catch (error) {
                await trx.rollback()
            }
        })
    }
}

export default Inventory