export function disableScrolling() {
  document.documentElement.style.setProperty('--html-overflow-y', 'hidden');
}

export function enableScrolling() {
  document.documentElement.style.setProperty('--html-overflow-y', 'overlay');
}
