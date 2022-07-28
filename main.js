let refreshAlert = document.querySelector("#b");
let beforeNameLabel = document.querySelector("#pn");
let nameLabel = document.querySelector("#n");
let subscriptionEndsLabel = document.querySelector("#se");
let balanceLabel = document.querySelector("#bl");
let mUIDInput = document.querySelector("#mui");
let mUIDButton = document.querySelector("#mub");
let mUIDAlert = document.querySelector("#mua");
let transferInput = document.querySelector("#tri");
let transferButton = document.querySelector("#trb");
let transferAlert = document.querySelector("#tra");

const AUTH_PAGE_URL = "https://test.modr.club/auth.html?bc=1";

const STR = {
    ERR: "Неизвестная ошибка.",
    ERR_401: "Ошибка авторизации.",
    ERR_500: "Внутренняя ошибка сервера.",
    ERR_1000: "Произошла ошибка при подключении к серверу. Проверьте своё соединение с интернетом.",

    RL_USER_INF: "Обновляем отображаемую на странице информацию...",
    RL_USER_INF_ERR: "На странице может отображаться <b>устаревшая</b> информация: ",
    RL_USER_INF_CON_ERR: "произошла ошибка при подключении к серверу. Проверьте своё соединение с интернетом.",
    RL_USER_INF_SRV_ERR: "сервер вернул ошибку при обновлении данных. Пожалуйста, подождите несколько минут и обновите страницу.",

    SE_NVR: "Вы ещё ни разу не активировали подписку.",
    SE_INF: "Бог бесконечных подписок пролетал над вашим аккаунтом и выронил одну. Кажется, она уцелела, и теперь полностью ваша :)",
    SE_EXP: "Кажется, ваша подписка уже закончилась. Это произошло <strong>{0}</strong>.",
    SE_ACT: "Ура, ваша подписка ещё активна. Закончится она <strong>{0}</strong>.",

    BAL: "На вашем балансе сейчас <strong>{0}</strong>.",

    RUB_0: "рубль",
    RUB_1: "рубля",
    RUB_2: "рублей",

    MUID_SVG: "Сохраняем...",
    MUID_SVD: "Сохранено!",
    MUID_ERR_1: "В UID должно быть 24 символа!",
    MUID_ERR_2: "UID введён неверно. Убедитесь, что вы вводите UID из уже установленного мода, а не из оригинала игры.",

    TRF_TNG: "Переносим...",
    TRF_TVD: "Перенесли!",
    TRF_ERR_1: "В UID должно быть 24 символа!",
    TRF_ERR_2: "Вы не привязали UID в разделе \"Привязка аккаунта\".",
    TRF_ERR_3: "Убедитесь в том, что вы правильно переписали UID."
};

function extractCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) return parts.pop()
        .split(';')
        .shift();
}

function getCookie(name) {
    const value = extractCookie(name);
    return value && decodeURIComponent(value);
}

function showDisplayName(name) {
    nameLabel.innerHTML = name;
    beforeNameLabel.innerHTML = beforeNameLabel.innerHTML
        .replace("пожаловать", "пожаловать,");
}

async function executeMethod(method, params = {}) {
    const response = await fetch("https://2d.modr.club/fapi/" + method, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(params),

        headers: {
            "Content-Type": "application/json"
        }
    });

    if (response.ok) {
        return response.json();
    }

    throw("NOT_OK");
}

function hideAlert(alert) {
    if (alert.alertTimeout) {
        clearTimeout(alert.alertTimeout);
    }

    alert.setAttribute("class", "h");
}

function showAlert(alert, message, duration = 0, status = 0) {
    hideAlert(alert);

    if (duration > 0) {
        alert.alertTimeout = setTimeout(
            () => hideAlert(alert), 
            duration * 1000
        );
    }

    alert.innerHTML = message;
    alert.setAttribute("class", status == 0 ? "i" : (
        status == 1 ? "i g" : "i e"
    ));
}

function getErrorByCode(code, section) {
    if (STR["ERR_" + code]) return STR["ERR_" + code];
    if (STR[section + "_ERR_" + code])
        return STR[section + "_ERR_" + code];
    
    return STR.ERR;
}

