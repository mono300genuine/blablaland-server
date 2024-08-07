import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import * as fs from "fs"
import * as zlib from "zlib"

class ClientBytes {

    /**
     * @param user
     * @param packet
     */
    async execute(user: User, packet: SocketMessage): Promise<void> {
        const id: number = packet.bitReadUnsignedInt(32)

        if (user.clientBytes?.id !== id || !process.env.DATA) {
            return user.socketManager.close()
        }

        const swfPath: string = process.env.DATA.replace('data', user.inConsole ? '/console/console.swf' : '/chat/chat.swf')
        const swf: Buffer = fs.readFileSync(swfPath)
        zlib.inflate(swf.slice(8), function (err: Error|null, buf: Buffer): void {
            if (err) {
                console.error('Error decompressing swf file:', err)
            }
            const data: Buffer = Buffer.from(swf.slice(0, 8))
            const unzip: Buffer = Buffer.concat([data, buf])

            if (user.clientBytes?.size && user.clientBytes.position) {
                for (let loc19 = 0; loc19 < user.clientBytes.size; loc19++) {
                    const loc20: number = (loc19 + user.clientBytes.position) % (unzip.length - 8)
                    if (unzip[loc20 + 8] !== packet.bitReadUnsignedInt(8)) {
                        return user.socketManager.close(`Le GrandSage n'apprécie pas vos méthodes ! :(`)
                    }
                }
            }
        })
    }
}

export default ClientBytes