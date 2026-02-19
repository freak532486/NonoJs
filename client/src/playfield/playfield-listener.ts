export default interface PlayfieldListener
{
    /**
     * Is called whenever some cells in the playfield change (e.g. by user input, solving or reset).
     */
    onCellsChanged(): void;
}