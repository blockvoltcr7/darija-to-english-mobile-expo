# Response Shape Decisions

- List responses should be compact and fast to render.
- Detail responses may include full transcript and provider summary data.
- Cross-user detail access returns `404` to avoid leaking whether another user's translation exists.
- Pagination can start simple with `limit` plus a cursor or offset, but the route should cap `limit`.
- The API should not expose raw provider request/response payloads.
