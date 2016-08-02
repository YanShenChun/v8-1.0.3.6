function Point(x, y) {
  this.x = x;
  this.y = y;
}

var p = new Point(11, 22);
p.x = 53;
print("p.x ==" + p.x);
