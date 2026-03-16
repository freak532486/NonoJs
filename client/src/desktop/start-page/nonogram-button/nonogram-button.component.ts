import UIComponent from "../../../common/types/ui-component";
import "./style.css"
import { NonogramState } from "../../../common/types/nonogram-types";
import BoxComponent from "../../../common/components/box/box.component";
import Color from "../../../common/types/color";
import NonogramThumbnail from "../../../common/components/nonogram-thumbnail/nonogram-thumbnail.component";

const PADDING = 10;

export default class NonogramButton implements UIComponent
{

    private readonly box: BoxComponent;

    private constructor(
        private readonly nonogram: NonogramState,
        thumbnailContainer: HTMLElement,
        onClick: () => void,
        color: Color
    )
    {
        this.box = new BoxComponent(nonogram.width + "x" + nonogram.height, color);
        this.box.content.onclick = onClick;
        this.box.view.classList.add("nonogram-button");
        this.box.content.appendChild(thumbnailContainer);
    }

    /**
     * Creates a nonogram button that will roughly be sized as the given size (but never larger).
     */
    static withMaximumSize(
        nonogram: NonogramState,
        width: number, height: number,
        onClick: () => void,
        color: Color = Color.BLUE
    ): NonogramButton
    {
        const thumbnailContainer = document.createElement("div");
        thumbnailContainer.classList.add("thumbnail-container");
        thumbnailContainer.style.maxWidth = width + "px";
        thumbnailContainer.style.maxHeight = height + "px";
        thumbnailContainer.style.padding = PADDING + "px";
        const thumbnail = NonogramThumbnail.forDimensions(nonogram, width - 2 * PADDING, height - 2 * PADDING);
        thumbnail.create(thumbnailContainer);
        return new NonogramButton(nonogram, thumbnailContainer, onClick, color);
    }

    /**
     * Creates a nonogram button where each cell will be of the given size, in pixels.
     */
    static withCellSize(
        nonogram: NonogramState,
        cellSize: number,
        onClick: () => void,
        color: Color = Color.BLUE
    ): NonogramButton
    {
        const thumbnailContainer = document.createElement("div");
        thumbnailContainer.classList.add("thumbnail-container");
        thumbnailContainer.style.padding = PADDING + "px";
        const thumbnail = new NonogramThumbnail(nonogram, cellSize);
        thumbnail.create(thumbnailContainer);
        return new NonogramButton(nonogram, thumbnailContainer, onClick, color);
    }

    create(parent: HTMLElement): HTMLElement {
        return this.box.create(parent);
    }

    cleanup(): void {
        // Nothing to do
    }

}