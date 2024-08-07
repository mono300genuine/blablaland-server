import Database from "../libs/Database"
import { writeFile } from "fs"
import { MapDefinition } from "../interfaces/blablaland"

let params = { host: '127.0.0.1', user: 'root', database:'blablaland_dev' }
const db = new Database(params).connect()

let listMaps: Array<MapDefinition> = new Array<MapDefinition>()

const importMaps = async () => {
    let maps = await db.select('*').from('maps')
    if (maps) {
        for (let item of maps) {
            let mapDatabase = {
                id: item.id,
                name: item.name,
                positionX: item.positionX ,
                positionY: item.positionY,
                respawnX: item.respawnX,
                respawnY: item.respawnY,
                protected: item.protected,
                individual: item.individual,
                giftReceiver: item.gift_receiver,
                fileId: item.file_id,
                meteoId: item.meteo_id,
                transportId: item.transport_id ,
                regionId: item.region_id,
                planetId: item.planet_id,
                paradisId: item.paradis_id,
                gradeId: item.grade_id,
                createdAt: item.created_at,
                updatedAt: item.updated_at
            }
            listMaps.push(mapDatabase)
        }
        let toJson: string = JSON.stringify(listMaps)
        writeFile(`${__dirname}/maps.json`, toJson, (err) => {
            if (err) {
                throw new Error(err.message)
            }
        })
    }
}
importMaps().then(r => console.info(`Done => ${__dirname}/maps.json`))