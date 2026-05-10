# Compatibility Decisions

- The existing mobile response remains the compatibility contract.
- New response fields such as `jobId` may be added only as optional additive fields.
- Existing aliases stay intact: `transcript` means consolidated Arabic/Darija and `translation` means English.
- Failed requests should preserve current HTTP status behavior while adding durable failure state when a job exists.
