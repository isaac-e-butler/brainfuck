export function attachClickAnimation(element) {
    if (!element) {
        throw new Error("No element to attach events");
    }

    let timeout = undefined;

    const handleActive = () => {
        clearTimeout(timeout);
        element.classList.add("active");
    };

    const handleInactive = () => {
        timeout = setTimeout(() => {
            element.classList.remove("active");
        }, 150);
    };

    element.addEventListener("touchstart", handleActive);
    element.addEventListener("touchend", handleInactive);
    element.addEventListener("touchcancel", handleInactive);

    element.addEventListener("mousedown", handleActive);
    element.addEventListener("mouseup", handleInactive);
    element.addEventListener("mouseleave", handleInactive);
}
