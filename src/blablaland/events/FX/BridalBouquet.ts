import User from "../../../libs/blablaland/User"

class BridalBouquet {

    /**
     *
     * @param user
     */
    execute(user: User): void {
        user.interface.addInfoMessage(`${user.pseudo} a attrapé le bouquet de la mariée !`, {
            isMap: true
        })
    }
}

export default BridalBouquet