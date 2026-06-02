# Encryption Tablet And OTA Checklist

## Encryption Decision

| Question | Answer |
| --- | --- |
| Does the app use only HTTPS/TLS and standard platform/library crypto? |  |
| Does the app add custom cryptography, VPN, secure messaging, DRM, or regulated encryption features? |  |
| Do third-party SDKs or native dependencies change the encryption answer? |  |
| Is `ios.infoPlist.ITSAppUsesNonExemptEncryption=false` still accurate? |  |
| Who approved the export-compliance conclusion? |  |

## Tablet Decision

| Question | Answer |
| --- | --- |
| Is `ios.supportsTablet=true` intentional for public release? |  |
| If yes, which iPad simulator/device/screenshots must Epic 04 and Epic 05 verify? |  |
| If no, who approved disabling tablet support and which binary/config change task owns it? |  |

## EAS Update Policy

Allowed through production OTA only when compatible with the reviewed binary/runtime:

- JavaScript-only bug fixes.
- Copy fixes that do not change legal/privacy meaning.
- UI polish inside the reviewed feature set.

Requires binary/App Review decision:

- New native dependency or config plugin.
- New iOS permission or changed permission usage.
- New data collection category.
- New auth provider or account lifecycle behavior.
- Material AI pipeline behavior change.
- Runtime version change.

## Future Update Evidence Fields

| Field | Value |
| --- | --- |
| Channel |  |
| Runtime version |  |
| Commit SHA |  |
| EAS update ID |  |
| Rollback command or decision |  |
| Owner approval |  |
| Reason this did not require a new binary |  |

## Artifact Naming

Preferred artifact name:

```text
artifacts/encryption-tablet-ota-decision.md
```
