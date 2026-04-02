import template from "./template.html"
import "./style.css"
import DesktopRoot from "../../root-component/desktop-root";
import Color from "../../../common/types/color";
import { htmlToElement } from "../../../common/services/html-to-element";

export default class KeyboardControlsExplainer {

    private readonly view: HTMLElement;

    constructor(
        private readonly root: DesktopRoot
    )
    {
        this.view = htmlToElement(template);
    }

    run()
    {
        const popupContent = this.root.showPopup("Keyboard Controls", Color.BLUE);
        popupContent.appendChild(this.view);
    }

}