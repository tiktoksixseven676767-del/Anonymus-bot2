const Pusher = require("pusher");
const express = require("express");
const cors = require("cors"); // <--- Fondamentale

const app = express();
app.use(cors()); // <--- Questo dice al server: "Accetta messaggi dal mio sito"
app.use(express.json());

const pusher = new Pusher({
  appId: "2152950",
  key: "234ebd25716db090234b" 
secret = "8382a126a2cdd593029a",
cluster = "eu",
useTLS = true
});

app.post("/messaggio", (req, res) => {
  pusher.trigger("mazzuchat-channel", "messaggio-nuovo", req.body);
  res.json({ status: "Inviato!" });
});

app.listen(process.env.PORT || 3000);
