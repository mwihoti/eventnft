/**
 * Deterministic graffiti SVG generator for BCN Meetup
 */

const PALETTES = [
  { main: '#FF0055', accent: '#00FFCC', bg: '#0F0F0F' }, // Neon Pink / Teal
  { main: '#FFCC00', accent: '#5500FF', bg: '#0F0F0F' }, // Gold / Purple
  { main: '#00FFAA', accent: '#FF00AA', bg: '#0F0F0F' }, // Mint / Magenta
  { main: '#00CCFF', accent: '#FF6600', bg: '#0F0F0F' }, // Sky / Orange
  { main: '#AAFF00', accent: '#AA00FF', bg: '#0F0F0F' }, // Lime / Violet
  { main: '#FFFFFF', accent: '#FF3333', bg: '#0F0F0F' }, // White / Red
];

const TIER_COLORS = {
  'Newcomer': '#00FF00',
  'Regular': '#BF40BF',
  'OG': '#FFBF00',
  'Legend': '#FF0000',
};

const FONT_FAMILY = 'Arial, Helvetica, sans-serif';
const DISPLAY_FONT_FAMILY = 'Arial Black, Impact, Arial, Helvetica, sans-serif';
const BLOCKCHAIN_CENTRE_LOGO =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMDgwIDMxNiI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5zdDAgewogICAgICAgIGZpbGw6ICMwMDk4NDY7CiAgICAgIH0KCiAgICAgIC5zdDEgewogICAgICAgIGZpbGw6ICMwMGJjNWI7CiAgICAgIH0KCiAgICAgIC5zdDIgewogICAgICAgIGZpbGw6ICNmZmNiMDA7CiAgICAgIH0KCiAgICAgIC5zdDMgewogICAgICAgIGZpbGw6ICMwMTU2Mjc7CiAgICAgIH0KICAgIDwvc3R5bGU+CiAgPC9kZWZzPgogIDxnPgogICAgPGc+CiAgICAgIDxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0xNzMuMiwyNC4zYy04LjctNS0xOC4zLTcuNS0yOC03LjYtOS43LDAtMTkuMywyLjYtMjgsNy42bC03My4yLDQyLjNjMi40LS4zLDUtLjUsNy45LS40LDEzLjcuMiwyMC43LDQuNywyNi45LDguNyw1LjYsMy42LDEwLDYuNCwxOS45LDYuNiw5LjkuMSwxNC40LTIuNSwyMC4xLTYsNi4yLTMuNywxMy4zLTcuOSwyNi40LTcuOSwxMy4yLDAsMjAuMiw0LjIsMjYuNCw3LjksNS43LDMuNCwxMC4yLDYuMSwyMC4xLDYsOS44LS4yLDE0LjMtMywxOS45LTYuNiw2LjItNCwxMy4zLTguNSwyNi45LTguNywyLjksMCw1LjUuMSw3LjkuNGwtNzMuMi00Mi4zWk0xMDIuMiw2OWMtNC44LDAtOC43LTMuOS04LjctOC43czMuOS04LjcsOC43LTguNyw4LjcsMy45LDguNyw4LjctMy45LDguNy04LjcsOC43Wk0xODguMyw2OWMtNC44LDAtOC43LTMuOS04LjctOC43czMuOS04LjcsOC43LTguNyw4LjcsMy45LDguNyw4LjctMy45LDguNy04LjcsOC43WiI+PC9wYXRoPgogICAgICA8cGF0aCBjbGFzcz0ic3QyIiBkPSJNMjM4LjcsNzkuNmMtOS44LjEtMTQuMywzLTE5LjksNi42LTYuMiw0LTEzLjMsOC41LTI2LjksOC43LTEzLjcuMi0yMC44LTQuMS0yNy4yLTcuOS01LjYtMy4zLTEwLjEtNi0xOS41LTYtOS41LDAtMTMuOSwyLjYtMTkuNSw2LTYuMywzLjgtMTMuNSw4LjEtMjcuMiw3LjktMTMuNy0uMi0yMC43LTQuNy0yNi45LTguNy01LjYtMy42LTEwLTYuNC0xOS45LTYuNi05LS4xLTEzLjUsMi4xLTE4LjYsNS4xbDczLDQyLjFjMTIuMSw3LDI1LjYsMTAuNSwzOS4xLDEwLjYsMTMuNSwwLDI3LTMuNiwzOS4xLTEwLjZsNzMtNDIuMWMtNS0zLTkuNi01LjItMTguNi01LjFaTTE0NS4yLDExNS43Yy00LjYtLjItOC4zLTQtOC4zLTguN3MzLjctOC41LDguMy04LjdjNC42LjIsOC4zLDQsOC4zLDguN3MtMy43LDguNS04LjMsOC43WiI+PC9wYXRoPgogICAgPC9nPgogICAgPHBhdGggY2xhc3M9InN0MSIgZD0iTTk3LjIsMTQyLjNsLTYxLjMtMzUuNGM0LjcsOS42LDQuNiwxNi44LDQuNSwyMy4zLDAsNi43LS4yLDExLjksNC45LDIwLjQsNS4xLDguNSw5LjcsMTAuOSwxNS42LDEzLjksNi41LDMuNCwxNCw3LjIsMjEsMTksNywxMS43LDYuOSwyMC4xLDYuOCwyNy41LS4xLDYuNi0uMiwxMS45LDQuOSwyMC4zLDUsOC41LDkuNywxMC45LDE1LjYsMTMuOSw2LjUsMy40LDE0LDcuMiwyMSwxOSw0LjMsNy4yLDUuOSwxMy4xLDYuNSwxOC40di03MS45YzAtMjguMi0xNS01NC4yLTM5LjUtNjguNFpNNjkuNiwxNTYuM2MtNC44LDAtOC43LTMuOS04LjctOC43czMuOS04LjcsOC43LTguNyw4LjcsMy45LDguNyw4LjctMy45LDguNy04LjcsOC43Wk0xMTUuMiwyMzQuM2MtNC44LDAtOC43LTMuOS04LjctOC43czMuOS04LjcsOC43LTguNyw4LjcsMy45LDguNyw4LjctMy45LDguNy04LjcsOC43WiI+PC9wYXRoPgogICAgPHBhdGggY2xhc3M9InN0MSIgZD0iTTEyMy41LDI5MS40YzAtNi42LjItMTEuOS00LjktMjAuNC01LjEtOC41LTkuNy0xMC45LTE1LjYtMTMuOS02LjUtMy40LTE0LTcuMi0yMS0xOS03LTExLjctNi45LTIwLjEtNi44LTI3LjUsMC02LjcuMi0xMS45LTQuOS0yMC40LTUtOC40LTkuNy0xMC45LTE1LjYtMTMuOS02LjUtMy40LTE0LTcuMi0yMS0xOS03LTExLjctNi45LTIwLjEtNi44LTI3LjUsMC02LjcuMi0xMS45LTQuOS0yMC40LTIuNy00LjYtNS40LTcuNC04LjEtOS41djEwMi45YzAsMjAuMywxMC44LDM5LDI4LjQsNDkuMmw4MS4zLDQ2LjljLS4yLTIuOC0uMi01LjQtLjItNy44Wk00OC4zLDIyMC44Yy00LjgsMC04LjctMy45LTguNy04LjdzMy45LTguNyw4LjctOC43LDguNywzLjksOC43LDguNy0zLjksOC43LTguNyw4LjdaIj48L3BhdGg+CiAgICA8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjU1LjQsMTA2LjlsLTYxLjMsMzUuNGMtMjQuNCwxNC4xLTM5LjUsNDAuMi0zOS41LDY4LjR2NzEuOWMuNi01LjIsMi4yLTExLjEsNi41LTE4LjQsNy0xMS43LDE0LjQtMTUuNiwyMS0xOSw1LjktMy4xLDEwLjYtNS41LDE1LjYtMTMuOSw1LTguNCw1LTEzLjcsNC45LTIwLjMtLjEtNy40LS4yLTE1LjcsNi44LTI3LjUsNy0xMS43LDE0LjQtMTUuNiwyMS0xOSw1LjktMy4xLDEwLjYtNS41LDE1LjYtMTMuOSw1LTguNCw1LTEzLjcsNC45LTIwLjQsMC02LjUtLjItMTMuNyw0LjUtMjMuM1pNMTc2LjEsMjM0LjNjLTQuOCwwLTguNy0zLjktOC43LTguN3MzLjktOC43LDguNy04LjcsOC43LDMuOSw4LjcsOC43LTMuOSw4LjctOC43LDguN1pNMjIxLjcsMTU2LjNjLTQuOCwwLTguNy0zLjktOC43LTguN3MzLjktOC43LDguNy04LjcsOC43LDMuOSw4LjcsOC43LTMuOSw4LjctOC43LDguN1oiPjwvcGF0aD4KICAgIDxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yNjkuMiwxMDkuN2MtNSw4LjQtNSwxMy43LTQuOSwyMC40LjEsNy40LjIsMTUuNy02LjgsMjcuNS03LDExLjctMTQuNCwxNS42LTIxLDE5LTUuOSwzLjEtMTAuNiw1LjUtMTUuNiwxMy45LTUsOC41LTUsMTMuNy00LjksMjAuNC4xLDcuNC4yLDE1LjctNi44LDI3LjUtNywxMS43LTE0LjQsMTUuNi0yMSwxOS01LjksMy4xLTEwLjYsNS41LTE1LjYsMTMuOS01LjEsOC40LTUsMTMuNy00LjksMjAuNCwwLDIuNSwwLDUtLjIsNy44bDgxLjMtNDYuOWMxNy42LTEwLjEsMjguNC0yOC45LDI4LjQtNDkuMnYtMTAyLjljLTIuOCwyLjEtNS40LDQuOS04LjEsOS41Wk0yNDIuOSwyMjAuOGMtNC44LDAtOC43LTMuOS04LjctOC43czMuOS04LjcsOC43LTguNyw4LjcsMy45LDguNyw4LjctMy45LDguNy04LjcsOC43WiI+PC9wYXRoPgogIDwvZz4KICA8Zz4KICAgIDxnPgogICAgICA8Zz4KICAgICAgICA8cGF0aCBjbGFzcz0ic3QzIiBkPSJNMzU5LjYsMTY1LjZ2LTg3LjZoNDguMWM4LjgsMCwxNi40LDIuOSwyMi43LDguNiw2LjMsNS43LDkuNCwxMi42LDkuNCwyMC42cy0zLjEsNy41LTkuNCwxMC4zYy0yLjEuOS00LjMsMS43LTYuNiwyLjN2My44YzIuNC42LDQuNiwxLjQsNi42LDIuNCw2LjMsMi44LDkuNCw2LjMsOS40LDEwLjMsMCw4LjEtMy4xLDE1LTkuNCwyMC43LTYuMyw1LjctMTMuOSw4LjUtMjIuNyw4LjVoLTQ4LjFaTTQwNy44LDExNC41YzIuMiwwLDQuMS0uNyw1LjctMi4xLDEuNi0xLjQsMi4zLTMuMSwyLjMtNS4xcy0uOC0zLjctMi4zLTUuMWMtMS42LTEuNC0zLjUtMi4xLTUuNy0yLjFoLTI0LjF2MTQuNmgyNC4xWk00MDcuOCwxNDMuN2MyLjIsMCw0LjEtLjcsNS43LTIuMSwxLjYtMS40LDIuMy0zLjIsMi4zLTUuMnMtLjgtMy43LTIuMy01LjFjLTEuNi0xLjQtMy41LTIuMS01LjctMi4xaC0yNC4xdjE0LjZoMjQuMVoiPjwvcGF0aD4KICAgICAgICA8cGF0aCBjbGFzcz0ic3QzIiBkPSJNNDQ3LjksMTY1LjZ2LTg3LjZoMjR2ODcuNmgtMjRaIj48L3BhdGg+CiAgICAgICAgPHBhdGggY2xhc3M9InN0MyIgZD0iTTUxMi4xLDE2NS42Yy04LjgsMC0xNi40LTIuOC0yMi43LTguNS02LjMtNS43LTkuNC0xMi42LTkuNC0yMC43di0xNC42YzAtOCwzLjEtMTQuOSw5LjQtMjAuNyw2LjMtNS43LDEzLjktOC41LDIyLjctOC41aDhjOC45LDAsMTYuNCwyLjgsMjIuNyw4LjUsNi4zLDUuNyw5LjQsMTIuNiw5LjQsMjAuN3YxNC42YzAsOC4xLTMuMSwxNS05LjQsMjAuNy02LjMsNS43LTEzLjgsOC41LTIyLjcsOC41aC04Wk01MjAuMSwxNDMuN2MyLjIsMCw0LjEtLjcsNS43LTIuMSwxLjYtMS40LDIuMy0zLjIsMi4zLTUuMnYtMTQuNmMwLTItLjgtMy43LTIuMy01LjEtMS42LTEuNS0zLjUtMi4yLTUuNy0yLjJoLThjLTIuMiwwLTQuMS43LTUuNiwyLjItMS42LDEuNC0yLjQsMy4xLTIuNCw1LjF2MTQuNmMwLDIsLjgsMy44LDIuNCw1LjIsMS42LDEuNCwzLjQsMi4xLDUuNiwyLjFoOFoiPjwvcGF0aD4KICAgICAgICA8cGF0aCBjbGFzcz0ic3QzIiBkPSJNNTkyLjQsMTY1LjZjLTguOCwwLTE2LjQtMi44LTIyLjctOC41LTYuMy01LjctOS40LTEyLjYtOS40LTIwLjd2LTE0LjZjMC04LDMuMS0xNC45LDkuNC0yMC43LDYuMy01LjcsMTMuOS04LjUsMjIuNy04LjVoOGM4LjksMCwxNi40LDIuOCwyMi43LDguNSw2LjMsNS43LDkuNCwxMi42LDkuNCwyMC43aC0yNC4xYzAtMi0uOC0zLjctMi4zLTUuMS0xLjYtMS41LTMuNS0yLjItNS43LTIuMmgtOGMtMi4yLDAtNC4xLjctNS42LDIuMi0xLjYsMS40LTIuNCwzLjEtMi40LDUuMXYxNC42YzAsMiwuOCwzLjgsMi40LDUuMiwxLjYsMS40LDMuNCwyLjEsNS42LDIuMWg4YzIuMiwwLDQuMS0uNyw1LjctMi4xLDEuNi0xLjQsMi4zLTMuMiwyLjMtNS4yaDI0LjFjMCw4LjEtMy4xLDE1LTkuNCwyMC43LTYuMyw1LjctMTMuOCw4LjUtMjIuNyw4LjVoLThaIj48L3BhdGg+CiAgICAgICAgPHBhdGggY2xhc3M9InN0MyIgZD0iTTY0MC42LDE2NS42di04Ny42aDI0djM2LjVoMTYuMWMyLjIsMCw0LjEtLjcsNS43LTIuMSwxLjYtMS40LDIuMy0zLjEsMi4zLTUuMXYtMTQuNmgyNC4xdjE0LjZjMCwyLjctMS42LDUtNC43LDYuOS0zLjEsMS45LTYuOSwyLjgtMTEuMywyLjh2NC45YzQuNCwwLDguMiwxLjQsMTEuMyw0LjMsMy4yLDIuOCw0LjcsNi4zLDQuNywxMC4zdjI5LjJoLTI0LjF2LTIxLjljMC0yLS44LTMuOC0yLjMtNS4yLTEuNi0xLjQtMy41LTIuMS01LjctMi4xaC0xNi4xdjI5LjJoLTI0WiI+PC9wYXRoPgogICAgICAgIDxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik03NTIuOSwxNjUuNmMtOC44LDAtMTYuNC0yLjgtMjIuNy04LjUtNi4zLTUuNy05LjQtMTIuNi05LjQtMjAuN3YtMTQuNmMwLTgsMy4xLTE0LjksOS40LTIwLjcsNi4zLTUuNywxMy45LTguNSwyMi43LTguNWg4YzguOSwwLDE2LjQsMi44LDIyLjcsOC41LDYuMyw1LjcsOS40LDEyLjYsOS40LDIwLjdoLTI0LjFjMC0yLS44LTMuNy0yLjMtNS4xLTEuNi0xLjUtMy41LTIuMi01LjctMi4yaC04Yy0yLjIsMC00LjEuNy01LjYsMi4yLTEuNiwxLjQtMi40LDMuMS0yLjQsNS4xdjE0LjZjMCwyLC44LDMuOCwyLjQsNS4yLDEuNiwxLjQsMy40LDIuMSw1LjYsMi4xaDhjMi4yLDAsNC4xLS43LDUuNy0yLjEsMS42LTEuNCwyLjMtMy4yLDIuMy01LjJoMjQuMWMwLDguMS0zLjEsMTUtOS40LDIwLjctNi4zLDUuNy0xMy44LDguNS0yMi43LDguNWgtOFoiPjwvcGF0aD4KICAgICAgICA8cGF0aCBjbGFzcz0ic3QzIiBkPSJNODAxLjEsMTY1LjZ2LTg3LjZoMjR2MjkuMmg1LjRjMC00LDEtNy41LDMuMS0xMC4zLDIuMS0yLjgsNC42LTQuMiw3LjYtNC4yLDguOSwwLDE2LjQsMi44LDIyLjcsOC41LDYuMyw1LjcsOS40LDEyLjYsOS40LDIwLjd2NDMuOGgtMjQuMXYtNDMuOGMwLTItLjgtMy43LTIuMy01LjEtMS42LTEuNS0zLjUtMi4yLTUuNy0yLjItNC40LDAtOC4yLjctMTEuNCwyLjEtMy4xLDEuNC00LjcsMy4yLTQuNyw1LjJ2NDMuOGgtMjRaIj48L3BhdGg+CiAgICAgICAgPHBhdGggY2xhc3M9InN0MyIgZD0iTTg5MC44LDE1Ny4xYy02LjMtNS43LTkuNC0xMi42LTkuNC0yMC43di0xLjhjMC0yLC44LTMuOCwyLjMtNS4yLDEuNi0xLjQsMy40LTIuMSw1LjYtMi4xaDQwLjJ2LTUuNGMwLTItLjgtMy43LTIuMy01LjEtMS42LTEuNS0zLjUtMi4yLTUuNy0yLjJoLThjLTIuMiwwLTQuMS43LTUuNiwyLjItMS42LDEuNC0yLjQsMy4xLTIuNCw1LjFoLTI0YzAtOCwzLjEtMTQuOSw5LjQtMjAuNyw2LjMtNS43LDEzLjktOC41LDIyLjctOC41aDhjOC45LDAsMTYuNCwyLjgsMjIuNyw4LjUsNi4zLDUuNyw5LjQsMTIuNiw5LjQsMjAuN3Y0My44aC0yNC4xdi0xNC42aC01LjNjMCw0LTEsNy41LTMuMSwxMC4zLTIuMSwyLjgtNC42LDQuMi03LjYsNC4yLTguOCwwLTE2LjQtMi44LTIyLjctOC41Wk05MTMuNSwxNDMuN2M0LjUsMCw4LjItLjcsMTEuNC0yLjEsMy4xLTEuNCw0LjctMy4yLDQuNy01LjJoLTIwLjFjLTEuMSwwLTIuMS40LTIuOCwxLjEtLjguNy0xLjIsMS41LTEuMiwyLjVzLjQsMS45LDEuMiwyLjZjLjguNywxLjcsMS4xLDIuOCwxLjFoNFoiPjwvcGF0aD4KICAgICAgICA8cGF0aCBjbGFzcz0ic3QzIiBkPSJNOTYxLjcsODcuMnYtOS4xaDI0djkuMWgtMjRaTTk2MS43LDE2NS42di03Mi45aDI0djcyLjloLTI0WiI+PC9wYXRoPgogICAgICAgIDxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik05OTMuOCwxNjUuNnYtNzIuOWgyNHYxNC42aDUuNGMwLTQsMS03LjUsMy4xLTEwLjMsMi4xLTIuOCw0LjYtNC4yLDcuNi00LjIsOC45LDAsMTYuNCwyLjgsMjIuNyw4LjUsNi4zLDUuNyw5LjQsMTIuNiw5LjQsMjAuN3Y0My44aC0yNC4xdi00My44YzAtMi0uOC0zLjctMi4zLTUuMS0xLjYtMS41LTMuNS0yLjItNS43LTIuMi00LjQsMC04LjIuNy0xMS40LDIuMS0zLjEsMS40LTQuNywzLjItNC43LDUuMnY0My44aC0yNFoiPjwvcGF0aD4KICAgICAgPC9nPgogICAgICA8Zz4KICAgICAgICA8cGF0aCBjbGFzcz0ic3QzIiBkPSJNNTE0LDIwMy41YzMsMi4zLDUuMSw1LjUsNi4xLDkuNGgtNi40Yy0uOS0yLjItMi4zLTQtNC4yLTUuMy0xLjktMS4zLTQuMy0yLTctMnMtNC4yLjUtNS45LDEuNmMtMS43LDEuMS0zLjEsMi42LTQuMSw0LjctMSwyLTEuNSw0LjQtMS41LDcuMXMuNSw1LDEuNSw3YzEsMiwyLjQsMy42LDQuMSw0LjcsMS43LDEuMSwzLjcsMS42LDUuOSwxLjZzNS4xLS43LDctMmMxLjktMS4zLDMuMy0zLjEsNC4yLTUuM2g2LjRjLTEuMSw0LTMuMSw3LjEtNi4xLDkuNC0zLDIuMy02LjgsMy41LTExLjQsMy41cy02LjYtLjgtOS4zLTIuNGMtMi43LTEuNi00LjgtMy44LTYuMy02LjctMS41LTIuOS0yLjItNi4xLTIuMi05LjhzLjctNywyLjItOS44YzEuNS0yLjksMy42LTUuMSw2LjMtNi43LDIuNy0xLjYsNS44LTIuNCw5LjMtMi40czguNCwxLjIsMTEuNCwzLjVaIj48L3BhdGg+CiAgICAgICAgPHBhdGggY2xhc3M9InN0MyIgZD0iTTYwOC44LDIyNC4yaC0yMi4zYy4xLDMsLjksNS4yLDIuNSw2LjYsMS41LDEuNCwzLjUsMi4yLDUuNywyLjJzMy43LS41LDUuMS0xLjVjMS40LTEsMi4yLTIuNCwyLjYtNC4xaDYuNGMtLjQsMi0xLjIsMy44LTIuNCw1LjQtMS4yLDEuNi0yLjgsMi44LTQuOCwzLjctMiwuOS00LjIsMS4zLTYuNiwxLjNzLTUuMy0uNi03LjUtMS44Yy0yLjItMS4yLTMuOS0yLjktNS4xLTUuMi0xLjItMi4yLTEuOC00LjktMS44LThzLjYtNS43LDEuOC03LjljMS4yLTIuMiwyLjktNCw1LjEtNS4yLDIuMi0xLjIsNC42LTEuOCw3LjUtMS44czUuMy42LDcuNSwxLjhjMi4xLDEuMiwzLjgsMi44LDQuOSw0LjgsMS4xLDIuMSwxLjcsNC4zLDEuNyw2LjlzMCwxLjgtLjIsMi42Wk02MDEuOSwyMTYuN2MtLjctMS4zLTEuNy0yLjItMi45LTIuOC0xLjItLjYtMi42LS45LTQuMS0uOS0yLjQsMC00LjMuNy01LjksMi4yLTEuNiwxLjQtMi40LDMuNi0yLjYsNi40aDE2LjVjMC0xLjktLjMtMy41LTEtNC44WiI+PC9wYXRoPgogICAgICAgIDxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik02OTQuOSwyMTEuM2MyLDIuMiwzLjEsNS4zLDMuMSw5LjN2MTYuOWgtNnYtMTYuM2MwLTIuNi0uNy00LjYtMi02LTEuMy0xLjQtMy4yLTIuMS01LjUtMi4xcy00LjMuOC01LjcsMi4zYy0xLjQsMS41LTIuMiwzLjgtMi4yLDYuN3YxNS40aC02di0yOWg2djYuNGMuOC0yLjIsMi4xLTMuOSwzLjktNS4xLDEuOC0xLjIsMy45LTEuOCw2LjMtMS44czYuMSwxLjEsOC4xLDMuM1oiPjwvcGF0aD4KICAgICAgICA8cGF0aCBjbGFzcz0ic3QzIiBkPSJNNzc1LjQsMjMyLjN2NS4yaC0zLjdjLTMuMSwwLTUuNC0uNy03LTIuMi0xLjYtMS41LTIuNC00LTIuNC03LjV2LTE0LjJoLTQuMnYtNS4xaDQuMnYtNy4yaDYuMXY3LjJoN3Y1LjFoLTd2MTQuM2MwLDEuNy4zLDIuOC45LDMuNC42LjYsMS43LjksMy4yLjloMi45WiI+PC9wYXRoPgogICAgICAgIDxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik04NDcuMiwyMDkuN2MxLjgtMS4xLDMuOS0xLjcsNi4zLTEuN3Y2LjVoLTEuOGMtMi42LDAtNC44LjYtNi4zLDEuOS0xLjYsMS4zLTIuNCwzLjQtMi40LDYuM3YxNC43aC02di0yOWg2djUuN2MxLTEuOSwyLjQtMy40LDQuMi00LjVaIj48L3BhdGg+CiAgICAgICAgPHBhdGggY2xhc3M9InN0MyIgZD0iTTk0MC42LDIyNC4yaC0yMi4zYy4xLDMsLjksNS4yLDIuNSw2LjYsMS41LDEuNCwzLjUsMi4yLDUuNywyLjJzMy43LS41LDUuMS0xLjVjMS40LTEsMi4yLTIuNCwyLjYtNC4xaDYuNGMtLjQsMi0xLjIsMy44LTIuNCw1LjQtMS4yLDEuNi0yLjgsMi44LTQuOCwzLjctMiwuOS00LjIsMS4zLTYuNiwxLjNzLTUuMy0uNi03LjUtMS44Yy0yLjItMS4yLTMuOS0yLjktNS4xLTUuMi0xLjItMi4yLTEuOC00LjktMS44LThzLjYtNS43LDEuOC03LjljMS4yLTIuMiwyLjktNCw1LjEtNS4yLDIuMi0xLjIsNC42LTEuOCw3LjUtMS44czUuMy42LDcuNSwxLjhjMi4xLDEuMiwzLjgsMi44LDQuOSw0LjhzMS43LDQuMywxLjcsNi45LDAsMS44LS4yLDIuNlpNOTMzLjcsMjE2LjdjLS43LTEuMy0xLjctMi4yLTMtMi44LTEuMi0uNi0yLjYtLjktNC4xLS45LTIuNCwwLTQuMy43LTUuOSwyLjItMS42LDEuNC0yLjQsMy42LTIuNiw2LjRoMTYuNWMwLTEuOS0uMy0zLjUtMS00LjhaIj48L3BhdGg+CiAgICAgIDwvZz4KICAgIDwvZz4KICAgIDxyZWN0IGNsYXNzPSJzdDMiIHg9Ijk2OS44IiB5PSIyMjAuNSIgd2lkdGg9Ijk2LjIiIGhlaWdodD0iNS4xIj48L3JlY3Q+CiAgICA8cmVjdCBjbGFzcz0ic3QzIiB4PSIzNTkuNiIgeT0iMjIwLjUiIHdpZHRoPSI5Ni4yIiBoZWlnaHQ9IjUuMSI+PC9yZWN0PgogIDwvZz4KPC9zdmc+Cg==';

