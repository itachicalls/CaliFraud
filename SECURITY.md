# Security Guidelines

## API Keys & Secrets - CRITICAL

**Never commit API keys, tokens, or secrets to version control.**

### Prevention checklist
- [ ] All secrets go in `.env` (or `.env.local`) - **never** in code
- [ ] `.env` is in `.gitignore` (already configured)
- [ ] Use `process.env.VARIABLE_NAME` for all keys - never hardcode
- [ ] For Vercel: set env vars in Project Settings → Environment Variables
- [ ] Before committing: run `git diff` and scan for any `sk-`, `api_key`, passwords
- [ ] Consider [git-secrets](https://github.com/awslabs/git-secrets) or [truffleHog](https://github.com/trufflesecurity/trufflehog) for pre-push scanning

### If a key was leaked
1. **Revoke the key immediately** in the provider dashboard (OpenAI, etc.)
2. Rotate to a new key
3. Update the key in your deployment (Vercel env vars)
4. Check git history - if committed, consider using `git filter-branch` or BFG to remove (and revoke the key)
