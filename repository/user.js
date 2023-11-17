const User = require('../models/user')
module.exports.getOne = async (_id) => {
    return await User.findById(_id)
}

module.exports.get = async (_filter) => {
    return await User.find(_filter)
}