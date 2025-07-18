class DesktopWindow {
    constructor(
        title,
        icon = undefined,
        x,
        y,
        width,
        height,
        id,
        z = "normal",
        state = "desktop"
    ) {
        this.title = title;
        this.icon = icon;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.id = id;
        this.taskbarId = `app-${this.id}`;
        this.windowHandle = null;

        this.createWindow();
        this.unfocus();
        this.fetchWindowImplementation();

        this.initResizeHandles();
        this.registerTaskbar();
    }

    registerTaskbar() {
        const appsList = document.getElementById("taskbar--appslist");
        const app = document.createElement("li");
        app.id = this.taskbarId;
        app.classList.add("taskbar--app");
        app.setAttribute("data-active", "true");
        app.addEventListener("click", () => {
            if (this.windowHandle.getAttribute("data-state") === "minimized")
                this.show();
        });

        const icon = document.createElement("img");
        icon.src = this.icon;
        app.appendChild(icon);

        appsList.appendChild(app);
    }

    createWindow() {
        const windowHandle = document.createElement("div");
        windowHandle.classList.add("window");
        windowHandle.id = this.id;
        windowHandle.style.setProperty("--pos-x", this.x);
        windowHandle.style.setProperty("--pos-y", this.y);
        windowHandle.style.setProperty("--win-width", this.width);
        windowHandle.style.setProperty("--win-height", this.height);
        windowHandle.addEventListener("click", (e) => {
            if (e.target === windowHandle) {
                this.focus();
            }
        });
        this.windowHandle = windowHandle;

        document.body.appendChild(this.windowHandle);

        this.createTitlebar();
    }

    createTitlebar() {
        const titlebarHandle = document.createElement("div");
        titlebarHandle.classList.add("window--titlebar");

        let mx, my;
        const winHandle = this.windowHandle;
        function moveWindow(e) {
            const posx = e.clientX;
            const posy = e.clientY;

            winHandle.style.setProperty("--pos-x", posx - mx);
            winHandle.style.setProperty("--pos-y", posy - my);
        }

        titlebarHandle.addEventListener(
            "mousedown",
            (e) => {
                this.focus();
                mx =
                    e.clientX -
                    parseInt(winHandle.style.getPropertyValue("--pos-x"));
                my =
                    e.clientY -
                    parseInt(winHandle.style.getPropertyValue("--pos-y"));
                document.addEventListener("mousemove", moveWindow, false);
            },
            false
        );

        titlebarHandle.addEventListener(
            "mouseup",
            () => {
                document.removeEventListener("mousemove", moveWindow, false);
            },
            false
        );

        {
            const titlebarWindowInfo = document.createElement("div");
            titlebarWindowInfo.classList.add("window--titlebar-info");

            const titlebarIcon = document.createElement("img");
            titlebarIcon.src = this.icon;
            titlebarIcon.draggable = false;
            const titlebarTitle = document.createElement("span");
            titlebarTitle.innerText = this.title;

            titlebarWindowInfo.appendChild(titlebarIcon);
            titlebarWindowInfo.appendChild(titlebarTitle);

            titlebarHandle.appendChild(titlebarWindowInfo);
        }

        {
            const titlebarButtons = document.createElement("div");
            titlebarButtons.classList.add("window--titlebar-buttons");
            {
                const minimizeButton = document.createElement("button");
                minimizeButton.addEventListener("click", () => {
                    this.windowHandle.setAttribute("data-state", "minimized");
                });
                minimizeButton.setAttribute(
                    "data-titlebar-behavior",
                    "minimize"
                );

                const icon = document.createElement("img");
                icon.draggable = false;
                icon.src = "./assets/icons/minimize.svg";
                minimizeButton.appendChild(icon);

                titlebarButtons.appendChild(minimizeButton);
            }
            {
                const maximizeButton = document.createElement("button");
                maximizeButton.addEventListener("click", () => {
                    const state = this.windowHandle.getAttribute("data-state");
                    this.windowHandle.setAttribute(
                        "data-state",
                        state === "maximized" ? "desktop" : "maximized"
                    );
                });
                maximizeButton.setAttribute(
                    "data-titlebar-behavior",
                    "maximize"
                );

                const icon = document.createElement("img");
                icon.src = "./assets/icons/maximize.svg";
                icon.draggable = false;
                maximizeButton.appendChild(icon);

                titlebarButtons.appendChild(maximizeButton);
            }
            {
                const closeButton = document.createElement("button");
                closeButton.addEventListener("click", () => {
                    this.windowHandle.remove();
                    this.windowHandle = null;

                    document.getElementById(this.taskbarId).remove();
                    this.taskbarId = null;
                });
                closeButton.setAttribute("data-titlebar-behavior", "close");

                const icon = document.createElement("img");
                icon.src = "./assets/icons/close.svg";
                icon.draggable = false;
                closeButton.appendChild(icon);

                titlebarButtons.appendChild(closeButton);
            }

            titlebarHandle.appendChild(titlebarButtons);
        }

        this.windowHandle.appendChild(titlebarHandle);
    }

    initResizeHandles() {
        const windowEl = document.getElementById(this.id);
        const handleClasses = [
            "resize-handle-top",
            "resize-handle-right",
            "resize-handle-bottom",
            "resize-handle-left",
            "resize-handle-top-left",
            "resize-handle-top-right",
            "resize-handle-bottom-left",
            "resize-handle-bottom-right",
        ];

        handleClasses.forEach((cls) => {
            const handle = document.createElement("div");
            handle.classList.add("resize-handle");
            handle.classList.add(cls);

            windowEl.appendChild(handle);
        });

        const handles = windowEl.querySelectorAll(".resize-handle");
        handles.forEach((handle) => {
            handle.addEventListener("mousedown", (e) => {
                e.preventDefault();

                const startX = e.clientX;
                const startY = e.clientY;

                let startLeft = parseFloat(getComputedStyle(windowEl).left);
                let startTop = parseFloat(getComputedStyle(windowEl).top);
                let startWidth = parseFloat(getComputedStyle(windowEl).width);
                let startHeight = parseFloat(getComputedStyle(windowEl).height);

                function onMouseMove(e) {
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;

                    if (
                        handle.classList.contains("resize-handle-right") ||
                        handle.classList.contains("resize-handle-top-right") ||
                        handle.classList.contains("resize-handle-bottom-right")
                    ) {
                        windowEl.style.setProperty(
                            "--win-width",
                            `${startWidth + dx}px`
                        );
                    }
                    if (
                        handle.classList.contains("resize-handle-left") ||
                        handle.classList.contains("resize-handle-top-left") ||
                        handle.classList.contains("resize-handle-bottom-left")
                    ) {
                        let newWidth = startWidth - dx;
                        if (newWidth > 100) {
                            windowEl.style.setProperty(
                                "--win-width",
                                `${newWidth}px`
                            );
                            windowEl.style.setProperty(
                                "--pos-x",
                                `${startLeft + dx}px`
                            );
                        }
                    }
                    if (
                        handle.classList.contains("resize-handle-bottom") ||
                        handle.classList.contains(
                            "resize-handle-bottom-left"
                        ) ||
                        handle.classList.contains("resize-handle-bottom-right")
                    ) {
                        windowEl.style.setProperty(
                            "--win-height",
                            `${startHeight + dy}px`
                        );
                    }
                    if (
                        handle.classList.contains("resize-handle-top") ||
                        handle.classList.contains("resize-handle-top-left") ||
                        handle.classList.contains("resize-handle-top-right")
                    ) {
                        let newHeight = startHeight - dy;
                        if (newHeight > 100) {
                            windowEl.style.setProperty(
                                "--win-height",
                                `${newHeight}px`
                            );
                            windowEl.style.setProperty(
                                "--pos-y",
                                `${startTop + dy}px`
                            );
                        }
                    }
                }

                function onMouseUp() {
                    window.removeEventListener("mousemove", onMouseMove);
                    window.removeEventListener("mouseup", onMouseUp);
                }

                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
            });
        });
    }

    fetchWindowImplementation() {
        const impls = document.getElementById("window-implementations");
        const impl = impls.querySelector(
            `.window-implementation[data-for="${this.id}"]`
        );

        if (!impl)
            return;

        this.windowHandle.appendChild(impl);

        console.log(impl)
    }

    focus() {
        document.querySelectorAll(".window").forEach((win) => {
            if (win.id === this.id) return;

            win.setAttribute("data-z", "normal");
        });

        this.windowHandle.setAttribute("data-z", "focused");
    }

    unfocus() {
        this.windowHandle.setAttribute("data-z", "normal");
    }

    maximize() {
        document.querySelectorAll(".window").forEach((win) => {
            if (win.id === this.id) return;

            win.setAttribute("data-state", "desktop");
        });

        this.windowHandle.setAttribute("data-state", "maximized");
    }

    minimize() {
        this.windowHandle.setAttribute("data-state", "minimized");
    }

    show() {
        this.windowHandle.setAttribute("data-state", "desktop");
    }

    close() {
        document.getElementById(this.taskbarId).remove();
        this.taskbarId = null;

        this.windowHandle.remove();
        this.windowHandle = null;
    }
}

const desktop = document.querySelector("#desktop-area");
const taskbar = document.querySelector("#taskbar-area");
const contextMenu = document.querySelector("#context-menu");

const tbTime = document.querySelector("#taskbar--datetime-time");
const tbDate = document.querySelector("#taskbar--datetime-date");

const WALLPAPER_IMAGE = "./assets/wallpaper.jpg";
var windows = [];

document.addEventListener("DOMContentLoaded", async () => {
    windows.push(
        new DesktopWindow(
            "Notepad",
            "./assets/icons/notepad.png",
            100,
            100,
            600,
            400,
            "win-0"
        )
    );
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
    if (e.target === desktop) await showContextMenu(e.clientX, e.clientY);
});

document.addEventListener("click", async (e) => {
    if (
        (e.target.closest("#desktop-area") === desktop ||
            e.target.closest("#taskbar-area") === taskbar) &&
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
