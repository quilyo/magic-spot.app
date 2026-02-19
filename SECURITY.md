# Security Model

This document explains the security architecture of the Magic Spot parking application, focusing on Row Level Security (RLS) policies and API access control.

## Overview

The application uses Supabase's Row Level Security (RLS) to protect data at the database level. This ensures that even if someone obtains your API keys, they cannot access or modify data beyond what the policies allow.

## Database Security Architecture

### Two-Table Design

The application uses a two-table architecture to separate public and private data:

#### 1. `parking_status` Table (Protected - Backend Only)
- **Purpose**: Stores raw JSON parking data from your backend system
- **Access Level**: Authenticated users only (requires service role key or authenticated session)
- **RLS Policies**:
  - ✅ **SELECT**: Authenticated users only
  - ✅ **INSERT**: Authenticated users only
  - ✅ **UPDATE**: Authenticated users only
  - ✅ **DELETE**: Authenticated users only
  - ❌ **Public Access**: Denied

**Why?** This table contains raw backend data that should not be exposed to public users. Only your backend service should be able to write to this table.

#### 2. `parking_spots` Table (Public Read, Protected Write)
- **Purpose**: Stores normalized, processed parking data for the frontend map
- **Access Level**: Public read, authenticated write
- **RLS Policies**:
  - ✅ **SELECT**: Anyone (public access for viewing the map)
  - ✅ **UPDATE**: Authenticated users only (admin features)
  - ❌ **INSERT/DELETE**: Not directly used (data syncs from parking_status)

**Why?** The public needs to view parking availability on the map, but only authenticated admins should be able to modify spot information.

### Database Triggers with SECURITY DEFINER

Three database functions use `SECURITY DEFINER` to operate with elevated privileges:

1. **`expand_parking_status_to_spots()`**: Syncs data from parking_status to parking_spots
2. **`sync_parking_spots_on_update()`**: Trigger function that runs automatically
3. **`sync_parking_spots_manual()`**: Manual sync function for troubleshooting

**Why SECURITY DEFINER?**
- These functions need to read from `parking_status` (protected table) and write to `parking_spots`
- Triggers run with the context of the triggering action, not as a privileged user
- SECURITY DEFINER allows the function to execute with the privileges of the function owner (typically the database owner), bypassing RLS
- This is safe because the logic is defined in the database and cannot be modified by API calls

## API Keys and Authentication

### Types of Supabase Keys

1. **Anon/Public Key** (`SUPABASE_ANON_KEY`)
   - ✅ Safe to use in client-side code (browser, mobile apps)
   - ✅ Respects Row Level Security policies
   - ✅ Can read from `parking_spots` (public data)
   - ❌ Cannot read from `parking_status` (protected by RLS)
   - ❌ Cannot write to any table without authentication

2. **Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`)
   - ❌ **NEVER** use in client-side code
   - ❌ **NEVER** commit to version control
   - ✅ Use only in backend servers/scripts
   - ✅ Bypasses all RLS policies (full database access)
   - ✅ Required for backend to write to `parking_status`

### Example Usage

#### Frontend (Client-Side) - Use Anon Key
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key-here'  // ✅ Safe to use in browser
);

// ✅ This works - public can read parking_spots
const { data } = await supabase
  .from('parking_spots')
  .select('*');

// ❌ This fails - RLS blocks public access to parking_status
const { data } = await supabase
  .from('parking_status')
  .select('*');  // Error: insufficient permissions
```

#### Backend (Server-Side) - Use Service Role Key
```python
import os
from supabase import create_client

# ✅ Load from environment variables
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')  # ✅ Only in server code
)

# ✅ This works - service role bypasses RLS
supabase.table('parking_status').insert({
    'areas': parking_data,
    'timestamp': datetime.utcnow().isoformat()
}).execute()
```

## Security Best Practices

### 1. Environment Variables
Always use environment variables for sensitive data:

```bash
# .env (never commit this file)
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

```python
# Python example
from dotenv import load_dotenv
import os

load_dotenv()
service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
```

### 2. Key Rotation
If your service role key is ever exposed:

1. Go to Supabase Dashboard → Settings → API
2. Click "Regenerate" for the Service Role Key
3. Update the key in all your backend services
4. Revoke or rotate any other potentially compromised credentials

### 3. Separate Development and Production
- Use different Supabase projects for development and production
- Never use production keys in development
- Test RLS policies thoroughly in development before deploying

### 4. Monitor Access
- Regularly review Supabase logs for suspicious activity
- Set up monitoring alerts for unusual API usage patterns
- Enable rate limiting in Supabase to prevent abuse

### 5. Principle of Least Privilege
- Frontend uses anon key (limited permissions)
- Backend uses service role key (full permissions)
- Regular users should be authenticated for admin features
- Consider creating custom database roles with specific permissions for different services

## Threat Model

### Protected Against ✅

1. **Unauthorized data modification**: Public users cannot modify parking data
2. **Raw data exposure**: Public users cannot access backend's raw JSON data in `parking_status`
3. **Client-side key leakage**: Anon key can be safely exposed in client code
4. **API key abuse**: RLS policies limit what can be done even with valid keys

### Still Requires Attention ⚠️

1. **Service role key protection**: Keep this key secret at all costs
2. **Authentication for admin features**: Implement user authentication for update operations
3. **Rate limiting**: Configure Supabase to prevent API abuse
4. **SQL injection**: Supabase client libraries handle this, but be careful with raw SQL
5. **DDoS protection**: Use Supabase's built-in protections and consider additional layers

## Testing RLS Policies

You can test RLS policies in the Supabase SQL Editor:

```sql
-- Test as anonymous user
SET ROLE anon;

-- This should succeed (public can read parking_spots)
SELECT * FROM parking_spots LIMIT 1;

-- This should fail (public cannot read parking_status)
SELECT * FROM parking_status LIMIT 1;  -- Expected: permission denied

-- Reset to default role
RESET ROLE;
```

## Additional Resources

- [Supabase Row Level Security Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)

## Questions?

If you have questions about the security model or need to implement additional security features, consult the Supabase documentation or open an issue in the repository.
