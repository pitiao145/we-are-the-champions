import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

// Configure the database
const appSettings = {
    databaseURL: "https://we-are-the-champions-39285-default-rtdb.asia-southeast1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)

const endorsementsInDB = ref(database, "endorsements")


const endorsementInput = document.getElementById("endorsement-input")
const fromInput = document.getElementById("from-input")
const toInput = document.getElementById("to-input")
const publishBtn = document.getElementById("publish-btn")
const endorsements = document.getElementById("endorsements")
// Store it and send it to the database
// Everytime there's a change to the database, get all the elements in it
// and display them on the page

function sendToDb(data) {
    push(endorsementsInDB, data)
}

function clearInputs() {
    endorsementInput.value = ""
    fromInput.value = ""
    toInput.value = ""
}

function clearEndorsements() {
    endorsements.innerHTML = ""
}

function publish() {
    const endorsement = endorsementInput.value
    sendToDb(endorsement)
    clearInputs()
}

function createEndorsement(text) {
    const endorsementBox = document.createElement("div")
    endorsementBox.className = "endorsement-box"
    const endorsementText = document.createElement("p")
    endorsementText.textContent = text
    endorsementBox.appendChild(endorsementText)
    endorsements.appendChild(endorsementBox)
}
// Lists endorsements starting with the last one (=most recent one) in the database
function listEndorsements(array) {
    for (let i = array.length - 1; i >= 0; i--) {
        const endorsementKey = array[i][0]
        const endorsementValue = array[i][1]
        // console.log("Key: " + endorsementKey + "| Value: " + endorsementValue)
        createEndorsement(endorsementValue)
    }
}

onValue(endorsementsInDB, function(snapshot) {
    if (snapshot.exists()) {
        clearEndorsements()
        let endorsementsArray = Object.entries(snapshot.val())
        listEndorsements(endorsementsArray)
    } else {
        const text = document.createElement("p")
        text.innerText = "No endorsements here yet"
        endorsements.append(text)
    }
})

publishBtn.addEventListener('click', publish)