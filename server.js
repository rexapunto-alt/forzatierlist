const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images'))); // serve images directory exactly as requested

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
