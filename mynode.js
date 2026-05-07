const fs = require('fs');
const path = require('path');
const successColor = '\x1b[32m%s\x1b[0m';
const checkSign = '\u{2705}';
const dotenv = require('dotenv').config({path: 'src/.env'}); ;

const envFile = `export const environment = {
    geminiApiKey: '${process.env.geminiApiKey}',
};
`;
const targets = [
    path.join(__dirname, './src/environments/environment.ts'),
    path.join(__dirname, './src/environments/environment.development.ts'),
];

targets.forEach((targetPath) => {
    fs.writeFile(targetPath, envFile, (err) => {
        if (err) {
            console.error(err);
            throw err;
        } else {
            const fileName = path.basename(targetPath);
            console.log(successColor, `${checkSign} Successfully generated ${fileName}`);
        }
    });
});
