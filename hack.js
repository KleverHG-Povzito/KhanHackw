// Versión simplificada y traducida de Khanware
const ver = "V3.0.2";

let device = {
    mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Mobile|Tablet|Kindle|Silk|PlayBook|BB10/i.test(navigator.userAgent),
    apple: /iPhone|iPad|iPod|Macintosh|Mac OS X/i.test(navigator.userAgent)
};

let user = {
    username: "Username",
    nickname: "Nickname",
    UID: 0
};

let loadedPlugins = [];

const watermark = document.createElement('watermark');
const dropdownMenu = document.createElement('dropDownMenu');

window.features = {
    videoSpoof: true,
    customBanner: false,
    minuteFarmer: false,
    rgbLogo: false
};

window.featureConfigs = {
    customUsername: "",
    customPfp: ""
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const playAudio = url => { const audio = new Audio(url); audio.play(); };

function sendToast(text, duration=5000, gravity='bottom') {
    Toastify({
        text,
        duration,
        gravity,
        position: "center",
        stopOnFocus: true,
        style: { background: "#000000" }
    }).showToast();
}

function setupMenu() {
    function addFeature(features) {
        features.forEach(elements => {
            const feature = document.createElement('feature');
            elements.forEach(attribute => {
                let element = attribute.type === 'nonInput' ? document.createElement('label') : document.createElement('input');
                if (attribute.type === 'nonInput') element.innerHTML = attribute.name;
                else {
                    element.type = attribute.type;
                    element.id = attribute.name;
                }
                if (attribute.labeled) {
                    const label = document.createElement('label');
                    label.innerHTML = `${element.outerHTML} ${attribute.label}`;
                    feature.appendChild(label);
                } else {
                    feature.appendChild(element);
                }
            });
            dropdownMenu.innerHTML += feature.outerHTML;
        });
    }

    Object.assign(dropdownMenu.style, {
        position: 'absolute', top: '100%', left: '0', width: '160px', backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: '10px', color: 'white', fontSize: '13px', fontFamily: 'Monospace, sans-serif',
        display: 'none', flexDirection: 'column', zIndex: '1000', padding: '5px', userSelect: 'none'
    });

    watermark.appendChild(dropdownMenu);

    let featuresList = [
        [
            { name: 'videoSpoof', type: 'checkbox', variable: 'features.videoSpoof', labeled: true, label: 'Video Spoof' },
            { name: 'minuteFarm', type: 'checkbox', variable: 'features.minuteFarmer', labeled: true, label: 'Minute Farmer' },
            { name: 'customBanner', type: 'checkbox', variable: 'features.customBanner', labeled: true, label: 'Custom Banner' },
            { name: 'rgbLogo', type: 'checkbox', variable: 'features.rgbLogo', labeled: true, label: 'RGB Logo' }
        ]
    ];

    if (!device.apple) {
        featuresList.push(
            [{ name: 'Custom Username', type: 'nonInput' }, { name: 'customName', type: 'text', variable: 'featureConfigs.customUsername' }],
            [{ name: 'Custom pfp', type: 'nonInput' }, { name: 'customPfp', type: 'text', variable: 'featureConfigs.customPfp' }]
        );
    }

    addFeature(featuresList);
}

function spoofVideo() {
    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
        let body;
        if (input instanceof Request) body = await input.clone().text();
        else if (init && init.body) body = init.body;
        if (features.videoSpoof && body && body.includes('updateUserVideoProgress')) {
            try {
                let bodyObj = JSON.parse(body);
                if (bodyObj.variables && bodyObj.variables.input) {
                    const durationSeconds = bodyObj.variables.input.durationSeconds;
                    bodyObj.variables.input.secondsWatched = durationSeconds;
                    bodyObj.variables.input.lastSecondWatched = durationSeconds;
                    body = JSON.stringify(bodyObj);
                    if (input instanceof Request) {
                        input = new Request(input, { body });
                    } else {
                        init.body = body;
                    }
                    sendToast("🔓 Video completado automáticamente.", 1000);
                }
            } catch (e) {}
        }
        return originalFetch.apply(this, arguments);
    }
}

function rgbLogo() {
    const observer = new MutationObserver(() => {
        const logo = document.querySelector('svg._1rt6g9t path:nth-last-of-type(2)');
        if (features.rgbLogo && logo) {
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                @keyframes colorShift {
                    0% { fill: red; }
                    33% { fill: lime; }
                    66% { fill: blue; }
                    100% { fill: red; }
                }
            `;
            if (!document.querySelector('style[data-rgb]')) {
                styleElement.setAttribute('data-rgb', 'true');
                document.head.appendChild(styleElement);
            }
            logo.style.animation = 'colorShift 5s infinite';
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function changeBannerText() {
    const frases = ["[🌿] Khanware activo.", "[🌿] Hecho en Perú.", "[🌿] Proyecto modificado."];
    setInterval(() => {
        const saludo = document.querySelector('.stp-animated-banner h2');
        if (saludo && features.customBanner) {
            saludo.textContent = frases[Math.floor(Math.random() * frases.length)];
        }
    }, 3000);
}

function spoofUser() {
    const observer = new MutationObserver(() => {
        if (!device.apple) {
            const pfp = document.querySelector('.avatar-pic');
            const nombre = document.querySelector('.user-deets.editable h2');
            if (nombre) nombre.textContent = featureConfigs.customUsername || user.nickname;
            if (pfp && featureConfigs.customPfp) {
                pfp.src = featureConfigs.customPfp;
                pfp.alt = "imagen";
                pfp.style.borderRadius = "50%";
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

if (!/^https?:\/\/es\.khanacademy\.org/.test(window.location.href)) {
    alert("❌ Khanware no se pudo inyectar. Visita https://es.khanacademy.org/");
    window.location.href = "https://es.khanacademy.org/";
}

loadScript('https://cdn.jsdelivr.net/npm/toastify-js', 'toastifyPlugin').then(() => {
    sendToast("🌿 Khanware simplificado cargado");
    setupMenu();
    spoofVideo();
    rgbLogo();
    spoofUser();
    changeBannerText();
});
