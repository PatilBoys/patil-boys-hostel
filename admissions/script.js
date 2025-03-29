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

// Form Submission Script
const apiUrl = "https://script.google.com/macros/s/AKfycbwLX-J5aLeSwNWrPvsIT8C9SNgvR0mg3CyEZDFJdMwAbBM8VUILjPCd56SzN-Ry8RTi2Q/exec";

document.getElementById('admissionForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const contact = form.contact.value.trim();

  if (!name || !contact) {
    alert("Please fill out all fields.");
    return;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, contact }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === "success") {
      alert("Thank you! Your details have been submitted successfully.");
      form.reset();
    } else {
      alert("Failed to submit your details. Please try again.");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("An error occurred. Please check your connection and try again.");
  }
});
