Perfect—now we turn your wireframe into a **Figma-level UI design system + screen layout** so you can directly build it in React/Tailwind (or even recreate in Figma if needed).

I’ll give you:

* 🎨 Design system (colors, typography, spacing)
* 🧩 Components (reusable)
* 📱 Actual screen layouts (pixel-thinking)

---

# 🎨 1. DESIGN SYSTEM (Foundation)

## 🎯 Colors (Medical + Trust)

```css
Primary: #16A34A   /* Green */
Primary Dark: #15803D
Accent: #22C55E

Background: #FFFFFF
Section BG: #F8FAFC
Border: #E5E7EB

Text Primary: #111827
Text Secondary: #6B7280

Danger (Booked): #EF4444
```

---

## 🔤 Typography

```css
Heading: 24px – 32px (bold)
Subheading: 18px – 20px (semi-bold)
Body: 14px – 16px
Small: 12px

Font: Inter / Poppins
```

---

## 📏 Spacing System

```css
4px / 8px / 12px / 16px / 24px / 32px
```

👉 Keep everything aligned to this.

---

# 🧩 2. CORE COMPONENTS (Reusable UI Blocks)

---

## 🟢 1. Primary Button

```id="btn1"
[ Book Appointment ]

Style:
- Background: Green
- Text: White
- Padding: 12px 20px
- Radius: 12px
```

---

## 💬 2. WhatsApp Button

```id="btn2"
[ 💬 Book via WhatsApp ]

Style:
- Background: #25D366
- Icon left
- Bold text
```

---

## 📅 3. Slot Button

```id="slot1"
[ 10:30 AM ]

States:
- Default: white + border
- Hover: light green
- Selected: green bg + white text
- Disabled: gray + line-through
```

---

## 📍 4. Status Card (Important)

```id="card1"
--------------------------
📍 Today: Quetta
🕒 10 AM – 5 PM
--------------------------
```

Style:

* White card
* Shadow: soft
* Padding: 16px
* Rounded: 16px

---

## 📆 5. Calendar Card

```id="card2"
[ Month View Calendar ]
```

* Highlight selected date
* Disable unavailable dates
* Green = available

---

# 🏠 3. HOME PAGE (Figma Layout)

---

## 🔷 HERO SECTION

```id="hero1"
--------------------------------------------------
[ LOGO ]                    [ WhatsApp Button ]
--------------------------------------------------

"Allergy Specialist Clinic"

Helping you breathe better with expert care.

📍 Quetta | Sukkur | Ghotki

[ Book Appointment ]  [ Check Schedule ]

--------------------------------------------------
```

👉 Background: subtle gradient (white → light green)

---

## 🟢 AVAILABILITY SECTION (MOST IMPORTANT)

```id="hero2"
------------------------------------------
📍 Today: Quetta Clinic
🕒 10:00 AM – 5:00 PM

📅 Next Visit:
Sukkur – Saturday

[ View Full Schedule ]
------------------------------------------
```

---

## 🧠 SERVICES SECTION

```id="sec1"
------------------------------------------
🧠 Common Allergy Treatments

[ Skin Allergy ]
[ Dust Allergy ]
[ Breathing Issues ]
------------------------------------------
```

Cards:

* Icon
* Title
* Short description

---

## ⭐ TESTIMONIALS

```id="sec2"
------------------------------------------
⭐ "Very effective treatment..."

⭐ "Doctor explained everything clearly"
------------------------------------------
```

---

## 📞 CTA BANNER

```id="cta1"
------------------------------------------
Limited Slots Available

[ Book Now ]  [ WhatsApp ]
------------------------------------------
```

---

# 📅 4. SCHEDULE PAGE (UI)

---

```id="sched1"
------------------------------------------
📅 Doctor Availability

[ Select City ▼ ]

------------------------------------------
[ Calendar UI ]

------------------------------------------
📍 Selected Date: May 10

✔ Available at: Sukkur
🕒 10 AM – 5 PM

[ Show Slots ]
------------------------------------------
```

---

# 📥 5. BOOKING PAGE (HIGH CONVERSION UI)

---

```id="book1"
------------------------------------------
📥 Book Appointment

City:     [ Dropdown ]
Date:     [ Picker ]
Time:     [ Slot buttons ]

------------------------------------------

👤 Your Details

Name:     [ Input ]
Phone:    [ Input ]

------------------------------------------

[ Confirm Booking ]
[ 💬 Book via WhatsApp ]
------------------------------------------
```

---

# 📱 6. MOBILE DESIGN (CRITICAL)

---

## 🟢 MOBILE HOME

```id="mob1"
[ LOGO ]   [ WhatsApp Icon ]

----------------------

Allergy Clinic

📍 Today: Quetta  
📅 Next: Sukkur Sat  

[ Book Now ]

----------------------

Quick Booking

City: [▼]
Date: [📅]

[ WhatsApp Book ]

----------------------
```

---

## 📥 MOBILE BOOKING

```id="mob2"
City ▼  
Date 📅  

Slots:
[ 10:00 ] [ 10:30 ]
[ 11:00 ] [ 11:30 ]

Name  
Phone  

[ Book via WhatsApp ]
```

---

# 🎨 UI STYLE DETAILS

## Cards:

* Rounded: 16px
* Shadow: soft (`shadow-md`)
* Padding: 16–20px

## Buttons:

* Rounded: full or 12px
* Smooth hover animation

## Icons:

Use:

* Lucide Icons (React)

---

# ⚡ MICRO-INTERACTIONS (Make it feel premium)

* Button hover → slight scale
* Slot click → smooth color change
* Loading spinner on booking
* Toast:

  * “Redirecting to WhatsApp…”

---

# 🧠 FINAL UX FLOW

1. User lands
2. Sees “Today: Quetta”
3. Clicks “Book”
4. Selects date + slot
5. Clicks WhatsApp

👉 Done in under 30 seconds

---

# 🚀 What makes this design powerful

* No confusion
* Clear availability
* Fast booking
* WhatsApp-first

👉 This is how you turn a **simple clinic into a digital system**

---

# 💡 If you want next step

I can convert this into:

* ⚛️ React + Tailwind components (ready code)
* 📦 Full page layouts
* 🔗 API integration with your schema
* 🎯 Landing page optimized for ads

Just tell me 👍
