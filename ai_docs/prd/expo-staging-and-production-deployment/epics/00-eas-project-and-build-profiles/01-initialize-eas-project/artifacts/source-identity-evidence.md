# Source Identity Evidence

## Inspection Command

```bash
node -e "const app=require('./app.json').expo; console.log(JSON.stringify({name: app.name, slug: app.slug, version: app.version, scheme: app.scheme, extra: app.extra || null, ios: app.ios, android: app.android}, null, 2))"
```

## Sanitized Result

```json
{
  "name": "Darija to English",
  "slug": "darija-to-english-mobile",
  "version": "1.0.0",
  "scheme": "darijaenglish",
  "extra": null,
  "ios": {
    "bundleIdentifier": "com.samisabiridrissi.darijatoenglish",
    "appleTeamId": "57JWLP426D",
    "supportsTablet": true
  },
  "android": {
    "package": "com.samisabiridrissi.darijatoenglish",
    "predictiveBackGestureEnabled": false
  }
}
```

## EAS CLI Version

```text
eas-cli/18.12.3 darwin-arm64 node-v22.17.1
```
