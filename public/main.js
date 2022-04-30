// Focus div based on nav button click


// Flip one coin and show coin image to match result when button clicked\
const singleFlip = document.getElementById("singlenav")
singleFlip.addEventListener("click", flipOne)

async function flipOne() {

    const theURL = document.baseURI + "app/flip/"

    await fetch(theURL)
        .then(function(response) {
            return response.json()
        })
            .then(function(result){
                document.getElementById("single").innerHTML = result.flip
            })
    
}
// Flip multiple coins and show coin images in table as well as summary results
const multFlips = document.getElementById("multinav")
multFlips.addEventListener("click", flipMult)

async function flipMult() {

    const theURL = document.baseURI + "app/flips/10"

    await fetch(theURL)
        .then(function(response) {
            return response.json()
        })
            .then(function(result){
                document.getElementById("multi").innerHTML = result.raw
            })
    
}

// Enter number and press button to activate coin flip series

// Guess a flip by clicking either heads or tails button
const guessFlip = document.getElementById("guessnav")
guessFlip.addEventListener("click", flipGuess)

async function flipGuess() {

    // const theDiv = document.getElementById("guess")
    // var input = div.querySelector('.choice');
    // var value = input.value

    const theURL = document.baseURI + "app/flip/call/" + "heads"

    // document.getElementById("guess").innerHTML = value

    await fetch(theURL)
        .then(function(response) {
            return response.json()
        })
            .then(function(result){
                document.getElementById("guess").innerHTML = result.result
            })
    
}