function seededRand(seed, index) {
  const x = Math.sin(seed * 9301 + index * 49297 + 233) * 10000;
  return x - Math.floor(x);
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateSVG(attendeeNumber, attendedCount = 1, attendeeName = '') {
  const seed = attendeeNumber + 12345;
  const palette = PALETTES[attendeeNumber % PALETTES.length];
  const displayName = escapeXml(attendeeName.trim().slice(0, 32));
  
  let tier = 'Newcomer';
  if (attendedCount >= 10) tier = 'Legend';
  else if (attendedCount >= 7) tier = 'OG';
  else if (attendedCount >= 3) tier = 'Regular';

  const tierColor = TIER_COLORS[tier];

  // Generate spray dots
  let sprayDots = '';
  for (let i = 0; i < 40; i++) {
    const x = seededRand(seed, i * 2) * 800;
    const y = seededRand(seed, i * 2 + 1) * 300; // Top area
    const r = seededRand(seed, i * 3) * 3 + 1;
    const opacity = seededRand(seed, i * 4) * 0.6 + 0.2;
    sprayDots += `<circle cx="${x}" cy="${y}" r="${r}" fill="${palette.accent}" fill-opacity="${opacity}" />`;
  }

  // Generate drips for "NAIROBI"
  let drips = '';
  const letters = "NAIROBI";
  const startX = 140;
  const spacing = 85;
  for (let i = 0; i < letters.length; i++) {
    const dripLen = seededRand(seed, i + 50) * 60 + 20;
    const dripX = startX + i * spacing + 30;
    drips += `<rect x="${dripX}" y="110" width="4" height="${dripLen}" fill="${palette.main}" rx="2" />`;
    drips += `<circle cx="${dripX + 2}" cy="${110 + dripLen}" r="4" fill="${palette.main}" />`;
  }

  return `
<svg width="800" height="1120" viewBox="0 0 800 1120" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="1120" fill="${palette.bg}" />
  
  <!-- Spray Accents -->
  <g>${sprayDots}</g>
  
  <!-- Top Zone: Graffiti -->
  <g transform="translate(400, 100)" text-anchor="middle">
    ${drips}
    <text y="0" font-family="${DISPLAY_FONT_FAMILY}" font-size="110" fill="${palette.main}" font-weight="900" style="letter-spacing: 5px;">NAIROBI</text>
    <text y="50" font-family="${FONT_FAMILY}" font-size="24" fill="${palette.accent}" font-weight="bold" style="letter-spacing: 12px;">WEB3 DAO</text>
  </g>

  <!-- Dashed Divider -->
  <line x1="100" y1="180" x2="700" y2="180" stroke="${palette.accent}" stroke-width="2" stroke-dasharray="10,10" opacity="0.5" />

  <!-- Centre: Event Poster -->
  <g transform="translate(100, 220)">
    <rect width="600" height="650" fill="#1A1A1A" stroke="${palette.accent}" stroke-width="4" rx="10" />
    
    <!-- Tacks -->
    <circle cx="15" cy="15" r="8" fill="#D4AF37" />
    <circle cx="585" cy="15" r="8" fill="#D4AF37" />
    <circle cx="15" cy="635" r="8" fill="#D4AF37" />
    <circle cx="585" cy="635" r="8" fill="#D4AF37" />

    <rect x="90" y="50" width="420" height="126" fill="#F5F7F2" rx="8" opacity="0.96" />
    <image href="${BLOCKCHAIN_CENTRE_LOGO}" x="110" y="70" width="380" height="86" preserveAspectRatio="xMidYMid meet" />

    <text x="300" y="220" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="42" fill="white" font-weight="bold">COMMUNITY MEETUP</text>
    <text x="300" y="270" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="24" fill="${palette.main}">June 15 - 2025</text>
    
    <g transform="translate(60, 315)" font-family="${FONT_FAMILY}" font-size="18" fill="#CCCCCC">
      <text y="0" font-weight="bold" fill="white">VENUE</text>
      <text y="30">Blockchain Centre NBO, Argwings Kodhek Rd, Nairobi</text>
      
      <text y="80" font-weight="bold" fill="white">SPEAKERS</text>
      <text y="110">Ada Okonkwo - Kwame Asante</text>
      <text y="135">Amina Wanjiku - Dev Patel</text>
      
      <text y="185" font-weight="bold" fill="white">TOPICS</text>
      <text y="215">CIP-68 - DeFi - NFT Tools - Governance</text>
      
      <text y="270" font-weight="bold" fill="white">PERKS</text>
      <rect y="285" width="480" height="60" fill="#222" rx="5" />
      <text y="320" x="240" text-anchor="middle" fill="#555" font-style="italic">Unlocks post-event</text>
    </g>

    <g transform="translate(300, 600)" text-anchor="middle">
      <rect x="-80" y="-20" width="160" height="40" rx="20" fill="${palette.main}" fill-opacity="0.2" stroke="${palette.main}" />
      <text y="8" font-family="${FONT_FAMILY}" font-size="16" fill="${palette.main}" font-weight="bold">ADA NAIROBI DAO</text>
    </g>
  </g>

  <!-- Side Walls -->
  <g transform="translate(40, 500) rotate(-90)" font-family="${DISPLAY_FONT_FAMILY}" font-size="40" fill="${palette.main}" opacity="0.3" font-weight="900">
    <text x="0" y="0">BLOCK / CHAIN</text>
  </g>
  <g transform="translate(760, 500) rotate(90)" font-family="${DISPLAY_FONT_FAMILY}" font-size="40" fill="${palette.main}" opacity="0.3" font-weight="900">
    <text x="0" y="0">CARDANO / ADA 2025</text>
  </g>

  <!-- Bottom Badge Strip -->
  <g transform="translate(100, 920)">
    <!-- Attendee ID -->
    <rect width="100" height="60" rx="5" fill="#222" />
    <text x="50" y="25" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="12" fill="#888">ATTENDEE</text>
    <text x="50" y="50" text-anchor="middle" font-family="${DISPLAY_FONT_FAMILY}" font-size="24" fill="white" font-weight="900">#${attendeeNumber.toString().padStart(3, '0')}</text>
    
    <!-- Tier -->
    <rect x="110" width="120" height="60" rx="5" fill="#222" />
    <text x="170" y="25" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="12" fill="#888">TIER</text>
    <text x="170" y="50" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="18" fill="${tierColor}" font-weight="bold">${tier}</text>
    
    <!-- CIP-68 -->
    <rect x="240" width="100" height="60" rx="5" fill="#222" />
    <text x="290" y="38" text-anchor="middle" font-family="${DISPLAY_FONT_FAMILY}" font-size="20" fill="${palette.accent}" font-weight="900">CIP-68</text>

    <!-- Share Badge -->
    <rect x="350" width="250" height="60" rx="5" fill="${palette.main}" />
    <text x="475" y="38" text-anchor="middle" font-family="${DISPLAY_FONT_FAMILY}" font-size="20" fill="black" font-weight="900">ADA ON-CHAIN / SHARE IT</text>
  </g>

  ${displayName ? `
  <!-- Claimed By -->
  <g transform="translate(100, 990)" font-family="${FONT_FAMILY}" text-anchor="middle">
    <rect width="600" height="42" rx="8" fill="#222" stroke="${palette.accent}" stroke-opacity="0.5" />
    <text x="300" y="17" font-size="10" fill="#888" style="letter-spacing: 2px;">CLAIMED BY</text>
    <text x="300" y="34" font-size="20" fill="white" font-weight="bold">${displayName}</text>
  </g>
  ` : ''}

  <!-- Footer -->
  <g transform="translate(100, 1060)" font-family="${FONT_FAMILY}" font-size="12" fill="#555">
    <text y="0">EDITION: ${attendeeNumber} of 200 - VERSION: 1</text>
    <text y="20">minted via mesh sdk - aiken validator - cardano mainnet</text>
    <text x="600" y="40" text-anchor="end" font-weight="bold" fill="#777">BLOCKCHAIN CENTRE NBO x CARDANO</text>
  </g>
</svg>
`;
}
