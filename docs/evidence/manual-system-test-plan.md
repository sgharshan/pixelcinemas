# Manual system test plan

| ID | Scenario | Expected result |
|---|---|---|
| AUTH-01 | Register, sign out, sign in | Normalised account works; protected pages redirect while signed out |
| CAT-01 | Search/filter catalogue | Only matching films remain; empty and error states are readable |
| BOOK-01 | Choose screening and seat | Live status appears; selected seat and server price appear in summary |
| BOOK-02 | Open approximate view | Dialog identifies seat and labels metrics as approximate |
| LIVE-01 | Open same screening in two browsers | A hold is disabled in the other browser and releases on disconnect/expiry |
| BOOK-03 | Confirm and revisit history | Unique reference, film, time and seats match on ticket/history |
| ADMIN-01 | Customer visits `/admin` | User is redirected; no admin data renders |
| ADMIN-02 | Admin creates/archives film and schedules/cancels screening | Changes are visible through customer/admin views |
| A11Y-01 | Complete seat selection by keyboard | Focus is visible, unavailable seats are disabled and names contain row/type/state |
| RESP-01 | Repeat at 390px and 1440px | No horizontal page overflow; mobile summary stays actionable |
