class DynamicElement {
    #element = null;
    disabled = false;

    constructor(tag, props) {
        this.#element = document.createElement(tag ?? "div");

        if (props.id) this.#element.id = props.id;
        if (props.class) this.#element.className = props.class;
        if (props.src) this.#element.src = props.src;

        if (props.disabled) this.setDisabled(true);
        if (props.children) this.addChildren(props.children);
    }

    getElement() {
        return this.#element;
    }

    withElement(predicate) {
        predicate(this.#element);
        return this;
    }

    setParent(parent) {
        if (!parent) throw new Error("No parent to set for element");

        try {
            parent.appendChild(this.#element);
            return this;
        } catch {
            throw new Error("Failed to attach element to parent");
        }
    }

    setDisabled(disabled) {
        if (disabled) this.#element.setAttribute("disabled", "true");
        else this.#element.removeAttribute("disabled");

        this.disabled = Boolean(disabled);
        return this;
    }

    setImg(icon) {
        const img = this.getImg(this.#element);
        if (img) img.src = icon;
        return this;
    }

    getImg() {
        const img = this.#element.getElementsByTagName("img")[0];
        if (img) return img;
        return null;
    }

    addChildren(children) {
        if (Array.isArray(children) && children.length) {
            const mappedChildren = children.map((c) => (c instanceof DynamicElement ? c.getElement() : c));
            this.#element.append(...mappedChildren);
        }
        return this;
    }

    addClass(className, addToClass = true) {
        if (addToClass) this.#element.classList.add(className);
        return this;
    }

    removeClass(className) {
        this.#element.classList.remove(className);
        return this;
    }

    removeAllChildren() {
        this.#element.replaceChildren();
        return this;
    }

    removeSelf() {
        const parent = this.#element.parentElement;
        if (!parent) return false;

        parent.removeChild(this.#element);
        return true;
    }
}

export function createElement(tag, props = {}) {
    const dynamicElement = new DynamicElement(tag, props);

    if (props.primitive) return dynamicElement.getElement();
    return dynamicElement;
}
