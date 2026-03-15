import BoxComponent from "../../../common/components/box/box.component";
import Color from "../../../common/types/color";

export default class DesktopRootPopupHandler
{
    constructor(
        private readonly overlayDiv: HTMLDivElement
    ) {}

    showPopup(title: string, color: Color): HTMLElement
    {
        this.overlayDiv.style.visibility = "visible";
        this.overlayDiv.onclick = () => this.overlayDiv.style.visibility = "hidden";
        this.overlayDiv.replaceChildren();

        const box = new BoxComponent(title, color);
        box.view.style.boxShadow = "0px 0px 20px #00000040";
        box.view.onclick = ev => ev.stopPropagation();
        box.create(this.overlayDiv);
        return box.content;
    }
}