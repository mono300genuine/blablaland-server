import { MessageBuilder, Webhook } from "discord-webhook-node"
import { execSync } from "child_process"

class RateLimiter {
    private ipRequestsMap: Map<string, { requestCount: number, lastRequestTime: number }> = new Map()
    private pidRequestsMap: Map<number, { requestCount: number, lastRequestTime: number }> = new Map()
    private bannedIPs: Map<string, number> = new Map()

    private banDuration: number = 5 * 60 * 1000 // 5 min

    checkRateLimit(ip: string, pid?: number): boolean {
        const now: number = Date.now()
        const banEndTime: number|undefined = this.bannedIPs.get(ip)
        if (banEndTime && now < banEndTime) {
            console.error('\x1b[31m%s\x1b[0m', `IP ${ip} is banned. Request rejected.`)
            return false
        }
        let requestInfo;
        if(pid !== undefined && pid !== 0) {
            requestInfo = this.pidRequestsMap.get(pid)
        } else {
            requestInfo = this.ipRequestsMap.get(ip)
        }

        if (requestInfo) {
            const timeElapsedSinceLastRequest: number = now - requestInfo.lastRequestTime
            if (timeElapsedSinceLastRequest > (typeof pid !== "undefined" ? 50 : 150)) {
                requestInfo.requestCount = 0
            }

            requestInfo.requestCount++
            requestInfo.lastRequestTime = now

            const requestCountExceeded: boolean = requestInfo.requestCount > (typeof pid !== "undefined" ? 230 : 150)
            if (requestCountExceeded) {
                const webhook: string|undefined = process.env.WEBHOOK_SERVER
                if (webhook) {
                    const sender: Webhook = new Webhook(webhook)
                    const embed: MessageBuilder = new MessageBuilder()
                        .setColor(1752220)
                        .setTitle('Serveur')
                        .setDescription(`BAN IP (Spam Packet)`)
                        .addField('Adresse IP', ip)
                        .addField('PID', pid !== undefined ? pid.toString() : "N/A")
                        .setTimestamp()
                    sender.send(embed).then()
                }

                global.db('bans')
                .where('ip_address', ip)
                .andWhere(function(): void {
                    this.whereNull('end_at')
                        .orWhere('end_at', '>', global.db.fn.now())
                })
                .then(existingBans => {
                    if (existingBans.length === 0) {
                        global.db.insert({
                            ip_address: ip,
                            message: `Spam packet`,
                            end_at: global.db.raw('DATE_ADD(NOW(), INTERVAL 5 MINUTE)'),
                            player_id: 2,
                            created_at: global.db.fn.now(),
                            updated_at: global.db.fn.now()
                        })
                            .into('bans')
                            .then()
                            .catch(r => console.log(`Err RateLimiter: ${r}`))
                    }
                })
                .catch(err => {
                    console.error('Error while checking banned IP address:', err)
                })

                console.warn('\x1b[31m%s\x1b[0m', `IP ${ip} has exceeded the rate limit. Banning in progress.`)
                if (process.env.PROD == "true") {
                    try {
                        execSync(`sudo iptables -C INPUT -p tcp -m multiport --dports 843,12301,12302,12303 -s ${ip} -j ACCEPT`)
                        execSync(`sudo iptables -D INPUT -p tcp -m multiport --dports 843,12301,12302,12303 -s ${ip} -j ACCEPT`)
                    } catch (error) {
                        console.error(`Err : RateLimiter ${ip} not exist`)
                    }   
                }
                this.bannedIPs.set(ip, now + this.banDuration) // Add ban end time
                return false
            }
        } else {
            if(pid !== undefined) {
                this.pidRequestsMap.set(pid, { requestCount: 1, lastRequestTime: now })
            } else {
                this.ipRequestsMap.set(ip, { requestCount: 1, lastRequestTime: now })
            }
        }
        return true
    }

    clearInactiveRequests(): void {
        const now: number = Date.now()
        for (const [ip, requestInfo] of this.ipRequestsMap.entries()) {
            const timeElapsedSinceLastRequest: number = now - requestInfo.lastRequestTime
            if (timeElapsedSinceLastRequest > 120000) {
                this.ipRequestsMap.delete(ip)
            }
        }

        for (const [pid, requestInfo] of this.pidRequestsMap.entries()) {
            const timeElapsedSinceLastRequest: number = now - requestInfo.lastRequestTime
            if (timeElapsedSinceLastRequest > 120000) {
                this.pidRequestsMap.delete(pid)
            }
        }
    }

    isIPBanned(ip: string): boolean {
        const now: number = Date.now()
        const banEndTime: number | undefined = this.bannedIPs.get(ip)
        return !!(banEndTime && now < banEndTime)
    }

    unbanIP(ip: string): void {
        console.log(`Revoking the ban for IP ${ip}.`)
        this.bannedIPs.delete(ip)
    }
}

export default RateLimiter