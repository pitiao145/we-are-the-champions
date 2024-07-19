import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, get, update, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

// Configure the database
const appSettings = {
    databaseURL: "https://we-are-the-champions-39285-default-rtdb.asia-southeast1.firebasedatabase.app/"
}
const app = initializeApp(appSettings)
const database = getDatabase(app)
const endorsementsInDB = ref(database, "endorsements")

// Assign DOM variables
const endorsementInput = document.getElementById("endorsement-input")
const fromInput = document.getElementById("from-input")
const toInput = document.getElementById("to-input")
const publishBtn = document.getElementById("publish-btn")
const endorsements = document.getElementById("endorsements")
const clearBtn = document.getElementById("clear-btn")
// Functions
//Define an endorsement object
function Endorsement(text, from, to) {
    this.text = text;
    this.from = from;
    this.to = to;
    this.likes = 0;
}

// Sends an endorsement object to the DB
function sendToDb(data) {
    push(endorsementsInDB, data)
}

// Clears all the inputs
function clearInputs() {
    endorsementInput.value = ""
    fromInput.value = ""
    toInput.value = ""
}

// Clears the endorsement field
function clearEndorsements() {
    endorsements.innerHTML = ""
}

// Grabs the inputs from the users and send them to the DB
function publish() {
    //Get endorsement data
    const endorsementText = endorsementInput.value
    const from = fromInput.value
    const to = toInput.value
    const endorsement = new Endorsement(endorsementText, from, to)
    sendToDb(endorsement)
    clearInputs()
}

function createEndorsementBox(id, delay) {
    const endorsementBox = document.createElement("div")
    endorsementBox.className = "endorsement-box"
    endorsementBox.id = id
    endorsementBox.addEventListener('dblclick', function () {
        handleLike(id)
    })
    endorsementBox.style.animationDelay = `${delay}s`; // Set animation delay
    return endorsementBox
}

function createEndorsementText(text) {
    const endorsementText = document.createElement("p")
    endorsementText.textContent = text
    return endorsementText
}

function createFromToHeartSpan(toFromHeart, name, likes) {
    const span = document.createElement("span")
    if (toFromHeart === "to") {
        span.textContent = "To " + name
        span.className = "to-span"
    } else if (toFromHeart === "from") {
        span.textContent = "From " + name
        span.className = "from-span"
    } else if (toFromHeart === "heart") {
        span.textContent = "❤ " + likes
        span.className = "hearts"
    }
    return span
}

// To create a visual for an endorsment pulled from DB.
function createEndorsement(id, from, to, text, likes, delay) {
    const endorsementBox = createEndorsementBox(id, delay)
    const endorsementText = createEndorsementText(text)
    const toSpan = createFromToHeartSpan("to", to)
    const fromSpan = createFromToHeartSpan("from", from)
    const hearts = createFromToHeartSpan("heart", to, likes)
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
        // console.log("ID: " + endorsementID)
        // console.log("From: " + endorsementFrom)
        // console.log("To: " + endorsementTo)
        // console.log("Text: " + endorsementText)
        // console.log("Likes: " + endorsementLikes)
        // console.log("Key: " + endorsementKey + "| Value: " + endorsementValue)
        const delay = i * 0.2
        createEndorsement(endorsementID, endorsementFrom, endorsementTo, endorsementText, endorsementLikes, delay)
    }
}

// Handles a double click on an endorsement depending on if it was already liked by the user or not
function handleLike(id) {
    // Get the path to the required endorsement
    const path = `endorsements/${id}`
    // Get the current amount of likes on the endorsement
    const databaseItem = ref(database, path)
    // console.log("Ref: " + databaseItem)
    get(databaseItem)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const currentLikes = snapshot.val().likes
                if (localStorage.getItem(id) != "liked") {
                    addLikeInDB(databaseItem, currentLikes)
                    localStorage.setItem(id, "liked")
                } else if (localStorage.getItem(id) === "liked") {
                    removeLikeInDB(databaseItem, currentLikes)
                    localStorage.setItem(id, "not liked")
                }
            } else {
                console.log("No data available for the likes");
            }
        })
        .catch((error) => {
            console.error("Error getting data: ", error);
        });
}

// Adds 1 like to an item in the DB
function addLikeInDB(item, currentLikes) {
    const newLikes = currentLikes + 1
    // Update the like count
    const updates = { likes: newLikes }
    update(item, updates)
        .then(() => {
            console.log("Data updated successfully.");
        })
        .catch((error) => {
            console.error("Error updating data: ", error);
        });
}

// Removes 1 like to an item in the DB
function removeLikeInDB(item, currentLikes) {
    const newLikes = currentLikes - 1
    // Update the like count
    const updates = { likes: newLikes }
    update(item, updates)
        .then(() => {
            console.log("Data updated successfully.");
        })
        .catch((error) => {
            console.error("Error updating data: ", error);
        });
}

function clearAllEndorsementsInDB() {
    clearEndorsements()
    set(endorsementsInDB, null)
}

publishBtn.addEventListener('click', function () {
    if (endorsementInput.value === "" || fromInput.value === "" || toInput.value === "") {
        alert("Please fill in all the fields")
    } else {
        publish()
    }
})

clearBtn.addEventListener('click', function(snapshot) {
    clearAllEndorsementsInDB()
    console.log("Database cleared")
})

// Render the endorsement feed on any DB change
onValue(endorsementsInDB, function (snapshot) {
    if (snapshot.exists()) {
        clearEndorsements()
        let endorsementsArray = Object.entries(snapshot.val())
        // console.log(endorsementsArray)
        listEndorsements(endorsementsArray)
        clearBtn.style.display = "block"
    } else {
        const text = document.createElement("p")
        text.innerText = "No endorsements here yet"
        endorsements.append(text)
        clearBtn.style.display = "none"
    }
})