String.prototype.format = function() {
    const args = arguments;
    return this.replace(/{(\d+)}/g, (match, number) => { 
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};

function formatDate(date) {
    return [date.toLocaleString("ru", {
        day: "numeric",
        month: "long"
    }), "в", date.toLocaleString("ru", {
        hour: "numeric",
        minute: "numeric"
    })].join(' ');
}

function declOfNum(number, titles) {
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? number % 10 : 5]];
}

function rubleDecl(amount) {
    return declOfNum(Number(amount), [STR.RUB_0, STR.RUB_1, STR.RUB_2]);
}

function setBalance(balance) {
    balanceLabel.innerHTML = STR.BAL.format(balance + ' ' + rubleDecl(balance));
}

function setSubscriptionEnds(subscriptionends) {
    subscriptionends = Number(subscriptionends); // :(
    const ftdDate = formatDate(new Date(subscriptionends));

    const neverSubscribed = subscriptionends === 0;
    const isInfinity = subscriptionends === 9999999999999;
    const isExpired = subscriptionends < new Date().getTime();

    subscriptionEndsLabel.innerHTML =
        neverSubscribed ? STR.SE_NVR : (isInfinity ? STR.SE_INF : (isExpired ? STR.SE_EXP : STR.SE_ACT))
        .format(ftdDate);
}

function unlockButtons() {
    document.querySelectorAll(".d").forEach(btn => {
        btn.removeAttribute("disabled");
    });
}

async function updateDisplayInfo() {
    showAlert(refreshAlert, STR.RL_USER_INF);

    try {
        const userData = await executeMethod("user");
        const { balance, subscriptionends, muid } = userData;

        setBalance(balance);
        setSubscriptionEnds(subscriptionends);
        hideAlert(refreshAlert);

        mUIDInput.value = muid;
        unlockButtons();
    } catch (e) {
        if (e === "NOT_OK") {
            return showAlert(refreshAlert, STR.RL_USER_INF_ERR + STR.RL_USER_INF_SRV_ERR, 0, 2);
        }

        showAlert(refreshAlert, STR.RL_USER_INF_ERR + STR.RL_USER_INF_CON_ERR, 0, 2);
    }
}

mUIDButton.onclick = async () => {
    showAlert(mUIDAlert, STR.MUID_SVG);

    const muid = 
        mUIDInput.value;

    if (muid.length !== 24) {
        return showAlert(mUIDAlert, STR.MUID_ERR_1, 5, 2);
    }

    const result = 
        await updateMUID(muid);

    if (result.success) {
        return showAlert(mUIDAlert, STR.MUID_SVD, 5, 1);
    }

    showAlert(mUIDAlert, getErrorByCode(result.err, "MUID"), 10, 2);
};

transferButton.onclick = async () => {
    showAlert(transferAlert, STR.TRF_TNG);

    const uid = 
        transferInput.value;

    if (uid.length !== 24) {
        return showAlert(transferAlert, STR.TRF_ERR_1, 5, 2);
    }

    const result = 
        await transferSaves(uid);

    if (result.success) {
        return showAlert(transferAlert, STR.TRF_TVD, 5, 1);
    }

    showAlert(transferAlert, getErrorByCode(result.err, "TRF"), 10, 2);
};

async function updateMUID(muid) {
    try {
        const result = await executeMethod("muid", {
            muid
        });

        return result;
    } catch (e) {
        if (e === "NOT_OK") {
            return { err: -1 };
        }

        return { err: 1000 };
    }
}

async function transferSaves(uid) {
    try {
        const result = await executeMethod("transfer", {
            uid
        });

        return result;
    } catch (e) {
        if (e === "NOT_OK") {
            return { err: -1 };
        }

        return { err: 1000 };
    }
}

(() => {
    if (!getCookie("token")) {
        return location.href = AUTH_PAGE_URL;
    }

    const displayName = getCookie("name");
    showDisplayName(displayName);

    updateDisplayInfo();
})();