'use strict'

// Shopstyle API Params
const SS_API_KEY = 'uid944-40585788-19'
const SS_LOCALE = 'US' // UK, JP, CA, AU, FR, DE

const Shopstyle = require('shopstyle-sdk')
const shopstyle = new Shopstyle(SS_API_KEY, SS_LOCALE)

module.exports = shopstyle