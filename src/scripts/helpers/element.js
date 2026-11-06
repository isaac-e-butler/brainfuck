export function createElement(tag, props = {}) {
    const element = document.createElement(tag ?? "div");

    if (props.id) element.id = props.id;
    if (props.class) element.className = props.class;
    if (props.src) element.src = props.src;

    if (props.disabled) {
        element.setAttribute("disabled", "true");
    }

    if (Array.isArray(props.children) && props.children.length) {
        element.append(...props.children);
    }

    if (props.primitive) return element;

    return {
        getElement: function () {
            return element;
        },
        withElement: function (predicate) {
            predicate(element);
            return this;
        },
        setParent: function (parent) {
            if (!parent) throw new Error("No parent to set for element");

            try {
                parent.appendChild(element);
                return this;
            } catch {
                throw new Error("Failed to attach element to parent");
            }
        },
        setDisabled: function (disabled) {
            if (disabled) element.setAttribute("disabled", "true");
            else element.removeAttribute("disabled");
            return this;
        },
        getImg: function () {
            const img = element.getElementsByTagName("img")[0];
            if (img) return img;

            return null;
        },
        setImg: function (icon) {
            const img = this.getImg(element);
            if (img) img.src = icon;
            return this;
        },
        addClass: function (className) {
            element.classList.add(className);
            return this;
        },
        removeClass: function (className) {
            element.classList.remove(className);
            return this;
        },
    };
}
