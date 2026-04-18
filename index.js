const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    disconnectReason, 
    fetchLatestBaileysVersion, 
    generateForwardMessageContent, 
    prepareWAMessageMedia 
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

async function startAnonymusBot() {
    // Gestione della sessione (salva i dati in una cartella per non rifare il QR ogni volta)
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }), // Nasconde i log tecnici fastidiosi
        printQRInTerminal: true,           // Mostra il QR code in Termux
        auth: state,
        browser: ["Anonymus Bot", "Chrome", "1.0"]
    });

    // Salva le credenziali quando aggiornate
    sock.ev.on('creds.update', saveCreds);

    // Gestione connessione
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== disconnectReason.loggedOut;
            console.log('Connessione chiusa. Riconnessione...', shouldReconnect);
            if (shouldReconnect) startAnonymusBot();
        } else if (connection === 'open') {
            console.log('✅ ANONYMUS BOT CONNESSO!');
            console.log('In attesa di messaggi da inoltrare...');
        }
    });

    // Logica di Inoltro
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        // ID del tuo gruppo (Sostituisci questo con l'ID reale @g.us che troverai)
        const targetGroup = "120363384950627184@g.us"; 

        const from = msg.key.remoteJid;

        // Se ricevi un messaggio in PRIVATO, inoltralo al GRUPPO
        if (!from.includes('@g.us')) {
            console.log(`Ricevuto messaggio da ${from}. Inoltro in corso...`);
            
            try {
                await sock.sendMessage(targetGroup, { forward: msg });
                console.log("✅ Inoltrato con successo.");
            } catch (err) {
                console.error("❌ Errore inoltro:", err);
            }
        }
    });
}

// Avvia il bot
startAnonymusBot();
