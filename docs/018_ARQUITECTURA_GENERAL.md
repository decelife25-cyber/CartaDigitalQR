Complete the document:

docs/018_ARQUITECTURA_GENERAL.md

Write the entire document in Spanish.

Do not write code.

Do not modify the application.

Only create technical documentation.

====================================================
TITLE
====================================================

018 - ARQUITECTURA GENERAL

====================================================
OBJECTIVE
====================================================

Describe the official architecture of CartaDigitalQR.

This document becomes the official architectural specification of the project.

====================================================
PROJECT ARCHITECTURE
====================================================

CartaDigitalQR is NOT a single application.

It consists of TWO completely different applications sharing the same Supabase database.

====================================================
APPLICATION 1
====================================================

PUBLIC DIGITAL MENU

Technology:

React
Vite
Tailwind
PWA

Characteristics:

- Accessed by scanning a QR code.
- No installation required.
- Works on Android.
- Works on iPhone.
- Works on tablets.
- Works on desktop browsers.
- Read-only.
- Never modifies the database.
- Shows only public information.

====================================================
APPLICATION 2
====================================================

PRIVATE ADMINISTRATION

Technology:

Android Native

Jetpack Compose

Characteristics:

- Installed as an Android application.
- Only restaurant staff can use it.
- Authentication required.
- Can be installed on multiple Android phones simultaneously.
- All devices share the same Supabase database.
- Any modification made from one device is immediately visible on every other device and on the public PWA.

====================================================
DATABASE
====================================================

Both applications use exactly the same Supabase database.

Supabase is the single source of truth.

Never duplicate information.

Never use local databases as the main storage.

====================================================
SYNCHRONIZATION
====================================================

Changes made in the Android application must appear automatically in the public PWA.

No manual synchronization.

No exports.

No imports.

====================================================
SECURITY
====================================================

The public PWA can only read public information.

The Android application performs all Create, Update and Delete operations.

Authentication is mandatory for the Android application.

====================================================
MULTI DEVICE
====================================================

The same administrator account may work on several Android devices.

All devices remain synchronized through Supabase.

====================================================
OFFLINE
====================================================

The Android application may temporarily cache data to improve performance.

However, Supabase always remains the official source of data.

====================================================
FUTURE
====================================================

The architecture must allow future expansion without changing the overall design.

Possible future modules include:

- Reservations
- Orders
- Kitchen Display
- Waiter mode
- Statistics
- Multiple restaurants
- Artificial Intelligence

====================================================
ACCEPTANCE CRITERIA
====================================================

The document must clearly explain the complete architecture.

Any developer reading this document must understand the project without needing further explanations.

Do not generate code.

Only generate documentation.

Create the Pull Request when finished.