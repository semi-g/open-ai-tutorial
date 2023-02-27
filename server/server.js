import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})

//Initiate Open AI API
const openai = new OpenAIApi(configuration)

//Initiate server app
const app = express()
//Allows to make cross origins requests and allows to call server from front end
app.use(cors())
//Allows to pass JSON from front end to back end
app.use(express.json())

//Create a dummy route
app.get('/', async(req, res) => {
    res.status(200).send({
        message: 'Hello from codex.'
    })
})

//With get request can't get a lot of data, but with post request we can have a payload
app.post('/', async(req, res) => {
    try {
        const prompt = req.body.prompt
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${prompt}`, //Passed in from the front end
            temperature: 0.7, //Higher temp = model takes more risks (results in more variety in response)
            max_tokens: 200,
            top_p: 1,
            frequency_penalty: 0, //Higher penalty means model will return less 'same answers'
            presence_penalty: 0,
        })

        //Send response back to the front end
        res.status(200).send({
            bot: response.data.choices[0].text
        })
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ error })
    }
})

app.listen(5000, () => console.log('Server is running on port http://localhost:5000'))