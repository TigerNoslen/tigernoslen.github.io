# Tiger Nation HQ Website

## Project Vision

Create the official website for Tiger Noslen Gaming.

The website should feel like entering Tiger Nation rather than simply visiting a list of links.

---

# Current Status

## Verified Update — September 15, 2026

This update records verified progress beyond the original phase outline
below. That outline is retained for historical planning context.

### Implemented and Verified

- Google sign-in through Supabase is deployed on the public website.
- Google OAuth publishing status is In production.
- Accounts outside the former test-user list can sign in successfully.
- Desktop and mobile sign-in and sign-out passed testing.
- Signed-in and signed-out states persist correctly after refresh.
- Mobile account controls display correctly.
- The mobile header remains visible during section navigation.
- The mobile hamburger menu passed testing.
- The privacy policy is published at /privacy.html and linked from
  the homepage footer and Google Auth Platform Branding settings.
- Privacy questions and account-deletion requests are directed to
  tiger.noslen@gmail.com.
- Signed-in users display their Google profile picture and Tiger Nation display name in the website header.
- A fallback avatar remains available if the Google profile picture cannot be loaded.
- The desktop header account controls support:
  OFFLINE | YouTube | Profile Picture | User Name | My Profile | Sign out.
- Deleted-account session cleanup on page load is implemented and verified.
- Deleted-account cleanup without manually reloading the website is implemented and verified.
- Automatic session cleanup after the one-hour expiry test is verified.
- Valid-account sign-in, refresh persistence, sign-out, and profile functionality passed regression testing.
- The public website now supports Holiday stream cancellations with a dedicated
  Holiday reason label and cancellation graphic.
- Custom Other cancellation reasons published from the Control Centre are
  displayed on the public website using the entered custom text.
- Cancellation cards correctly display when multiple schedule exceptions
  coexist, including when an earlier special stream and a later cancellation
  are both active.

### Account-Deletion and Session Verification

On September 13, 2026, the owner deleted the selected test account
through Supabase Authentication → Users.

After refreshing the user list:

- The selected test account was absent.
- The other three accounts remained.

This verified removal of the authentication account record.
It did not establish deletion of every possible related data record,
provider backup, or log.

Follow-up session testing verified:

- Supabase deleted-user responses are handled for both user_not_found and
  the 403 "User from sub claim in JWT does not exist" response.
- The website verifies stored authenticated users with Supabase.
- Returning to an already-open website tab after the authenticated account
  is deleted clears the invalid local session without requiring a manual page refresh.
- The signed-in display is removed and Sign in with Google is restored.
- A signed-in test session left unattended for approximately one hour was
  automatically cleared and returned to the signed-out state.
- Valid-account sign-in, refresh persistence, and sign-out continue to work.

### Member Profiles — Implemented and Verified

The public website includes a private Tiger Nation member-profile system
built on Supabase.

Current profile data includes:

- Tiger Nation display name
- Epic Games display name
- About Me bio
- Google avatar URL
- Created timestamp
- Updated timestamp

The current profile experience includes:

- My Profile access from the signed-in website header.
- Google profile picture or initials fallback.
- Editable Tiger Nation display name.
- Optional Epic Games display name.
- Optional About Me bio of up to 300 characters.
- Read-only Member badge.
- Join month and year derived from the profile created_at timestamp.
- Save Profile remains disabled until an editable field changes.
- Blank Tiger Nation display names cannot be saved.
- Optional Epic Games display name and About Me fields may be cleared.
- Pressing Enter saves a valid changed Display Name or Epic Games Display Name.
- The About Me field retains normal multiline Enter behaviour.
- Saved profile information persists after refresh.
- The saved Tiger Nation display name takes priority over the Google account name in the website header.
- Successful display-name changes update the signed-in header immediately.
- Closing My Profile restores focus to the My Profile button.
- Profile status messages are cleared when reopening, closing, or editing the profile.

Supabase profile security includes:

- public.profiles is linked to auth.users by authenticated user ID.
- Row Level Security is enabled.
- Authenticated users may read, insert, and update only their own profile.
- Anonymous users do not receive direct profile-table access.
- New authentication users automatically receive a profile row.
- Existing authentication users were backfilled when the profile system was introduced.
- Row Level Security testing confirmed that a signed-in user cannot retrieve another member's profile through the public website.

The Member badge is currently a presentation label only.

It does not represent an administrator role, moderator role, subscription status,
member-only permission, or access-control level.

### OAuth Redirect Behaviour

During local Live Server testing, Google sign-in redirected back to the deployed
GitHub Pages website rather than the local 127.0.0.1 page.

Signed-in header testing was therefore completed on the deployed public website.

### Resolved Browser Issue

Norton AntiTrack was isolated as the cause of failed sign-in in the
owner's regular browser. The owner permanently disabled the extension.
Sign-in then worked.

### Still Planned

- Expanded member profiles and access levels.
- YouTube membership recognition and member privileges.
- Member-only content or permissions.
- Moderator and administrator roles.
- Account management through the Control Centre.
- Additional deletion checks as user-related data storage expands.- Additional deletion checks as user-related data storage expands.

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