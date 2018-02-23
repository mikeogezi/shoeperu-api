'use strict'

const Product = require('../objects/Product')

const clarifai = require('../app/Clarifai')

const maxImagesLimit = 128
const defaultImagesLimit = maxImagesLimit
const maxProductsToIndex = 3000

let indexProducts = () => {
    console.log(`Adding images to Machine Learning database`)
    
    let cQuery = { cId: '' }
    Product.get(cQuery, (err, docs) => {
        if (err) {
            console.error(`Error while getting products`, err)
        }
        else {
            docs.length = maxProductsToIndex <= 0 ? docs.length : maxProductsToIndex
            console.log(`${docs.length} products in database`)

            let offset = 0
            let limit = defaultImagesLimit
            let inputs = []

            let addToIndex = (offset, limit, finalCb) => {
                console.log(`Indexing progress: ${offset >= docs.length ? docs.length : offset}` +
                            `/${docs.length}`)

                if (offset >= docs.length) {
                    console.log(`Finished indexing images`)
                    
                    return finalCb()
                }

                let products = docs.slice(offset, offset + limit)
                let images = products.map((product) => {
                    return { url: product.imageUrl }
                })

                // console.log(images)
                console.log(`Indexing ${products.length} products at this time`)
                
                clarifai.inputs.create(images)
                    .then((res) => {
                        for (let i = 0; i < res.length; ++i) {
                            inputs.push(res[i])
                        }
                        
                        offset += limit

                        addToIndex(offset, limit, finalCb)
                    }, (err) => {
                        console.error(err)
                        finalCb()
                    })
            }

            addToIndex(offset, limit, () => {
                console.log(`Updating ${inputs.length} products in database`)
                // console.log(inputs)

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
        }
    })
}

// let childProcess = require('child_process')

// console.log(`Getting already indexed inputs`)
// childProcess.execSync(`node ./scripts/populateWithAlreadyIndexed.js`)
// console.log(`Gotten already indexed inputs`)

let clearML = false
if (clearML) {
    clarifai.inputs.delete()
        .then((res) => {
            console.log(`Deleted all previous ML inputs`)
            indexProducts()
        }, (err) => {
            console.error(`Error deleting ML inputs`, err)
        })
}
else {
    indexProducts()
}