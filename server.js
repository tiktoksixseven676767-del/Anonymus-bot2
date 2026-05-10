const Pusher = require("pusher");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const pusher = new Pusher({
  appId: "2152950",
  key: "234ebd25716db090234b",
  secret: "IL_TUO_SECRET_DI_PUSHER", 
  cluster: "eu",
  useTLS: true
});

app.post("/messaggio", (req, res) => {
  pusher.trigger("mazzuchat-public", "messaggio-nuovo", req.body);
  res.status(200).send({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server online sulla porta ${PORT}`));
