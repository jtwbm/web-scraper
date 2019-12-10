const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: String,
    description: String,
    img: String,
    category: String,
    price: Number,
    options: [
	    {
	    	title: String,
			value: String,
	    }
    ],
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;