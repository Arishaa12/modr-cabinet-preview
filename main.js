let alertTimeout;
let alert = document.querySelector("#b");
let beforeNameLabel = document.querySelector("#pn");
let nameLabel = document.querySelector("#n");
let subscriptionEndsLabel = document.querySelector("#se");
let balanceLabel = document.querySelector("#bl");

const AUTH_PAGE_URL = "https://test.modr.club/auth.html?bc=1";

const STR = {
    RL_USER_INF: "Обновляем отображаемую на странице информацию...",
    RL_USER_INF_ERR: "На странице может отображаться <b>неверная</b> информация: ",
    RL_USER_INF_CON_ERR: "произошла ошибка при подключении к серверу. Проверьте своё соединение с интернетом.",
    RL_USER_INF_SRV_ERR: "сервер вернул ошибку при обновлении данных. Пожалуйста, подождите несколько минут и обновите страницу.",

    SE_NVR: "Вы ещё ни разу не активировали подписку.",
    SE_INF: "Бог бесконечных подписок пролетал над вашим аккаунтом и выронил одну. Кажется, она уцелела, и теперь полностью ваша :)",
    SE_EXP: "Кажется, ваша подписка уже закончилась. Это произошло <strong>{0}</strong>.",
    SE_ACT: "Ура, ваша подписка ещё активна. Закончится она <strong>{0}</strong>.",

    RUB_0: "рубль",
    RUB_1: "рубля",
    RUB_2: "рублей",

    BAL: "На вашем балансе сейчас <strong>{0}</strong>."
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

function hideAlert() {
    alert.setAttribute("class", "h");
}

function showAlert(message, duration, error = false) {
    if (alertTimeout) {
        clearTimeout(alertTimeout);
    }

    if (duration > 0) {
        alertTimeout = setTimeout(
            hideAlert, 
            duration * 1000
        );
    }

    alert.innerHTML = message;
    alert.setAttribute("class", error ? "i e" : "i");
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

async function updateDisplayInfo() {
    showAlert(STR.RL_USER_INF, 0);

    try {
        const userData = await executeMethod("user");
        const { balance, subscriptionends, muid } = userData;

        hideAlert();
        setBalance(balance);
        setSubscriptionEnds(subscriptionends);
    } catch (e) {
        if (e === "NOT_OK") {
            return showAlert(STR.RL_USER_INF_ERR + STR.RL_USER_INF_SRV_ERR, 0, true);
        }

        showAlert(STR.RL_USER_INF_ERR + STR.RL_USER_INF_CON_ERR, 0, true);
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