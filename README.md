# NursePulse 🩺 — Smart Hospital Medication & Vitals Alert Dashboard

**MedTech Hackathon Project**  
*A lightweight, intuitive clinical dashboard for hospital nurses to streamline medication administration, eliminate missed doses, track real-time vital signs, and receive automated clinical alerts.*

---

## 📌 Problem Statement
In busy hospital wards, nurses care for multiple patients simultaneously, each with complex medication regimens, varying dosages, and distinct administration schedules. 
- Traditional paper charts and manual documentation often lead to unrecorded doses, uncertainty about whether medications were given on time, or delayed treatments.
- Furthermore, patient vitals must be monitored continuously; delayed recognition of abnormal vital signs (hypoxemia, tachycardia, hypertensive crisis) puts patient safety at risk.

## 💡 The Solution: NursePulse
**NursePulse** is a digital clinical bedside station and centralized ward dashboard that gives nurses complete clarity over their shift:
1. **1-Click "Medicine Given"**: Instant dose administration logging with automatic timestamping and nurse attribution (`Given at 12:15 PM by Nurse Sarah Jenkins, RN`).
2. **Dynamic Schedule Engine**: Automatically computes and highlights medication status in real time:
   - 🔴 **Overdue**: Past scheduled time and unadministered.
   - 🟡 **Due Now**: Within administration window (±30 minutes).
   - 🔵 **Upcoming**: Scheduled for later in the shift.
   - 🟢 **Completed**: Safely administered with full audit trail.
3. **Continuous Vitals Monitoring & Abnormal Value Detection**:
   - Live tracking of **Oxygen Saturation (SpO₂)**, **Heart Rate (HR)**, **Blood Pressure (BP)**, and **Temperature (°F)**.
   - Automatic clinical threshold detection alerting nurses to critical conditions (e.g., Severe Hypoxemia SpO₂ < 90%, Crisis Hypertension, High Fever).
4. **Nurse Shift Handover & Clinical Audit**: One-click printable handover report summarizing bed statuses, pending tasks, and flagged vitals for seamless shift transitions.
5. **Hackathon Presentation Mode**: Interactive demo controller to fast-forward ward time (triggering overdue alerts) and simulate vital drops live for hackathon judges!

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Launch
```bash
# Navigate to project folder
cd "D:\RBMI\MedTech hackathon"

# Start development server
npm run dev
```
Open your browser at: **`http://localhost:5173`**

---

## 🎯 Live Hackathon Presentation Script (3-Minute Demo)

1. **Overview & Ward Triage**:
   - Point out the clean, light-themed hospital interface designed for high legibility under hospital lighting.
   - Show the **Triage Stats Bar** at the top showing *Active Inpatients*, *Overdue Meds*, *Abnormal Vitals*, and *Adherence %*.
2. **1-Click "Medicine Given" Demonstration**:
   - Locate Bed 101 (Jonathan Miller) or Bed 102 (Elena Rostova).
   - Click the prominent **"Medicine Given (1-Click Record)"** button.
   - Notice the instant audio confirmation, celebratory confetti, updated status badge, and logged timestamp!
3. **Clinical Vitals Alert**:
   - Click **"Update vitals"** on any patient (or click a vital pill).
   - Change SpO₂ to `87%`. Notice the immediate red alert warning: *"Severe Hypoxemia: Oxygen required"*.
   - Save readings and watch the **Urgent Alert Banner** trigger with telemetry alert tone.
4. **Hackathon Presentation Controller (Bottom-Right Panel)**:
   - Open the **"Hackathon Demo Controls"** floating widget in the bottom right corner.
   - Click **"+1 Hour (Overdue)"**: Watch the clock advance and witness upcoming medications automatically transition into flashing red **Overdue** alerts!
   - Click **"Bed 102 SpO₂ Drop (87%)"** to showcase immediate multi-patient alert handling.
5. **Shift Handover Report**:
   - Click the **"Shift Handover"** button in the header navigation.
   - Show the print-ready nursing handover sheet, complete with outgoing and incoming nurse signature lines.

---

## 🛠️ Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (light, hospital-grade clean palette)
- **Icons**: Lucide React
- **Audio Engine**: Web Audio API (100% offline, zero external sound asset dependencies)
- **Visual Feedback**: Canvas Confetti
- **State & Storage**: React Context + LocalStorage persistence
