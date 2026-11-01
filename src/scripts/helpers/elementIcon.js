export function setElementIcon(element, icon) {
    const img = getIconElement(element);
    if (img) img.src = icon;
}

export function getIconElement(element) {
    const img = element.getElementsByTagName("img")[0];
    if (img) return img;

    return null;
}
