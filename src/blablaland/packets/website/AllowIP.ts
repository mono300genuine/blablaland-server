import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import { IncomingMessage } from "node:http"
import { execSync } from "child_process"
import net from 'net'
import https from 'https'

class AllowIP {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @returns void
     */
    execute(user: User, packet: SocketMessage): void {
        const IPAddress: string = packet.bitReadString()
        if (!net.isIP(IPAddress)) return console.error(`AllowIP not valid ${IPAddress}`)

        if (process.env.PROD == "true" && process.env.IPHUB_API_KEY) {
            this.isBadIP(IPAddress, (isBadIP: boolean): void => {
                if (!isBadIP) {
                    try {
                        execSync(`sudo iptables -L INPUT -n | grep ${IPAddress}`)
                    } catch (error) {
                        execSync(`sudo iptables -I INPUT -p tcp -m multiport --dports 843,12301,12302,12303 -s ${IPAddress} -j ACCEPT`)
                    }
                }
            })
      }
    }

    /**
     * @param {string} ipAddress
     * @param callback
     * @returns void
     */
    private isBadIP(ipAddress: string, callback: (isVPNOrProxy: boolean) => void): void {
        https.get({
            hostname: 'v2.api.iphub.info',
            path: `/ip/${ipAddress}`,
            headers: {
                'X-Key': process.env.IPHUB_API_KEY
            }
        }, (response: IncomingMessage): void => {
            let data: string = ''
            response.on('data', (chunk) => data += chunk)
            response.on('end', (): void => {
                const responseData = JSON.parse(data)
                const isBlock: boolean = responseData['block'] === 1
                if (isBlock) {
                    global.db('bans')
                        .where('ip_address', ipAddress)
                        .andWhere(function(): void {
                            this.whereNull('end_at')
                                .orWhere('end_at', '>', global.db.fn.now())
                        })
                        .then(existingBans => {
                            if (existingBans.length === 0) {
                                global.db.insert({
                                    ip_address: ipAddress,
                                    message: `VPN/Proxy détecté`,
                                    player_id: 2,
                                    created_at: global.db.fn.now(),
                                    updated_at: global.db.fn.now()
                                })
                                    .into('bans')
                                    .then()
                                    .catch(r => console.log(`Err ban VPN: ${r}`))
                            }
                        })
                        .catch(err => {
                            console.error('Error while checking banned IP address:', err);
                        })
                }
                callback(isBlock)
            })
        }).on('error', (error: Error): void => {
            console.error('Error isBadIP:', error)
            callback(false)
        })
    }
}

export default AllowIP