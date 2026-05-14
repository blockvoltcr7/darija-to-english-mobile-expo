# API Diagnostics Test Matrix

| Build Context | `EXPO_PUBLIC_API_BASE_URL` | Expected UI |
| --- | --- | --- |
| iOS simulator local dev | `http://localhost:8787` | `Local API` label plus local target warning. |
| Android emulator local dev | `http://10.0.2.2:8787` | `Local API` label plus local target warning. |
| Physical-device LAN dev | `http://<mac-lan-ip>:8787` | `Staging API` label because it is non-local to the device; confirm manually that the LAN host is reachable. |
| EAS development client | `https://darija-api-staging-nwjxqrn2ra-uc.a.run.app` | `Staging API` label and no local target warning. |
| EAS preview/staging | `https://darija-api-staging-nwjxqrn2ra-uc.a.run.app` | `Staging API` label and no local target warning. |
| Misconfigured URL | malformed value | Parseability warning. |
