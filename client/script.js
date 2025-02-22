import bot from './assets/bot.svg';
import user from './assets/user.svg';


const form = document.querySelector('form');
const chat = document.querySelector('#chat_container');
const textarea = document.querySelector("textarea");
const server = 'https://kyonix-ai.onrender.com';


textarea.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
});

let loadInterval = null;

function loader(elem) {
    elem.textContent = '';

    loadInterval = setInterval(() => {
        elem.textContent += '.';

        if (elem.textContent.length > 4)
            elem.textContent = '';
    }, 300);
}

function typeMessage(elem, message) {
    let index = 0;
    elem.innerHTML = ""; // Limpia antes de escribir
    let interval = setInterval(() => {
        elem.innerHTML = message.substring(0, index + 1); // Inserta el texto correctamente
        index++;

        if (index >= message.length) {
            clearInterval(interval);
        }
    }, 20);
}

function generateUniqueID() {
    const timestamp = Date.now();
    const randomNum = Math.random().toString(16);

    return `id-${timestamp}-${randomNum}`;
}


function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper" ${isAi && 'ai'}>
            <div class="chat ${isAi ? 'bot' : 'user'}">
                <div class="profile">
                    <img src="${isAi ? bot : user}" alt="${isAi ? 'bot' : 'user'}" />
                </div>
                <p class="message" id=${uniqueId}>${value}</p>
            </div>
        </div>
        `
    )
}

const handleSubmit = async e => {
    e.preventDefault();

    const data = new FormData(form);

    // user's chatstripe
    chat.innerHTML += chatStripe(false, data.get('prompt'));

    form.reset();
    textarea.style.height = "";

    // bot's chatstripe
    const uniqueId = generateUniqueID();
    chat.innerHTML += chatStripe(true, " ", uniqueId);

    chat.scrollTop = chat.scrollHeight;

    const messageBox = document.getElementById(uniqueId);

    loader(messageBox);

    // fetch data from server -> bot response
    const response = await fetch(server, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    });

    clearInterval(loadInterval);
    messageBox.innerHTML = '';

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();

        typeMessage(messageBox, parsedData);
    } else {
        const err = await response.text();
        messageBox.innerHTML = "❌ Error while fetching data from server";
        console.error(err); 
    }
}

// Agregar el primer mensaje del bot al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    const firstMessage = "¡Hi! Soy <span style='color: orange;'>Kyonix AI</span>, tu asistente para hacer que tu productividad suba más rápido que el Wi-Fi. 💪⚡ ¡Listo para convertir tu tiempo en superpoderes y hacer tu día épico? 🚀📅 ¡Vamos a hacerlo! 😎💼";
    const uniqueId = generateUniqueID();

    chat.innerHTML += chatStripe(true, " ", uniqueId);
    const messageBox = document.getElementById(uniqueId);
    chat.scrollTop = chat.scrollHeight; 
    typeMessage(messageBox, firstMessage);
});

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', e => {
    if (e.key === 13)
        handleSubmit(e);
});
