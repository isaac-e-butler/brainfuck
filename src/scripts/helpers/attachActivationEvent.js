export function attachActivationEvent(element) {
    if (!element) {
        console.error("Failed to attach activation events");
        return;
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
