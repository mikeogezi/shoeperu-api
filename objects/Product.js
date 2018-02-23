'use strict'

let assert = require('assert')
let util = require('util')

let filename = './db/product'
let autoload = true

let Datastore = require('nedb')
let productDatastore = new Datastore({ filename, autoload })

const defaultDBCb = (err, doc) => {
    console.log(err, doc)
}

class Product {
    constructor (jsonObj) {
        delete jsonObj.retailer
        delete jsonObj.brand
        // delete jsonObj.image
        delete jsonObj.alternateImages
        delete jsonObj.promotionalDeal

        this.jsonObj = jsonObj
        this.cId = ''
    }

    toJSON () {
        return this.jsonObj
    }

    toLeanJSON () {
        return {
            cId: this.cId,
            id: this.id, name: this.name, price: this.price, 
            description: this.description, url: this.url, 
            imageUrl: this.imageUrl, sizes: this.sizes, 
            colors: this.colors, categories: this.categories
        }
    }

    valueOf () {
        return this.toLeanJSON()
    }

    get id () { 
        return this.jsonObj.id 
    }

    get name () { 
        return this.jsonObj.name 
    }

    get price () { 
        return `${this.jsonObj.currency} ${this.jsonObj.price}`
    }

    get description () { 
        return this.jsonObj.description 
    }

    get url () { 
        return this.jsonObj.clickUrl 
    }

    get imageUrl () { 
        return this.jsonObj.image['sizes']['Original']['url'] 
    }

    get sizes () {
        let sizes = []
        
        for (let size of this.jsonObj.sizes) {
            sizes.push(size.name)
        }

        return sizes
    }

    get colors () {
        let colors = []

        for (let color of this.jsonObj.colors) {
            colors.push(color.name)
        }

        return colors
    }

    get categories () {
        let categories = []

        for (let category of this.jsonObj.categories) {
            categories.push(category.name)
        }

        return categories
    }

    save (cb) {
        cb = cb || defaultDBCb

        productDatastore.insert(this.toLeanJSON(), cb)
    }

    generateQuery () {
        return {
            _id: this._id
        }
    }

    update (query, cb) {
        cb = cb || defaultDBCb

        productDatastore.update(query, this.toLeanJSON(), {}, cb)
    }

    static update (query, change, cb) {
        cb = cb || defaultDBCb

        productDatastore.update(query, change, {}, cb)
    }

    remove (cb) {
        cb = cb || defaultDBCb

        productDatastore.remove({ id: this.id }, cb)
    }

    // Query using ids returned by Clarifai
    static getProductsByCid (ids, cb) {
        cb = cb || defaultDBCb

        productDatastore.find({
            cId: {
                $in: ids
            }
        }, cb)
    }

    static getAll (cb) {
        cb = cb || defaultDBCb

        productDatastore.find({}, cb)
    }

    static get (query, cb) {
        cb = cb || defaultDBCb

        productDatastore.find(query, cb)
    }

    static count (query, cb) {
        cb = cb || defaultDBCb
        
        productDatastore.count(query, cb)
    }

    static removeOne (query, cb) {
        cb = cb || defaultDBCb
        
        productDatastore.remove(query, {
            multi: false
        }, cb)
    }

    static remove (query, cb) {
        cb = cb || defaultDBCb

        productDatastore.remove(query, cb)
    }

    static removeAll (cb) {
        cb = cb || defaultDBCb

        productDatastore.remove({}, 
            { multi: true }, 
            (err, numRemoved) => {
                productDatastore.loadDatabase(function (err) {
                    cb(err)
                });
        });
    }
}

module.exports = Product

/*
var obj = require('./debug/json/demoResult')
var prod = obj.products[0]
var Product = require('./objects/product')
var P = new Product(prod)
P.toLeanJSON()
*/