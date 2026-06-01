# Risk Assessment

## High Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Apple rejects for missing account deletion | Public release blocked. | Add first-class in-app deletion flow and verify with test user before submission. |
| Apple rejects for third-party AI disclosure | Public release blocked under privacy/data sharing rules. | Add explicit consent before first audio submission and name data categories/providers in privacy policy. |
| Production jobs stay queued or fail | Reviewers cannot complete app functionality. | Deploy production Trigger worker and run smoke tests before submission; provide reviewer note about expected processing time. |
| Privacy labels do not match behavior | App Review delay or removal risk. | Use a data inventory and check every collected category in App Store Connect before submission. |
| Auth configuration triggers Sign in with Apple issue | Review delay or rejection if social login is offered without equivalent Apple option. | Inventory production Clerk sign-in methods and record a Sign in with Apple decision before submission. |
| OTA update changes reviewed behavior | Review or compliance risk. | Define EAS Update policy and require binary review for native, privacy, auth, or material AI behavior changes. |

## Medium Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Debug UI makes app look unfinished | Guideline 2.1/4.2 review risk. | Hide diagnostics/model internals in production builds. |
| Provider costs spike after launch | Financial risk and service degradation. | Add usage reservations, rate limits, quotas, and kill switch. |
| Storage deletion is incomplete | Privacy/legal risk. | Implement storage-object deletion and deletion timestamp verification. |
| Reviewer lacks valid login/audio path | Review delay. | Provide demo account and clear reviewer instructions. |
| Cloud Run request size limits affect larger audio | User-facing failures. | Enforce client/server max size and document supported audio length before submission. |
| Generic microphone permission copy | Permission prompt may look vague to users/reviewers. | Use product-specific purpose copy and verify on clean install. |
| Provider deletion overpromised | Legal/privacy mismatch if third-party processors retain service logs. | Policy must distinguish app-owned deletion from provider retention. |

## Low Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| App icon/metadata needs polish | Lower conversion or metadata rejection. | Review icon/screenshots/description before submission. |
| iPad layout issues | Review polish risk because `supportsTablet=true`. | Test iPad layout or disable tablet support only if acceptable. |
| Privacy manifest drift | Build/review warning risk. | Validate iOS privacy manifest with Expo Doctor and App Store Connect upload warnings. |
