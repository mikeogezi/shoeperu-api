const Product = require('../objects/Product')

Product.getAll((err, docs) => {
    if (err) {
        console.error(err)
    }
    else {
        let ids = docs.map((doc) => {
            return doc.id
        })

        let idSet = new Set(ids)
        let uniqueIds = [... idSet]

        let makeUniqueById = (uniqueIds, index) => {
            if (index >= uniqueIds.length) {
                console.log(`Finished iterations`)
                return
            }

            let doCount = (uniqueIds, index) => {
                Product.count({ id: uniqueIds[index] }, (err, count) => {
                    if (err) {
                        console.error(err)
                    }
                    else {
                        console.log(`Documents with id ${uniqueIds[index]} occur ${count} times`)
                        doRemove(uniqueIds, index, count)
                    }
                })
            }

            let doRemove = (uniqueIds, index, count) => {
                for (let i = 1; i < count; ++i) {
                    Product.removeOne({ id: uniqueIds[index] }, (err, num) => {
                        if (err) {
                            console.error(err)
                        }
                        else {
                            console.log(`Removed a document with id ${uniqueIds[index]}`)
                        }
                    })
                }

                makeUniqueById(uniqueIds, ++index)
            }

            console.log(`Making unique id ${uniqueIds[index]}`)
            doCount(uniqueIds, index)
        }

        makeUniqueById(uniqueIds, 0)
    }
})