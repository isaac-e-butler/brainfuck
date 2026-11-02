const loadingIcon = "./src/icons/states/loading.svg";

export function setButtonLoading(button) {
    const defaultIcon = button.getImg().src;

    button.setDisabled(true);
    button.addClass("loading");
    button.setImg(loadingIcon);

    function restore() {
        button.setDisabled(false);
        button.removeClass("loading");
        button.setImg(defaultIcon);
    }

    return restore;
}
