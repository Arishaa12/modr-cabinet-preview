const vk = document.querySelector(".vk");
const tg = document.querySelector(".tg");

if (location.search.includes("bc=1")) {
    document.querySelector("#r").innerHTML = "Кажется, ваша сессия устарела. Пожалуйста, авторизуйтесь снова.";
}

vk.onclick = () => {
    vk.setAttribute("disabled", true);

    setTimeout(() => {
        vk.removeAttribute("disabled");
    }, 3000);

    location.href = "https://2d.modr.club/auth/redirect";
};

tg.onclick = () => {
    tg.setAttribute("disabled", true);

    setTimeout(() => {
        tg.removeAttribute("disabled");
    }, 3000);

    location.href = "https://t.me/modrAuthBot";
};