'use strict'

// Clarifai API Params
const CL_API_KEY = 'c3d71f957aa248689ced39e7e5bcaa61'

const Clarifai = require('clarifai')
const clarifai = new Clarifai.App({
    apiKey: CL_API_KEY
})

module.exports = clarifai

