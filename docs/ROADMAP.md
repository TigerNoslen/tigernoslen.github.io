# Tiger Nation HQ Website

## Project Vision

Create the official website for Tiger Noslen Gaming.

The website should feel like entering Tiger Nation rather than simply visiting a list of links.

---

# Current Status

## Verified Update — September 13, 2026

This update records verified progress beyond the original phase outline
below. That outline is retained for historical planning context.

### Implemented and Verified

- Google sign-in through Supabase is deployed on the public website.
- Google OAuth publishing status is In production.
- Sign-in succeeded with an account outside the former test-user list.
- Desktop and mobile sign-in and sign-out passed testing.
- Signed-in and signed-out states persist correctly after refresh.
- Mobile account controls display correctly.
- The mobile header remains visible during section navigation.
- The mobile hamburger menu passed testing.
- The privacy policy is published at /privacy.html and linked from
  the homepage footer and Google Auth Platform Branding settings.
- Privacy questions and account-deletion requests are directed to
  tiger.noslen@gmail.com.

### Account-Deletion Verification

On September 13, 2026, the owner deleted the selected test account
through Supabase Authentication → Users.

After refreshing the user list:
- The selected test account was absent.
- The other three accounts remained.

This verifies removal of the authentication account record.
It does not establish deletion of every possible related data record,
provider backup, or log.

Existing-session behavior after deletion remains untested because
no website tab was signed in with the deleted account.

### Resolved Browser Issue

Norton AntiTrack was isolated as the cause of failed sign-in in the
owner's regular browser. The owner permanently disabled the extension.
Sign-in then worked.

### Still Planned or Unverified

- Existing-session behavior after account deletion.
- Member profiles, roles, permissions, and member-only features.
- Account management through the Control Centre.
- Additional deletion checks as user-related data storage expands.

## Development Workflow — 12+ Hour Rule

After a break of 12 hours or more, review all related project documents
before proceeding with new actions.

Review the website and Control Centre documentation where relevant,
reconcile it with the current implementation and prior verified results,
and identify outdated or conflicting information.

Keep Implemented, Verified, Planned, and Untested states distinct.

---

## Phase 0 - Foundation ✅ COMPLETE

- GitHub Pages configured
- GitHub Desktop configured
- VS Code configured
- Professional folder structure created

---

## Phase 1 - Design (Current)

Goals

- Homepage layout
- Colour palette
- Typography
- Navigation
- Mobile design
- Desktop design
- Animation style

---

## Phase 2 - Core Website

- Navigation
- Hero section
- Footer
- Responsive layout
- Reusable components

---

## Phase 3 - Content

- About Tiger Nation
- Weekly stream schedule
- Social links
- Creator Code
- QR landing page

---

## Phase 4 - Advanced Features

- Live status
- Latest YouTube video
- UEFN map showcase
- Giveaway section
- Community features

---

## Design Goals

- Premium
- Modern
- Gaming
- Fast
- Mobile First
- Family Friendly

---

## Colour Palette

Background

#0E0E0E

Panels

#1B1B1B

Primary Orange

#FF7A00

Hover Orange

#FF9C33

White

#FFFFFF

Secondary Text

#B5B5B5

---

Current Version

v0.0.1