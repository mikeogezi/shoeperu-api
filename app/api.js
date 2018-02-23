'use strict'

let util = require('util')
let uuid = require('uuid')
let path = require('path')
let fs = require('fs')

let clarifai = require('./Clarifai')
let shopstyle = require('./Shopstyle')

let Product = require('../objects/Product')

const maxResults = 30

const apiMsg = {
    message: 'Welcome to Shoeperu\'s API, The server is working properly'
}

let categories = [
    'bridal-shoes',
    'womens-shoes',
    'shoes-athletic',
    'boots',
    'evening-shoes',
    'sandals',
    'womens-sneakers',
    'mens-shoes',
    'mens-shoes-athletic',
    'mens-boots',
    'mens-sandals',
    'mens-lace-up-shoes',
    'mens-slip-ons-shoes',
    'mens-sneakers',
    'boys-shoes',
    'girls-shoes'
]

let usdToNairaEx = 150
let usdToNaira = (dollarPrice) => {
    let toks = dollarPrice.split(' ')
    let price = parseFloat((parseFloat(toks[1]) * usdToNairaEx).toPrecision(3))
    return `₦ ${Number(price).toLocaleString()}`
}

module.exports = {
    index: (req, res, next) => {
        res.status(200).json(apiMsg)
    },
    
    search: (req, res, next) => {
        const { url, image, name } = req.body

        // console.log(req.body)

        let input = {}

        if (image) {
            input.base64 = image
            // fs.writeFile(`./uploads/${uuid.v4()}${path.extname(name)}`, image, 'base64', (err, res) => {
            //     if (err) { 
            //         console.error(err) 
            //     }
            // })
        }
        else if (url) {
            input.url = url
        }
        else {
            let error = `Neither url nor image was provided`
            console.error(error)
            return res.status(500).json({ error })
        }

        clarifai.inputs.search({ input })
            .then((resp) => {
                console.log(`Fetched ${resp.hits.length} results`)

                let ids = resp.hits.map((hit) => {
                    return hit.input.id
                })

                if (ids.length > maxResults) {
                    ids.length = maxResults
                }

                Product.getProductsByCid(ids, (err, docs) => {
                    let results = { 
                        products: docs
                    }

                    for (let i in docs) {
                        let price = docs[i].price
                        docs[i].price = usdToNaira(price)
                    }
                    
                    res.status(200).json(results)
                })
            }, (err) => {
                console.error(err)

                res.status(500).json({})
            })
    },
    
    textSearch: (req, res, next) => {
        let query = req.body.query || req.query.query

        console.log(query)

        let options = {
            fts: query,
            limit: maxResults,
            cat: categories.toString(),
            sort: 'Popular' // 'PriceLoHi', 'PriceHiLo', 'Recency', 'Popular' 
        }

        shopstyle.products(options)
            .then((sres) => {
                for (let i in sres.products) {
                    sres.products[i] = new Product(sres.products[i]).toLeanJSON()
                    sres.products[i].price = usdToNaira(sres.products[i].price)
                }
                res.status(200).json(sres)
            })
            .catch((err) => {
                console.error(err)
                res.status(500).json({})
            })
    },

    featured: (req, res, next) => {
        let options = {
            limit: maxResults,
            cat: categories.toString(),
            sort: 'Popular' // 'PriceLoHi', 'PriceHiLo', 'Recency', 'Popular' 
        }

        shopstyle.products(options)
            .then((sres) => {
                for (let i in sres.products) {
                    sres.products[i] = new Product(sres.products[i]).toLeanJSON()
                    sres.products[i].price = usdToNaira(sres.products[i].price)
                }
                res.status(200).json(sres)
            })
            .catch((err) => {
                console.error(err)
                res.status(500).json({})
            })
    }
}
