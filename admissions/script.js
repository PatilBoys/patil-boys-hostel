// Live Clock Script
function updateClock() {
  const clockElement = document.getElementById('liveClock');
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = now.toLocaleDateString('en-IN');
  clockElement.textContent = `Current Time: ${timeString} | Date: ${dateString}`;
}
setInterval(updateClock, 1000);
updateClock();
