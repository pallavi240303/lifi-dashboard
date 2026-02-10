const routeColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
  "#F8B739",
  "#52B788",
  "#E76F51",
  "#2A9D8F",
  "#E9C46A",
  "#F4A261",
  "#264653",
  "#E63946",
  "#A8DADC",
  "#457B9D",
  "#1D3557",
  "#F1FAEE",
];

const routeColorMap = {};
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

