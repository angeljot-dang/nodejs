const multer = require('multer')
const uuid = require('uuid')
const fs = require('fs')

const destination = (req, file, cb) => {
    let filepath = 'uploads/'
    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath, { recursive: true })
    }
    cb(null, filepath)
}

const filename = (req, file, cb) => {
    const uuidv4 = uuid.v4()
    cb(null, `${uuidv4}-${file.originalname}`)

}

module.exports.upload = multer({
    storage: multer.diskStorage({
        filename: filename,
        destination: destination
    }),
    limits: { fileSize: 1024 * 1024 * 5 }
}).single('media')