class Position {
  constructor(row, col) {
    this.row = row;
    this.col = col;
  }

  add(other) {
    return new Position(this.row + other.row, this.col + other.col);
  }
}

export default Position;
