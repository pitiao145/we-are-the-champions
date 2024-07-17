import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, get, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

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

//To create an endorsement object
function Endorsement(text, from, to) {
    this.text = text;
    this.from = from;
    this.to = to;
    this.likes = 0;
}

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
    //Get endorsement data
    const endorsementText = endorsementInput.value
    const from = fromInput.value
    const to = toInput.value
    const endorsement = new Endorsement(endorsementText, from, to)
    sendToDb(endorsement)
    clearInputs()
}

function createEndorsement(id, from, to, text, likes) {
    const endorsementBox = document.createElement("div")
    endorsementBox.className = "endorsement-box"
    endorsementBox.id = id
    endorsementBox.addEventListener('dblclick', function() {
        addLike(id)
    })
    const endorsementText = document.createElement("p")
    endorsementText.textContent = text
    const toSpan = document.createElement("span")
    const fromSpan = document.createElement("span")
    const hearts = document.createElement("span")
    toSpan.textContent = "To " + to
    fromSpan.textContent = "From " + from
    hearts.textContent = "❤ " + likes
    toSpan.className = "to-span"
    fromSpan.className = "from-span"
    hearts.className = "hearts"
    endorsementBox.appendChild(toSpan)
    endorsementBox.appendChild(endorsementText)
    endorsementBox.appendChild(fromSpan)
    endorsementBox.appendChild(hearts)
    endorsements.appendChild(endorsementBox)
}
// Lists endorsements starting with the last one (=most recent one) in the database
function listEndorsements(array) {
    for (let i = array.length - 1; i >= 0; i--) {
        const endorsementID = array[i][0]
        const endorsementFrom = array[i][1].from
        const endorsementTo = array[i][1].to
        const endorsementText = array[i][1].text
        const endorsementLikes = array[i][1].likes
        console.log("ID: " + endorsementID)
        console.log("From: " + endorsementFrom)
        console.log("To: " + endorsementTo)
        console.log("Text: " + endorsementText)
        console.log("Likes: " + endorsementLikes)
        // console.log("Key: " + endorsementKey + "| Value: " + endorsementValue)
        createEndorsement(endorsementID, endorsementFrom, endorsementTo, endorsementText, endorsementLikes)
    }
}

onValue(endorsementsInDB, function(snapshot) {
    if (snapshot.exists()) {
        clearEndorsements()
        let endorsementsArray = Object.entries(snapshot.val())
        console.log(endorsementsArray)
        listEndorsements(endorsementsArray)
    } else {
        const text = document.createElement("p")
        text.innerText = "No endorsements here yet"
        endorsements.append(text)
    }
})

function addLike(id) {
    // Get the path to the required endorsement
    const path = `endorsements/${id}`
    console.log(path)
    // Get the current amount of likes on the endorsement
    var databaseItem = ref(database, path)
    console.log("Ref: " + databaseItem)
    get(databaseItem)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const currentLikes = snapshot.val().likes
                console.log(currentLikes)
                const newLikes = currentLikes + 1
                // Update the like count
                const updates = {likes: newLikes}
                
                update(databaseItem, updates)
                    .then(() => {
                        console.log("Data updated successfully.");
                    })
                    .catch((error) => {
                        console.error("Error updating data: ", error);
                    });
            
            } else {
                console.log("No data available for the likes");
            }
        })
        .catch((error) => {
            console.error("Error getting data: ", error);
        });

}




publishBtn.addEventListener('click', publish)

