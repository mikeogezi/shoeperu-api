'use strict'

const Product = require('../objects/Product')

const clarifai = require('../app/Clarifai')

const defPage = 1
const defPerPage = 400

let inputs = []
let addOtherInputsToDB = (page, perPage, finalCb) => {
    console.log(`Getting inputs for page ${page} at ${perPage} inputs per page`)
    clarifai.inputs.list({
        page: page,
        perPage: perPage
    })
        .then((res) => {
            for (let i = 0; i < res.length; ++i) {
                inputs.push(res[i])
            }

            // console.log(res.length, res[0])

            // Exhausted inputs
            if (res.length < perPage) {
                console.log(`${inputs.length} inputs have been exhausted`)
                finalCb(inputs)
                return
            }
            addOtherInputsToDB(++page, perPage, finalCb)
        }, (err) => {
            console.error(err)
        })
}

addOtherInputsToDB(defPage, defPerPage, (inputs) => {
    console.log(`Updating ${inputs.length} products in database`)

    for (let input of inputs) {
        let query = { imageUrl: input.imageUrl }
        let change = { $set: { cId: input.id } }
        
        // console.log(query, change)
        
        Product.update(query, change, (err, num) => {
            if (err) {
                console.error(err)
            }
        })
    }
})