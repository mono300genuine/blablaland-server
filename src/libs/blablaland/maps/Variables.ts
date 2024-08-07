import GlobalProperties from "../network/GlobalProperties"
import { Packet } from "../../../interfaces/blablaland"
import SocketMessage from "../network/SocketMessage"
import Maps from "../../../json/maps.json"
import Universes from "../../../json/universes.json"

class Variables {

    private listVariables: SocketMessage
    
    private readonly binary: [((number | number[])[] | (number | number[][])[])[]]

    constructor(serverId: number = 0) {
        this.listVariables = new SocketMessage()
        this.binary = [
            [
                [0, [104, 167, 176, 27]],
                [1, [
                    [0, 0],
                    [5, 0],
                    [20, 1],
                    [5, 1],
                    [20, 2],
                    [5, 2],
                    [20, 3],
                    [5, 3],
                    [20, 2],
                    [5, 2],
                    [20, 1],
                    [5, 1],
                    [20, 0]
                ]]
            ]
        ]
        this.writeVariables(serverId)
    }

    /**
     * @param  {number} serverId
     * @returns void
     */
    writeVariables(serverId: number): void {
        const packet: Packet = {
            type: 1,
            subType: 4
        }
        const socketMessage: SocketMessage = new SocketMessage(packet)
        for (let binary in this.binary) {
            socketMessage.bitWriteBoolean(true)
            this.writeBinary(socketMessage, 1,  this.binary[binary])
        }
        socketMessage.bitWriteBoolean(false)
        for (let map of Maps) {
            socketMessage.bitWriteBoolean(true)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, map.id)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_FILEID, map.fileId)
            socketMessage.bitWriteString(map.name)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_TRANSPORT_ID, map.transportId)
            socketMessage.bitWriteSignedInt(17, map.positionX)
            socketMessage.bitWriteSignedInt(17, map.positionY)
            socketMessage.bitWriteUnsignedInt(5, map.meteoId)
            socketMessage.bitWriteUnsignedInt(2, map.protected)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_REGIONID, map.regionId)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_PLANETID, map.planetId)
        }
        socketMessage.bitWriteBoolean(false)
        for (let server of Universes) {
            socketMessage.bitWriteBoolean(true)
            socketMessage.bitWriteString(server.name)
            socketMessage.bitWriteUnsignedInt(16, server.port)
        }
        socketMessage.bitWriteBoolean(false);
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, serverId)
        socketMessage.bitWriteUnsignedInt(8, 0);
        this.listVariables = socketMessage
    }
    
    /**
     * @param  {SocketMessage} socketMessage
     * @param  {number} transport
     * @param  {Array<any>} binary
     * @returns void
     */
    writeBinary(socketMessage: SocketMessage, transport: number, binary: Array<any>): void {
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_TRANSPORT_ID, transport)
        for (var data in binary) {
            let binData = binary[data]
            socketMessage.bitWriteBoolean(true)
            socketMessage.bitWriteUnsignedInt(4, Number(binData[0]));
            if ((binData[0]) == 0) {
                for (let map_id in binData[1]) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, Number(binData[1][map_id]))
                }
                socketMessage.bitWriteBoolean(false)
            } else if ((binData[0]) == 1) {
                for (let data2 in binData[1]) {
                    let binData2 = binData[1][data2]
                    socketMessage.bitWriteBoolean(true);
                    socketMessage.bitWriteUnsignedInt(10, binData2[0])
                    socketMessage.bitWriteUnsignedInt(5, binData2[1])
                }
                socketMessage.bitWriteBoolean(false)
            }
        }
        socketMessage.bitWriteBoolean(false)
    }

    /**
     * @returns SocketMessage
     */
    getListVariables(): SocketMessage {
        return this.listVariables
    }
}

export default Variables