const token = localStorage.getItem("token");

const res = await fetch("http://localhost:5000/api/study/generate-plan", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    subject,
    goal,
    examDate,
    dailyHours
  })
});