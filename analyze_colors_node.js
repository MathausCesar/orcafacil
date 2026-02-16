const { extractColors } = require('extract-colors');
const path = require('path');

const logoPath = path.join(__dirname, 'public', 'logo', 'logo1.png');

console.log(`Analyzing: ${logoPath}`);

extractColors(logoPath)
    .then(colors => {
        console.log('Dominant Colors:');
        colors.forEach(c => {
            console.log(`Hex: ${c.hex} - Area: ${c.area}`);
        });
    })
    .catch(err => {
        console.error('Error extracting colors:', err);
    });
