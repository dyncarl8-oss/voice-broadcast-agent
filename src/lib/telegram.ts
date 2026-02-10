import axios from "axios";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function sendMessage(chatId: string, text: string) {
    return await axios.post(`${BASE_URL}/sendMessage`, {
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
    });
}

export async function sendVoice(chatId: string, voiceUrl: string, caption?: string) {
    return await axios.post(`${BASE_URL}/sendVoice`, {
        chat_id: chatId,
        voice: voiceUrl,
        caption: caption,
    });
}

export async function setWebhook(url: string) {
    return await axios.post(`${BASE_URL}/setWebhook`, {
        url: url,
    });
}
