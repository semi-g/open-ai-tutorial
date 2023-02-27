import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

//Function to simulate the loading dots
function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        element.textContent += '.'

        if (element.textContent === '....') {
            element.textContent = ''
        }
    }, 300)
}

//Function to simulate typing (letter per letter)
function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

function generateUniqueId() {
    const timestamp = Date.now()
    const randomNumber = Math.random()
    const hexadecimalString = randomNumber.toString(16)

    return `id-${timestamp}-${hexadecimalString}`
}

//Function to style the chat app -> in lines of different color
function chatStripe (isAi, value, uniqueId) {
    //Return a template string that can be styled
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img src="${isAi ? bot : user}"/>
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
        `
    )
}

//Function to handle the API to GPT
const handleSubmit = async (e) => {
    //Default browser behavior when form is submitted is to reload the page -> undesirable behavior
    e.preventDefault()
    const data = new FormData(form)

    //Generate user's chat stripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
    form.reset()

    //Generate AI's chat stripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)
    //Automatically scroll down when new message is generated
    chatContainer.scrollTop = chatContainer.scrollHeight

    const messageDiv = document.getElementById(uniqueId)
    loader(messageDiv)   

    //Fetch data from server (bot's response)
    const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    //To get rid of the the loading dots
    clearInterval(loadInterval)
    messageDiv.innerHTML = ''

    if (response.ok) {
        //Get the Open AI response
        const data = await response.json()
        //Parse date
        const parsedData = data.bot.trim()
        
        //Call the typeText function to type out response letter per letter
        typeText(messageDiv, parsedData)
    }
    else {
        //If an error has occured, and there is no valid json response -> display the error
        const err = await response.text()
        messageDiv.innerHTML = "Something went wrong."
        alert(err)
    }
}

//Event listener to initiate the handle function -> when pressed on the submit button
form.addEventListener('submit', handleSubmit)
//Event listener to initiate the handle function -> when pressed on enter key
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})