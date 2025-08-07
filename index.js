import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import bodyParser from 'body-parser';
import 'dotenv/config'

const app = express();
const port = 3005;

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(token, { polling: true });
app.use(bodyParser.json());

app.post('/alert', (req, res) => {
  const alerts = req.body.alerts || [];
  console.log('🚀 -> alerts:', alerts)

  alerts.forEach(alert => {
    const alertName = alert.labels.alertname || 'Unknown Alert';
    const status = alert.status || 'unknown';
    const instance = alert.labels.instance || 'unknown instance';
    const severity = alert.labels.severity || 'unknown';
    const description = alert.annotations.description || 'No description';

    const msg =
    `🚨 <b>ALERT:</b> ${alertName}\n\n` +
    `🟡 <b>Status:</b> ${status}\n` +
    `🖥️ <b>Instance:</b> ${instance}\n` +
    `📛 <b>Severity:</b> ${severity}\n\n` +
    `<b>📝 Description:</b> ${description}`;

    bot.sendMessage(chatId, msg, { parse_mode: 'HTML' });
  });

  res.sendStatus(200);
});

const greetings = [
  "🐸 Who just pinged me?!",
  "🔮 Are you bored or just curious?",
  "https://www.youtube.com/watch?v=-StrhbE2hzg&list=RD-StrhbE2hzg&start_radio=1",
  "https://www.youtube.com/watch?v=iVaxIWyou3w&list=RDiVaxIWyou3w&start_radio=1",
  "https://www.youtube.com/watch?v=v0vvCPZNCNQ&list=RDv0vvCPZNCNQ&start_radio=1",
  "https://www.youtube.com/watch?v=qGlt812G_Io&list=RDqGlt812G_Io&start_radio=1"
];
const userIndexes = new Map();

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (!userIndexes.has(chatId)) {
    userIndexes.set(chatId, 0);
  }

  const currentIndex = userIndexes.get(chatId);
  const messageToSend = greetings[currentIndex];

  bot.sendMessage(chatId, messageToSend);

  const nextIndex = (currentIndex + 1) % greetings.length;
  userIndexes.set(chatId, nextIndex);
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message);
});

app.listen(port, () => {
  console.log(`Telegram webhook server listening on port ${port}`);
});
