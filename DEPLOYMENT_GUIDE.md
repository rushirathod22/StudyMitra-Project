

---

```markdown
# 🚀 Study Mitra Deployment & Debug Guide

## 📌 Project Structure
```

StudyMitra-Project/
├── frontend/
└── backend/

```

---

# 🧩 1. Backend Deployment (Render)

## ✅ Setup
- Root Directory: `backend`
- Build Command:
```

npm install

```
- Start Command:
```

node server.js

```

---

## 🔐 Environment Variables (Render → Backend → Environment)

```

MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/studymitra
GROK_API_KEY = your_key
PORT = 10000
NODE_ENV = production

````

---

## ⚠️ Backend Checklist

- [ ] `server.js` uses:
```js
const PORT = process.env.PORT || 5000;
````

* [ ] MongoDB connection:

```js
mongoose.connect(process.env.MONGO_URI)
```

* [ ] CORS enabled:

```js
app.use(cors({ origin: "*" }));
```

---

## 🔁 Redeploy

Render → Manual Deploy → Deploy latest commit

---

# 🗄️ 2. MongoDB Atlas Setup

## ✅ Steps

1. Create Cluster (Free M0)
2. Create DB User
3. Allow Network Access:

```
0.0.0.0/0
```

4. Get connection string:

```
mongodb+srv://username:password@cluster.mongodb.net/studymitra
```

---

## 🔍 Check Data

Atlas → Clusters → Browse Collections

---

# 🌐 3. Frontend Deployment (Vercel)

## ✅ Setup

* Root Directory:

```
frontend
```

* Build Command:

```
npm run build
```

* Output Directory:

```
dist
```

---

## 🔐 Environment Variable

```
VITE_API_BASE_URL = https://studymitra-backend.onrender.com
```

---

## 🔁 Deploy

Click **Deploy**

---

# 🔗 4. API Connection Rules

## ✅ Always use:

```
/api/...
```

### Example:

```
/api/auth/login
/api/practice/generate
/api/chat/...
```

---

# ❌ Common Mistakes

## 1. Wrong API URL

```
❌ /practice
✅ /api/practice
```

---

## 2. JSON Error (Unexpected '<')

Cause:

* Backend returned HTML (404/500)

Fix:

```js
if (!res.ok) {
  const text = await res.text();
  throw new Error(text);
}
```

---

## 3. MongoDB Error

```
ECONNREFUSED 127.0.0.1
```

Fix:

* Use Atlas URL (not localhost)

---

## 4. IP Not Whitelisted

Fix:

```
0.0.0.0/0
```

---

## 5. Case-Sensitive File Error

```
studymitra.png ❌
StudyMitra.png ✅
```

---

# 🧪 5. Debug Checklist

## 🔍 Backend Check

Open:

```
https://studymitra-backend.onrender.com
```

---

## 🔍 API Check

Open:

```
https://studymitra-backend.onrender.com/api/practice
```

---

## 🔍 Frontend Debug

* Open DevTools → Network
* Check:

  * URL
  * Status (200 / 404 / 500)
  * Response (JSON or HTML)

---

# 🔥 Final Flow

```
Frontend (Vercel)
   ↓
Backend (Render)
   ↓
MongoDB Atlas
```

---

# 🎯 Final Checklist

* [ ] Backend deployed
* [ ] MongoDB connected
* [ ] Env variables set
* [ ] Frontend deployed
* [ ] API URLs correct
* [ ] CORS enabled

---

# 💡 Pro Tip

Always test locally before deploy:

```
npm run build
npm run preview
```

---


