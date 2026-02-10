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

export async function sendVoice(chatId: string, voice: string | Buffer, caption?: string) {
    if (typeof voice === "string" && !voice.startsWith("http")) {
        // If it's a local path or placeholder, it might fail here if not handled
        // But for now we assume it's a URL or we'll pass a Buffer from the route
    }

    if (Buffer.isBuffer(voice)) {
        const formData = new FormData();
        formData.append("chat_id", chatId);
        const blob = new Blob([new Uint8Array(voice)], { type: "audio/mpeg" });
        formData.append("voice", blob, "voice.mp3");
        if (caption) formData.append("caption", caption);

        return await axios.post(`${BASE_URL}/sendVoice`, formData);
    }

    return await axios.post(`${BASE_URL}/sendVoice`, {
        chat_id: chatId,
        voice: voice,
        caption: caption,
    });
}

export async function setWebhook(url: string) {
    return await axios.post(`${BASE_URL}/setWebhook`, {
        url: url,
    });
}
