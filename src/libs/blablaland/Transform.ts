import User from "./User"
import SocketMessage from "./network/SocketMessage"
import { ObjectType, ParamsFX } from "../../interfaces/blablaland"
import Objects from "../../json/objects.json"
import GlobalProperties from "./network/GlobalProperties"
import SkinColor from "./SkinColor"

class Transform {

    private user: User

    constructor(user: User) {
        this.user = user
    }

    /**
     *
     * @param id
     */
    potion(id: number): void {
        const FX: ParamsFX|undefined = this.user.hasFX(6, `POTION_${id}`)
        const item: ObjectType|undefined = Objects.find(obj => obj.id === id)
        if (!FX && item) {
            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(8, 60) // time
            let itemId: number = item.id

            switch (item.id) {
                case 80:
                    this.caca('23')
                    break
                case 116:
                    this.fantom()
                    break
                case 165:
                    itemId = 1
                    break
                case 166:
                    this.caca('24')
                    break
                case 208:
                    this.bat()
                    break
                case 214:
                    this.penguin()
                    break
                case 377:
                    this.nyanCat()
                    break
                default:
                    break
            }

            const params: ParamsFX = {
                id: 6,
                sid: item.id,
                data: [item.fxFileId, itemId, socketMessage],
                identifier: `POTION_${item.id}`,
                duration: 60,
            }
            this.user.userFX.writeChange(params)

            if (item.id > 100 && item.id != 377) { // Except NyanCat
                const socketMessage: SocketMessage = new SocketMessage()
                socketMessage.bitWriteUnsignedInt(8, 60)
                this.user.userFX.writeChange({
                    id: 6,
                    data: [18, 80, socketMessage],
                    isPersistant: false
                })
            }
        }
    }

    paint(colors: number[]): void {
        const FX: ParamsFX|undefined = this.user.hasFX(3, `PAINT`)
        if (FX) {
            this.user.userFX.dispose(FX)
        }
        this.user.userFX.writeChange({
            id: 3,
            data: colors,
            identifier: 'PAINT',
            isPersistant: true,
        })
    }

    /**
     * Lightning Effect
     */
    lightningEffect(duration?: number): void {
        const FX: boolean = !this.user.hasFX(6, `LIGHTNING_EFFECT`)

        if (FX) {
            const socketMessage: SocketMessage = new SocketMessage()
            socketMessage.bitWriteUnsignedInt(8,  duration ?? 15) // time
            socketMessage.bitWriteBoolean(true)

            const params: ParamsFX = {
                id: 6,
                identifier: `LIGHTNING_EFFECT`,
                data: [35, 0, socketMessage],
                duration:  duration ?? 15
            }
            this.user.userFX.writeChange(params)
        }
    }

    /**
     * @param name
     */
    clan(name: string|undefined): void {
        const FX: ParamsFX|undefined = this.user.hasFX(4, `CLAN`)
        if (FX) this.user.userFX.dispose(FX)
        if (name) {
            this.user.userFX.writeChange({
                id: 4,
                identifier: `CLAN`,
                isYourself: true,
                isProtected: true,
                data: {
                    pseudo: ` [${name}]`
                }
            })
        }
    }

    /**
     * Transform to ghost
     * @param id
     * @param duration
     */
    ghostParadise(id: number, duration?: number): void {
        const FX: ParamsFX|undefined = this.user.hasFX(4, id.toString())
        if (FX) this.user.userFX.dispose(FX)
        this.user.userFX.writeChange({
            id: 4,
            sid: id,
            duration: duration ? 15 : undefined,
            isYourself: true,
            data: {
                skinId: this.user.gender != 2 ? 405 : 404,
                duration: duration ? 15 : undefined,
            }
        })
    }

    fish(): void {
        const FX: ParamsFX|undefined = this.user.hasFX(4, '13')
        if (!FX) {
            this.clear()
            this.user.userFX.writeChange({
                id: 4,
                sid: 13,
                data: {
                    skinId: 270
                }
            })
        } else {
            this.user.userFX.dispose(FX)
        }
    }

