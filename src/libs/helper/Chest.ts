import Winner, {Power, PowerWithKey} from "../blablaland/Winner"
import User from "../blablaland/User"

class Chest {

    static reward(user: User): string {
        const objectIds: number[] = [131, 169, 235, 236, 237, 238, 243, 264, 279, 295, 296, 299, 302, 313, 314, 315, 316, 318, 378]
            .sort(() => Math.random() - 0.5)

        const numberToPhraseMap: { [key: number]: string } = {
            131: "Drapeau Art'Club Halloween 2011",
            169: "Drapeau 4 ans Blablaland",
            235: "Peluche N400",
            236: "Masque N400",
            237: "Ballon N400",
            238: "Épee N400",
            243: "Drapeau 5 ans Blablaland",
            264: "Drapeau Japan Expo 2013",
            279: "Livre Artbook 2",
            295: "Drapeau Horia",
            296: "Tablette Horia",
            299: "Epée Horia",
            302: "MONTURE : Tortue Horia",
            313: "Marteau Paladin",
            314: "Chapeau du Mage",
            315: "Peluche Elfe",
            316: "Ballon Donjon",
            318: "Drapeau 6 ans Blablaland",
            378: "Drapeau Fin"
        }

        const winner: Winner = new Winner()
        let isRewardObject: boolean = Math.random() < 1/3
        let reward: string|undefined = undefined

        if (isRewardObject) {
            for (const objectId of objectIds) {
                const hasObject: boolean = winner.determineWinnerObject(user, objectId)
                if (!hasObject && reward === undefined) {
                    user.inventory.reloadOrInsertObject(objectId)
                    reward = numberToPhraseMap[objectId]
                }
            }
        }

        if (!reward) {
            let powers: { [key: number]: Power } = {
                1: { chatMessage: '100 BBL', action: (user: User) => user.updateBBL(100, false).then() },
                3: { chatMessage: '5 Téléporteurs', action: (user: User) => user.inventory.reloadOrInsertObject(3, {}, 5) },
                5: { chatMessage: '5 Bombes', action: (user: User) => user.inventory.reloadOrInsertObject(5, {}, 5) },
                6: { chatMessage: '5 Coeurs romantique', action: (user: User) => user.inventory.reloadOrInsertObject(6, {}, 5)},
                9: { chatMessage: '2 min de Blabicoptère', action: (user: User) => user.inventory.reloadOrInsertObject(9, { isSubtraction: false }, 120) },
                11: { chatMessage: '2 min de Jetpack', action: (user: User) => user.inventory.reloadOrInsertObject(11, { isSubtraction: false }, 120) },
                12: { chatMessage: '2 Lasers', action: (user: User) => user.inventory.reloadOrInsertObject(12, { isSubtraction: false }, 2) },
                13: { chatMessage: '10 Flageolets magiques', action: (user: User) => user.inventory.reloadOrInsertObject(13, { isSubtraction: false }, 10) },
                14: { chatMessage: '2 Potions de rapidité', action: (user: User) => user.inventory.reloadOrInsertObject(14, {}, 2) },
                17: { chatMessage: '2 Potions de miniaturisation', action: (user: User) => user.inventory.reloadOrInsertObject(17, { isSubtraction: false }, 2) },
                19: { chatMessage: '3 min de Moon Walk, l\'art de l\'envers', action: (user: User) => user.inventory.reloadOrInsertObject(19, { isSubtraction: false }, 180) },
                21: { chatMessage: '2 min de Corps astral', action: (user: User) => user.inventory.reloadOrInsertObject(21, { isSubtraction: false }, 120) },
                25: { chatMessage: '2 Ondes de choc', action: (user: User) => user.inventory.reloadOrInsertObject(25, { isSubtraction: false }, 2) },
                32: { chatMessage: '3 Trous noirs', action: (user: User) => user.inventory.reloadOrInsertObject(32, { isSubtraction: false }, 3) },
            }
            winner.addPower(powers)

            const randomPower: PowerWithKey|null = winner.getRandomPower()
            if (randomPower) {
                winner.handlePower(user, randomPower.power)
                reward = randomPower.power.chatMessage
            }
        }

        return `Tu as trouvé ${reward ?? 'Rien'} !!`
    }

}

export default Chest