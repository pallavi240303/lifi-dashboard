const routeColors = [
  "#E63946", // red
  "#2A9D8F", // teal
  "#457B9D", // steel blue
  "#E76F51", // burnt orange
  "#6A4C93", // purple
  "#1982C4", // bright blue
  "#6DB65B", // green
  "#1D3557", // navy
  "#E8A838", // golden amber
  "#D4687A", // dusty rose
  "#43AA8B", // emerald
  "#9B72AA", // soft violet
  "#F3722C", // deep orange
  "#3D85C6", // cornflower
  "#82B366", // olive green
  "#C1447A", // magenta
  "#5B9279", // forest teal
  "#A65C32", // sienna
  "#5A7DA8", // slate blue
  "#B8860B", // dark goldenrod
];

let routeColorMap = {};
let colorIndex = 0;

export function getRouteColor(route) {
  if (!routeColorMap[route]) {
    routeColorMap[route] = routeColors[colorIndex % routeColors.length];
    colorIndex++;
  }
  return routeColorMap[route];
}

export function getRouteColorMap() {
  return { ...routeColorMap };
}

