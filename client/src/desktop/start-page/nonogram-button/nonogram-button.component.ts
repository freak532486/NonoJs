import UIComponent from "../../../common/types/ui-component";
import "./style.css"
import { NonogramState } from "../../../common/types/nonogram-types";
import BoxComponent from "../../../common/components/box/box.component";
import Color from "../../../common/types/color";
import NonogramThumbnail from "../../../common/components/nonogram-thumbnail/nonogram-thumbnail.component";

export default class NonogramButton implements UIComponent
{

    private readonly box: BoxComponent;

    constructor(
        private readonly nonogram: NonogramState,
        width: number, height: number,
        onClick: () => void,
        color: Color = Color.BLUE
    )
    {
        this.box = new BoxComponent(nonogram.width + "x" + nonogram.height, color);
        this.box.content.style.width = width + "px";
        this.box.content.style.height = height + "px";
        this.box.content.onclick = onClick;
        this.box.view.classList.add("nonogram-button");

        const thumbnail = NonogramThumbnail.forDimensions(nonogram, width - 10, height - 10);
        thumbnail.create(this.box.content);
    }

    create(parent: HTMLElement): HTMLElement {
        return this.box.create(parent);
    }

    cleanup(): void {
        // Nothing to do
    }

}