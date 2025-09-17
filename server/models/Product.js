const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    fullDescription: { type: String, required: true },
    usage: { type: String, required: true },
    image: { type: String },
    category: { type: String, required: true },
});

module.exports = mongoose.model('Product', productSchema);
