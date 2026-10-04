---
name: GitHub synchronization
description: Authentication and history constraints for future GitHub updates.
---

The connected GitHub account can have working repository write access even when command-line Git authentication fails. Do not assume a CLI authentication error means the integration needs reconnecting.

**Why:** The authenticated GitHub API successfully uploaded the cleaned project after a normal Git push failed with invalid credentials.

**How to apply:** Verify the connected API's access before requesting credential changes. Do not read or expose credentials to work around CLI authentication.

The GitHub repository was initialized from a cleaned current-file snapshot through the Git Data API, while local Replit history was retained. The two histories are independent.

**Why:** This allowed the requested upload without replacing local history or uploading earlier generated-image variants.

**How to apply:** Read the remote branch and parent commit before subsequent updates. Preserve its history, compare uploaded file trees, and never force-push the independent local history over it without explicit approval.