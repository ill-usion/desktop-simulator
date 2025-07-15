const desktop = document.querySelector("#desktop-area");
const taskbar = document.querySelector("#taskbar-area");
const contextMenu = document.querySelector("#context-menu");

const tbTime = document.querySelector("#taskbar--datetime-time");
const tbDate = document.querySelector("#taskbar--datetime-date");

const WALLPAPER_IMAGE = "/assets/wallpaper.jpg";

document.addEventListener("DOMContentLoaded", async () => {
    document.body.style.backgroundImage = `url(${WALLPAPER_IMAGE})`;

    const dateToday = new Date();
    tbDate.innerText = `${dateToday.getDate()}/${
        dateToday.getMonth() + 1
    }/${dateToday.getFullYear()}`;

    await updateTime();
    setInterval(updateTime, 1000);
});

async function updateTime() {
    const timeNow = new Date();

    var hours = timeNow.getHours();
    var dayPeriod = "AM";
    if (hours >= 13) {
        hours -= 12;
        dayPeriod = "PM";
    }

    var minutes = timeNow.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes.toString();
    }

    tbTime.innerText = `${hours}:${minutes} ${dayPeriod}`;
}

document.addEventListener("contextmenu", async (e) => {
    e.preventDefault();
    await showContextMenu(e.clientX, e.clientY);
});

document.addEventListener("click", async (e) => {
    if (
        e.target === desktop &&
        contextMenu.getAttribute("data-hidden") === "false"
    ) {
        await hideContextMenu();
    }
});

async function showContextMenu(x, y) {
    contextMenu.style.setProperty("--ctx-x", x);
    contextMenu.style.setProperty("--ctx-y", y);
    contextMenu.setAttribute("data-hidden", false);
}

async function hideContextMenu() {
    contextMenu.setAttribute("data-hidden", true);
}
