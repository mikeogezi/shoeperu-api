'use strict'

let util = require('util')

const Product = require('../objects/Product')

const shopstyle = require('../app/Shopstyle')

const keywords = [
    'shoes', 
    'sneakers', 
    'sandals', 
    'boots'
]
const maxLimit = 50, defaultLimit = 20
const maxOffset = 5000, defaultOffset = 0

let maxProducts = 4000
let productCount = 0
let catKey = 'id'

// Footwear Categories
// bridal-shoes
// womens-shoes
// shoes-athletic
// boots
// evening-shoes
// sandals
// womens-sneakers
// mens-shoes
// mens-shoes-athletic
// mens-boots
// mens-sandals
// mens-lace-up-shoes
// mens-slip-ons-shoes
// mens-sneakers
// boys-shoes
// girls-shoes

let getRelevantCategories = (res) => {
    console.log(`${res.categories.length} categories found`)

    let cats = []
    res.categories.forEach((cat) => {
        for (let k of keywords) {
            if (cat[catKey].indexOf(k) != -1){
                cats.push(cat[catKey])
            }
        }
    })
    
    console.log(`Relevant categories are "${cats}"`)
    
    return cats
}

let getOffsets = (cats) => {
    let offsets = new Array(cats.length)
    
    offsets.fill(0)

    return offsets
}

let saveToDatastore = (res) => {
    for (let i in res.products) {
        let product = new Product(res.products[i])

        product.save((err, doc) => {
            if (err) {
                console.error(`Error saving product`, err)
            }
        })
    }
}

let fetchProducts = (categories, catIndex, maxProducts, offsets, first) => {
    console.log(`Product count: ${productCount}/${maxProducts}`)
    for (let i in categories) {
        console.log(`Product count from "${categories[i]}" category: ` +
                    `${offsets[i] == -1 ? 'Max' : offsets[i]}`)
    }

    // If we've exhausted a category, return and fetch from next category
    if (offsets[catIndex] == -1) {
        fetchProducts(categories, catIndex + 1, maxProducts, offsets)
        return
    }

    // Max products reached
    if (productCount >= maxProducts) {
        console.log(`Maximum number (${maxProducts}) of products added`)
        return
    }

    // Looped throught categories, starting again
    if (catIndex >= categories.length) {
        console.log(`Looped through categories, starting again from ${categories[0]}`)
        // TODO: Find a solution to this
        catIndex = -1
        fetchProducts(categories, catIndex, maxProducts, offsets);
        return
    }
    // Change category since we're getting from each equally
    else {
        if (!first) {
            console.log(`Moving from "${categories[catIndex]}" category ` +
                        `to "${categories[catIndex + 1]}" category`)

            ++catIndex
        }
    }

    console.log(`Fetching products from "${categories[catIndex]}" category`)

    let limit = maxLimit // defaultLimit

    let options = {
        limit: limit,
        offset: offsets[catIndex],
        cat: categories[catIndex],
        sort: 'Popular' // 'PriceLoHi', 'PriceHiLo', 'Recency', 'Popular' 
    }

    shopstyle.products(options)
        .then((res) => {
            saveToDatastore(res)

            productCount += res.products.length

            // No products remaining in API from this category
            if (res.products.length < limit) {
                console.log(`Moving from "${categories[catIndex]}" category ` +
                            `to "${categories[catIndex + 1]}" category`)

                offsets[catIndex] = -1
            }
            else {
                console.log(`Still in "${categories[catIndex]}" category`)

                offsets[catIndex] += res.products.length
                
                // Gotten maximum products from the category
                if (offsets[catIndex] >= maxOffset) {
                    offsets[catIndex] = -1
                }
            }

            fetchProducts(categories, catIndex, maxProducts, offsets)
        })
        .catch((err) => {
            console.error(err)
        })
}

let getProducts = () => {
    // Get categories
    console.log(`Getting products`)
    
    shopstyle.categories()
        .then((res) => {
            let categories = getRelevantCategories(res)
            let offsets = getOffsets(categories)

            // Start fetching
            fetchProducts(categories, 0, maxProducts, offsets, true)
        })
        .catch((err) => {
            console.error(err)
        })
}

let clearDB = true
if (clearDB) {
    Product.removeAll((err) => {
        if (err) {
            console.error(`Error dropping database`, err)
            return
        }
        console.log(`Dropping database`)
        getProducts()
    })
}
else {
    getProducts()
}