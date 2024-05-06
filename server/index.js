const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(MONGODB_URI);
    console.log("mongodb Connected");
}

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})