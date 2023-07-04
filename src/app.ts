import dotenv from "dotenv"
import express, { Request, Response } from "express"
import axios from "axios"
import { client } from "./config/connect"
import cors from "cors"

dotenv.config()

const app : express.Application = express()

const PORT = process.env.PORT || 7000

app.use(cors())
app.use(express.json())

async function isDataModified () {
    const response = await axios.get("https://pleasant-newt-girdle.cyclic.app/api/modified")
    return response.data.modified
}

async function getAllUsers () {
    const response = await axios.get("https://pleasant-newt-girdle.cyclic.app/api/users")
    return response.data
}

app.use("/get-users", async (req : Request, res : Response) => {

    let result;
    let isCahed;

    try {

        const data = await isDataModified()

        if (data === true) {
            result = await getAllUsers()
            isCahed = false
            await client.set("all_users", JSON.stringify(result))
        } 

        else {

            const isCahedInRedis = await client.get("all_users");

            if (isCahedInRedis) {

                isCahed = true
                result = JSON.parse(isCahedInRedis)
            }

           else {
                result = await getAllUsers()
                isCahed = false

                await client.set("all_users", JSON.stringify(result))
           }

        }

        return res.status(200).json({
            isCahed,
            result : result
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({error})
    }
})

const start = async () => {
    try {
        await client.connect()
        app.listen(PORT, () => {
            console.log(`Server is connected to redis and is listening on port ${PORT}`)
        })
    } catch (error) {
        console.log(error)
    }
}

start()