    /**
     * @param duration
     */
    skeleton(duration?: number): void {
        this.clear()
        let FX: ParamsFX|undefined = this.user.hasFX(4, '40')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 40,
                isYourself: true,
                duration: duration ?? 15,
                data: {
                    skinId: 95,
                    duration: duration ?? 15
                }
            })
        }
    }

    /**
     * @param duration
     */
    lapinouChristmas(duration?: number): void {
        this.clear()
        let FX: ParamsFX|undefined = this.user.hasFX(4, '79')
        if (!FX) {
            const listSkin: Array<number> = [334, 335, 336]
            const skin: number = listSkin[Math.floor(Math.random() * listSkin.length)]
            this.user.userFX.writeChange({
                id: 4,
                sid: 79,
                isYourself: true,
                duration: duration ?? 15,
                data: {
                    skinId: skin,
                    duration: duration ?? 15
                }
            })
        }
    }

    /**
     * @param skinId
     * @param duration
     */
    magicianChristmas(skinId: number, duration?: number) {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, '5')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 5,
                isYourself: true,
                duration: duration ?? 15,
                data: {
                    skinId: skinId,
                    duration: duration ?? 15
                }
            })
        }
    }

    /**
     * @param duration
     */
    lapinou(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, '67')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 67,
                isYourself: true,
                duration: duration ?? 15,
                data: {
                    skinId: 484,
                    duration: duration ?? 15
                }
            })
        }
    }

    /**
     * @param duration
     */
    heartBubble(duration?: number): void {
        const FX: ParamsFX|undefined = this.user.hasFX(4, 'HEARTBUBBLE')
        if (!FX) {
            const dateServer: number = Date.now()
            const socketMessage: SocketMessage = new SocketMessage()
            socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
            socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000) + 15)

            this.user.userFX.writeChange({
                id: 6,
                identifier: `HEARTBUBBLE`,
                data: [23, 155, socketMessage],
                duration: duration ?? 15
            })
        }
    }

    nyanCat(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, '88')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 88,
                isYourself: true,
                duration: duration ?? 60,
                data: {
                    skinId: 700,
                    duration: duration ?? 60
                }
            })
        }
    }

    /**
     * @param duration
     */
    feather(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, 'FEATHER')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                identifier: `FEATHER`,
                isYourself: true,
                duration: duration ?? 60,
                data: {
                    skinId: 657,
                    duration: duration ?? 60
                }
            })
        }
    }

    /**
     * @param duration
     */
    heart(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, '22')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 22,
                isYourself: true,
                duration: duration ?? 60,
                data: {
                    skinId: 137,
                    duration: duration ?? 60
                }
            })
        }
    }

    /**
     * @param duration
     */
    stValentineHeart(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, `ST_VALENTINE_HEART`)
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                identifier: `ST_VALENTINE_HEART`,
                isYourself: true,
                duration: duration ?? 15,
                data: {
                    skinId: 489,
                }
            })
        }
    }

    /**
     * @param duration
     */
    coconut(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, '81')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 81,
                isYourself: true,
                duration: duration ?? 60,
                data: {
                    skinId: 652,
                    duration: duration ?? 60
                }
            })
        }
    }

    /**
     * @param duration
     */
    penguin(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, '70')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 70,
                isYourself: true,
                duration: duration ?? 60,
                data: {
                    skinId: 328,
                    duration: duration ?? 60
                }
            })
        }
    }

    /**
     * @param duration
     */
    lollipop(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, 'LOLLIPOP')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                identifier: `LOLLIPOP`,
                isYourself: true,
                duration: duration ?? 15,
                data: {
                    skinId: 432,
                    duration: duration ?? 15
                }
            })
        }
    }

    /**
     * @param duration
     */
    chick(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, 'CHICK')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                identifier: `CHICK`,
                isYourself: true,
                duration: duration ?? 15,
                data: {
                    skinId: 445,
                    duration: duration ?? 15
                }
            })
        }
    }

    /**
     * @param duration
     */
    crystal(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, 'CRYSTAL')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                identifier: `CHICK`,
                isYourself: true,
                duration: duration ?? 15,
                data: {
                    skinId: 447,
                    duration: duration ?? 15
                }
            })
        }
    }

    /**
     * @param duration
     */
    iceCube(duration?: number): void {
        this.clear()
        let FX = this.user.hasFX(4, 'ICECUBE')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                identifier: `ICECUBE`,
                isYourself: true,
                duration: duration ?? 15,
                data: {
                    skinId: 446,
                    duration: duration ?? 15
                }
            })
        }
    }

    electrify(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, 'ELECTRIFY')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                identifier: `ELECTRIFY`,
                isYourself: true,
                duration: duration ?? 1,
                data: {
                    skinId: 448,
                    duration: duration ?? 1
                }
            })
        }
    }

    /**
     * @param duration
     */
    gift(duration?: number) {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, 'GIFT')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                identifier: `GIFT`,
                isYourself: true,
                duration: duration ?? 60,
                data: {
                    skinId: 114,
                    duration: duration ?? 60
                }
            })
        }
    }

    /**
     * @param duration
     */
    bigGift(duration?: number) {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, 'BIG_GIFT')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                identifier: `BIG_GIFT`,
                isYourself: true,
                duration: duration ?? 60,
                data: {
                    skinId: 462,
                    duration: duration ?? 60
                }
            })
        }
    }

    /**
     * @param duration
     */
    bat(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, '69')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 69,
                isYourself: true,
                duration: duration ?? 60,
                data: {
                    skinId: 226,
                    duration: duration ?? 60
                }
            })
        }
    }

    /**
     * @param id
     * @param duration
     */
    caca(id: string, duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, id)
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: parseInt(id),
                isYourself: true,
                duration: duration ?? 60,
                data: {
                    skinId: 97,
                    duration: duration ?? 60
                }
            })
        }
    }

    /**
     * @param duration
     */
    fantom(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, '28')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 28,
                isYourself: true,
                duration: duration ?? 60,
                data: {
                    skinId: 405,
                    duration: duration ?? 60
                }
            })
        }
    }

    /**
     * @param duration
     */
    prince(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, 'PRINCE')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                isYourself: true,
                identifier: `PRINCE`,
                duration: duration ?? 15,
                data: {
                    skinId: 293,
                    skinColor: [2, 40, 88, 2, 76, 74, 74, 76, 56, 64],
                    duration: duration ?? 15
                }
            })
        }
    }

    /**
     * @param duration
     */
    strawberry(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, '4')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 4,
                isYourself: true,
                duration: duration ?? 60,
                data: {
                    skinId: 483,
                    duration: duration ?? 60
                }
            })
        }
    }

    /**
     * Transform user to canon
     */
    canon(): void {
        const FX: ParamsFX|undefined = this.user.hasFX(4, `CANON`)
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                identifier: `CANON`,
                isYourself: true,
                memory: false, // The cannon is fired
                data: {
                    skinId: 356
                },
            })
        } else {
            if (!FX.memory) {
                this.user.userFX.dispose(FX)
            }
        }
    }

    /**
     * Transform user to alien
     */
    alien(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, `11`)
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 11,
                isYourself: true,
                duration: duration ?? 15,
                data: {
                    skinId: 30,
                    skinColor: [35, 10, 35, 35, 35, 35, 35, 35, 35, 35],
                    size: 30,
                    duration: duration ?? 15
                }
            })
        }
    }

    /**
     * Transform user to easter egg
     */
    easterEgg(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, `19`)
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 19,
                isYourself: true,
                duration: duration ?? 15,
                data: {
                    skinId: 372,
                    duration: duration ?? 15
                }
            })
        }
    }

    /**
     * @param duration
     */
    dead(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, `5`)
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 5,
                isYourself: true,
                duration: duration ?? 15,
                data: {
                    skinId: 227,
                }
            })
        }
    }

    /**
     * User to apple
     * @param duration
     */
    apple(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, `18`)
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 18,
                isYourself: true,
                duration: duration ?? 15,
                data: {
                    skinId: 313,
                }
            })
        }
    }


    /**
     * User to snowman
     * @param duration
     */
    snowman(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, `SNOWMAN`)
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                identifier: `SNOWMAN`,
                isYourself: true,
                duration: duration ?? 15,
                data: {
                    skinId: 115,
                }
            })
        }
    }
    /**
     * User to butterfly
     * @param duration
     */
    butterfly(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, `4`)
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 4,
                isYourself: true,
                duration: duration ?? 15,
                data: {
                    skinId: 502,
                }
            })
        }
    }

    /**
     * User to zombie
     */
    zombie(skinColor?: number[], duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, `34`)
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 34,
                isYourself: true,
                duration: duration ?? 60,
                data: {
                    skinId: 230,
                    skinColor: skinColor ?? undefined
                }
            })
        }
    }

    /**
     * User to wolf
     */
    wolf(): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, `WOLF`)
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                identifier: `WOLF`,
                isYourself: true,
                data: {
                    skinId: this.user.skinId == 518 ? 519 : 521,
                }
            })
        }
    }

    /**
     * User to kitsune
     */
    kitsune(type: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, `KITSUNE`)
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                identifier: `KITSUNE`,
                isYourself: true,
                data: {
                    skinId: type === 1 ? 621 : 622,
                }
            })
        }
    }

    /**
     * User to chimera
     */
    chimera(duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, `CHIMERA`)
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                identifier: `CHIMERA`,
                isYourself: true,
                data: {
                    skinId: 697,
                }
            })
        }
    }

    /**
     * @param skinId
     * @param pseudo
     * @param duration
     */
    nightMonster(skinId: number, pseudo: string, duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, `4`)
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 4,
                isYourself: true,
                data: {
                    skinId: skinId,
                    pseudo: `\n(${pseudo})`
                }
            })
        }
    }

    /**
     * Copy skin
     * @param skinId
     * @param skinColor
     * @param duration
     */
    copy(skinId: number, skinColor?: number[], duration?: number): void {
        this.clear()
        const FX: ParamsFX|undefined = this.user.hasFX(4, `5`)
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 5,
                isYourself: true,
                duration: duration ?? 15,
                data: {
                    skinId: skinId,
                    skinColor: skinColor ?? undefined
                }
            })
        }
    }

    /**
     * @param duration
     */
    cow(duration?: number): void {
        this.clear()
        let FX: ParamsFX|undefined = this.user.hasFX(4, '41')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                sid: 41,
                isYourself: true,
                duration: duration ?? 15,
                data: {
                    skinId: 274,
                    duration: duration ?? 15
                }
            })
        }
    }

    pharaoh(): void {
        const FX: ParamsFX|undefined = this.user.hasFX(4, 'PHARAOH')
        if (FX) {
            this.user.userFX.dispose(FX)
        } else {
           this.clearAll(this.clearBlibli([168, 188]))
            this.user.userFX.writeChange({
                id: 4,
                sid: 27,
                identifier: `PHARAOH`,
                data: {
                    skinId: this.user.gender != 2 ? 536 : 535,
                },
                memory: Math.floor(Date.now() / 1000)
            })
        }
    }

    marauder(): void {
        const FX: ParamsFX|undefined = this.user.hasFX(4, 'MARAUDER')
        if (!FX) {
            if ([636, 637].includes(this.user.skinId)) {
                this.user.userFX.writeChange({
                    id: 4,
                    identifier: `MARAUDER`,
                    data: {
                        skinId: this.user.skinId + 3,
                    },
                })
            }
        } else {
            this.user.userFX.dispose(FX)
        }
    }

    adventurer(): void {
        const FX: ParamsFX|undefined = this.user.hasFX(4, 'ADVENTURER')
        if (!FX) {
            this.user.userFX.writeChange({
                id: 4,
                identifier: `ADVENTURER`,
                data: {
                    skinId: this.user.gender != 2 ? 629 : 630,
                },
            })
        } else {
            this.user.userFX.dispose(FX)
        }
    }

    char(): void {
        const FX: ParamsFX|undefined = this.user.hasFX(4, 'CHAR')
        if (FX) {
            this.user.userFX.dispose(FX)
        } else {
            this.clearAll(this.clearBlibli([270]))
            const socketMessage: SocketMessage = new SocketMessage()
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SKIN_ID, this.user.skinId)
            SkinColor.exportBinaryColor(socketMessage, this.user.skinColor)

            this.user.userFX.writeChange({
                id: 4,
                sid: 32,
                identifier: `CHAR`,
                data: {
                    skinId: 585,
                    skinColor: [15, 17, 81, 0, 0, 0, 0, 0, 0, 0, 0],
                    binary: socketMessage
                },
                memory: [Math.floor(Date.now() / 1000), 0]
            })
        }
    }

    spies(): void {
        const FX: ParamsFX|undefined = this.user.hasFX(4, 'SPIES')
        if (FX) {
            this.user.userFX.dispose(FX)
        } else {
            this.clear()
            this.user.userFX.writeChange({
                id: 4,
                identifier: `SPIES`,
                data: {
                    skinId: this.user.skinId + 3
                }
            })
        }
    }

    /**
     * Clear FX 4
     */
    clear(): void {
        for (let FX of this.user.userFX.getListFX()) {
            if (FX.id == 4 && !FX.isProtected) {
                this.user.userFX.dispose(FX)
            }
        }
    }

    /**
     * clearBlibli
     */
    clearBlibli(except?: number[]): ParamsFX[] {
        const items: ParamsFX[] = []

        for (let FX of this.user.userFX.getListFX()) {
            if (FX.id === 6 && FX.identifier?.includes(`BLIBLI`)) {
                if (except?.includes(FX.memory)) {
                    items.push(FX)
                } else {
                    this.user.userFX.dispose(FX)
                }
            }
        }
        return items
    }


    /**
     * Clear All
     */
    clearAll(except?: ParamsFX[]): void {
        const listIdentifier: string[] = [`ASTRALBODY_${this.user.id}`]

        for (let FX of this.user.userFX.getListFX()) {
            if (!FX.isProtected  && (!except || !except.includes(FX))) {
                this.user.userFX.dispose(FX)
            }
        }
        for (let identifier of listIdentifier) {
            listIdentifier.forEach((identifier: string) => this.user.disposeMapFX(5, identifier))
        }
    }
}

export default Transform