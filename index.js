const { Client } = require('whatsapp-web.js');
const config = require('./config.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');

const SESSION_FILE_PATH = './session.json';
let client;
let sessionData;

const withSession = () => {
    const spinner = ora(`Cargando ${chalk.yellow('Validando sesión con Whatsapp... ')}`);
    sessionData = require(SESSION_FILE_PATH);
    spinner.start();

    client = new Client({
        session:sessionData
    })

    client.on('ready', () => {
        console.log('¡Conectado!');
        spinner.stop();
        //listenMessage();
        sendMessageToCustomNumber();
    });

    client.on('auth_failure', () => {
        spinner.stop();
        console.log('Error de autenticación, borra el archivo session.json y vuelve a generar el código QR.')
    })

    client.initialize();
}

const withOutSession = () => {
    console.log('No se ha iniciado una sesión.');
    client = new Client();

    client.on('qr', (qr) => {
        qrcode.generate(qr, {small: true})
    });

    client.on('authenticated', (session) => {
        sessionData = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
            if (err) {
                console.log(err);
            }
        });
    });

    client.initialize();
}

const listenMessage = () => {
    client.on('message', (msg) => {
        const {from, to, body} = msg;

        console.log(from, to, body);
        sendMessage(from, 'Testing with whatsapp-web.js');
    })
}

const sendMessage = (to, message) => {
    client.sendMessage(to, message);
}

const sendMessageToCustomNumber = () => {
    const num = `${config.PERSONAL_NUMBER}`;
    const msg = "Tacos de JavaScript 👁👄👁";

    client.isRegisteredUser(num).then((isRegistered) => {
        if (isRegistered) client.sendMessage(num, msg);
        else console.log("El mensaje no pudo ser enviado.");
    })
}

(fs.existsSync(SESSION_FILE_PATH)) ? withSession() : withOutSession();