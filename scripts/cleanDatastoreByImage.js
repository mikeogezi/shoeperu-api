const Product = require('../objects/Product')

Product.getAll((err, docs) => {
    if (err) {
        console.error(err)
    }
    else {
        let images = docs.map((doc) => {
            return doc.imageUrl
        })

        let imgSet = new Set(images)
        let uniqueImages = [... imgSet]

        let makeUniqueByImage = (uniqueImages, index) => {
            if (index >= uniqueImages.length) {
                console.log(`Finished iterations`)
                return
            }

            let doCount = (uniqueImages, index) => {
                Product.count({ imageUrl: uniqueImages[index] }, (err, count) => {
                    if (err) {
                        console.error(err)
                    }
                    else {
                        console.log(`Documents with image ${uniqueImages[index]} occur ${count} times`)
                        doRemove(uniqueImages, index, count)
                    }
                })
            }

            let doRemove = (uniqueImages, index, count) => {
                for (let i = 1; i < count; ++i) {
                    Product.removeOne({ imageUrl: uniqueImages[index] }, (err, num) => {
                        if (err) {
                            console.error(err)
                        }
                        else {
                            console.log(`Removed a document with image ${uniqueImages[index]}`)
                        }
                    })
                }

                makeUniqueByImage(uniqueImages, ++index)
            }

            console.log(`Making unique image ${uniqueImages[index]}`)
            doCount(uniqueImages, index)
        }

        makeUniqueByImage(uniqueImages, 0)
    }
})

// 3283
// 3277