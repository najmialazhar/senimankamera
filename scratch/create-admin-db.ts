import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not configured in .env file.");
  process.exit(1);
}

async function run() {
  const client = new Client({ connectionString });
  
  try {
    console.log("Connecting to PostgreSQL database...");
    await client.connect();
    console.log("Connected successfully!");

    // 1. Create/update the trigger first so it exists with bypass support before we perform updates!
    console.log("Creating/updating database trigger to protect super admin account (with bypass support)...");
    await client.query(`
      CREATE OR REPLACE FUNCTION public.prevent_superadmin_changes()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Bypass protection if session variable is set to 'true'
        IF current_setting('myapp.bypass_trigger', true) = 'true' THEN
          RETURN NEW;
        END IF;

        IF TG_OP = 'DELETE' THEN
          IF OLD.email = 'superadmin.senimankamera@gmail.com' THEN
            RAISE EXCEPTION 'Super admin account cannot be modified or deleted.';
          END IF;
        ELSIF TG_OP = 'UPDATE' THEN
          IF OLD.email = 'superadmin.senimankamera@gmail.com' OR NEW.email = 'superadmin.senimankamera@gmail.com' THEN
            IF OLD.email <> NEW.email OR OLD.encrypted_password <> NEW.encrypted_password THEN
              RAISE EXCEPTION 'Super admin credentials cannot be changed.';
            END IF;
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      DROP TRIGGER IF EXISTS trg_prevent_superadmin_changes ON auth.users;

      CREATE TRIGGER trg_prevent_superadmin_changes
      BEFORE UPDATE OR DELETE ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.prevent_superadmin_changes();
    `);
    console.log("Database trigger set up successfully!");

    // 2. Set local session variable to bypass trigger during execution of this script
    console.log("Enabling trigger bypass for this session...");
    await client.query("SET myapp.bypass_trigger = 'true';");

    // 3. SQL block to create admin account if not exists
    console.log("Setting up admin account (admin.senimankamera488@gmail.com)...");
    await client.query(`
      DO $$
      DECLARE
          admin_id UUID := gen_random_uuid();
          existing_id UUID;
      BEGIN
          SELECT id INTO existing_id FROM auth.users WHERE email = 'admin.senimankamera488@gmail.com';
          
          IF existing_id IS NULL THEN
              INSERT INTO auth.users (
                  id, instance_id, aud, role, email, encrypted_password, 
                  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
                  created_at, updated_at
              ) VALUES (
                  admin_id,
                  '00000000-0000-0000-0000-000000000000',
                  'authenticated',
                  'authenticated',
                  'admin.senimankamera488@gmail.com',
                  crypt('#Kameraseniman*', gen_salt('bf')),
                  now(),
                  '{"provider": "email", "providers": ["email"]}',
                  '{}',
                  now(),
                  now()
              );
              
              INSERT INTO auth.identities (
                  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
              ) VALUES (
                  admin_id,
                  admin_id,
                  json_build_object('sub', admin_id::text, 'email', 'admin.senimankamera488@gmail.com'),
                  'email',
                  admin_id::text,
                  now(),
                  now(),
                  now()
              );
              RAISE NOTICE 'Admin user created successfully.';
          ELSE
              UPDATE auth.users
              SET encrypted_password = crypt('#Kameraseniman*', gen_salt('bf')),
                  email_confirmed_at = now(),
                  updated_at = now()
              WHERE id = existing_id;
              RAISE NOTICE 'Admin user password updated successfully.';
          END IF;
      END $$;
    `);

    // 4. SQL block to create super admin account if not exists
    console.log("Setting up super admin account (superadmin.senimankamera@gmail.com)...");
    await client.query(`
      DO $$
      DECLARE
          super_id UUID := gen_random_uuid();
          existing_id UUID;
      BEGIN
          SELECT id INTO existing_id FROM auth.users WHERE email = 'superadmin.senimankamera@gmail.com';
          
          IF existing_id IS NULL THEN
              INSERT INTO auth.users (
                  id, instance_id, aud, role, email, encrypted_password, 
                  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
                  created_at, updated_at
              ) VALUES (
                  super_id,
                  '00000000-0000-0000-0000-000000000000',
                  'authenticated',
                  'authenticated',
                  'superadmin.senimankamera@gmail.com',
                  crypt('#SuperadminSK4888*', gen_salt('bf')),
                  now(),
                  '{"provider": "email", "providers": ["email"]}',
                  '{}',
                  now(),
                  now()
              );
              
              INSERT INTO auth.identities (
                  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
              ) VALUES (
                  super_id,
                  super_id,
                  json_build_object('sub', super_id::text, 'email', 'superadmin.senimankamera@gmail.com'),
                  'email',
                  super_id::text,
                  now(),
                  now(),
                  now()
              );
              RAISE NOTICE 'Super admin user created successfully.';
          ELSE
              UPDATE auth.users
              SET encrypted_password = crypt('#SuperadminSK4888*', gen_salt('bf')),
                  email_confirmed_at = now(),
                  updated_at = now()
              WHERE id = existing_id;
              RAISE NOTICE 'Super admin user password updated successfully.';
          END IF;
      END $$;
    `);

    console.log("All tasks completed successfully.");

  } catch (error) {
    console.error("An error occurred during execution:", error);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

run();
