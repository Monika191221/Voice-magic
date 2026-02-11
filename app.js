const textInput = document.getElementById("text");
const languageSelect = document.getElementById("language");
const voiceSelect = document.getElementById("voice");
const speakBtn = document.getElementById("speak");
const status = document.getElementById("status");

let allVoices = [];

// Load ALL voices (do NOT filter by language)
function loadVoices() {
    allVoices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = "";

    allVoices.forEach((voice, i) => {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}

// Chrome async voice load
speechSynthesis.onvoiceschanged = loadVoices;

// 🔄 TRANSLATE TEXT
async function translateText(text, targetLang) {
    const url =
        "https://translate.googleapis.com/translate_a/single" +
        "?client=gtx" +
        "&sl=auto" +
        `&tl=${targetLang}` +
        "&dt=t" +
        `&q=${encodeURIComponent(text)}`;

    const res = await fetch(url);
    const data = await res.json();
    return data[0].map(part => part[0]).join("");
}

// 🔊 SPEAK
speakBtn.addEventListener("click", async () => {
    const inputText = textInput.value.trim();
    if (!inputText) {
        status.textContent = "❌ Enter text";
        return;
    }

    const lang = languageSelect.value;
    status.textContent = "🌍 Translating...";

    let finalText = inputText;

    if (lang !== "en") {
        try {
            finalText = await translateText(inputText, lang);
        } catch {
            status.textContent = "❌ Translation failed";
            return;
        }
    }

    if (!allVoices.length) {
        status.textContent = "❌ No voices available on system";
        return;
    }

    // ✅ Pick best available voice (Google preferred)
    let voice =
        allVoices.find(v => v.name.toLowerCase().includes("google")) ||
        allVoices[0];

    const utterance = new SpeechSynthesisUtterance(finalText);
    utterance.voice = voice;
    utterance.lang = lang;

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);

    status.textContent = "🔊 Speaking translated text";
});
