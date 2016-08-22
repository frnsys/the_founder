class Position {
  constructor(col, row) {
    this.col = col;
    this.row = row;
  }

  add(other) {
    return new Position(this.col + other.col, this.row + other.row);
  }
}

export default Position;
