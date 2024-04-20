-- WEBHOOKS SEED
-- PLEASE NOTE: These webhooks are only for development purposes. Leave them as they are or add new ones.

-- These webhooks are only for development purposes.
-- In production, you should manually create webhooks in the Supabase dashboard (or create a migration to do so).
-- We don't do it because you'll need to manually add your webhook URL and secret key.

-- this webhook will be triggered after deleting an account
create trigger "accounts_teardown" after delete
on "public"."accounts" for each row
execute function "supabase_functions"."http_request"(
  'http://host.docker.internal:3000/api/db/webhook',
  'POST',
  '{"Content-Type":"application/json", "X-Supabase-Event-Signature":"WEBHOOKSECRET"}',
  '{}',
  '5000'
);

-- this webhook will be triggered after a delete on the subscriptions table
-- which should happen when a user deletes their account (and all their subscriptions)
create trigger "subscriptions_delete" after delete
on "public"."subscriptions" for each row
execute function "supabase_functions"."http_request"(
  'http://host.docker.internal:3000/api/db/webhook',
  'POST',
  '{"Content-Type":"application/json", "X-Supabase-Event-Signature":"WEBHOOKSECRET"}',
  '{}',
  '5000'
);

-- this webhook will be triggered after every insert on the invitations table
-- which should happen when a user invites someone to their account
create trigger "invitations_insert" after insert
on "public"."invitations" for each row
execute function "supabase_functions"."http_request"(
  'http://host.docker.internal:3000/api/db/webhook',
  'POST',
  '{"Content-Type":"application/json", "X-Supabase-Event-Signature":"WEBHOOKSECRET"}',
  '{}',
  '5000'
);


-- DATA SEED
-- This is a data dump for testing purposes. It should be used to seed the database with data for testing.

SET session_replication_role = replica;

pg_dump: warning: there are circular foreign-key constraints on this table:
pg_dump: detail: key
pg_dump: hint: You might not be able to restore the dump without using --disable-triggers or temporarily dropping the constraints.
pg_dump: hint: Consider using a full dump instead of a --data-only dump to avoid this problem.
--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1 (Ubuntu 15.1-1.pgdg20.04+1)
-- Dumped by pg_dump version 15.5 (Ubuntu 15.5-1.pgdg20.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
        ('00000000-0000-0000-0000-000000000000', '45d9f5dc-ae78-45aa-8dcf-7777639eafb3', '{"action":"user_confirmation_requested","actor_id":"31a03e74-1639-45b6-bfa7-77447f1a4762","actor_username":"test@makerkit.dev","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-04-20 08:20:34.463864+00', ''),
        ('00000000-0000-0000-0000-000000000000', 'a15ab66b-f291-427b-9f15-5364840b7cfb', '{"action":"user_signedup","actor_id":"31a03e74-1639-45b6-bfa7-77447f1a4762","actor_username":"test@makerkit.dev","actor_via_sso":false,"log_type":"team"}', '2024-04-20 08:20:38.163624+00', ''),
        ('00000000-0000-0000-0000-000000000000', 'c625f494-d041-44a9-8487-88f71cec3ca2', '{"action":"login","actor_id":"31a03e74-1639-45b6-bfa7-77447f1a4762","actor_username":"test@makerkit.dev","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"email"}}', '2024-04-20 08:20:39.086702+00', ''),
        ('00000000-0000-0000-0000-000000000000', 'c579eedc-4089-4752-b5da-869d62b63c94', '{"action":"user_confirmation_requested","actor_id":"5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf","actor_username":"owner@makerkit.dev","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-04-20 08:36:27.638468+00', ''),
        ('00000000-0000-0000-0000-000000000000', '9f0349fd-fd4a-4a78-926d-3045c086055d', '{"action":"user_signedup","actor_id":"5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf","actor_username":"owner@makerkit.dev","actor_via_sso":false,"log_type":"team"}', '2024-04-20 08:36:37.517553+00', ''),
        ('00000000-0000-0000-0000-000000000000', '0a7673c0-8a4c-4984-a1f2-2b02d829fc85', '{"action":"login","actor_id":"5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf","actor_username":"owner@makerkit.dev","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"email"}}', '2024-04-20 08:36:37.613295+00', ''),
        ('00000000-0000-0000-0000-000000000000', '4f1b635c-f00b-46a4-80de-1edb48250f8b', '{"action":"logout","actor_id":"5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf","actor_username":"owner@makerkit.dev","actor_via_sso":false,"log_type":"account"}', '2024-04-20 08:36:50.193801+00', ''),
        ('00000000-0000-0000-0000-000000000000', 'f0ec2dd0-b870-4822-a606-4208b7e17add', '{"action":"logout","actor_id":"31a03e74-1639-45b6-bfa7-77447f1a4762","actor_username":"test@makerkit.dev","actor_via_sso":false,"log_type":"account"}', '2024-04-20 08:37:13.584462+00', ''),
        ('00000000-0000-0000-0000-000000000000', '9b0174f5-c278-4e28-ba16-d3a845345abb', '{"action":"user_confirmation_requested","actor_id":"b73eb03e-fb7a-424d-84ff-18e2791ce0b4","actor_username":"custom@makerkit.dev","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-04-20 08:37:43.343197+00', ''),
        ('00000000-0000-0000-0000-000000000000', '26275d69-7031-45e3-a0b4-9d48dbeab82a', '{"action":"user_signedup","actor_id":"b73eb03e-fb7a-424d-84ff-18e2791ce0b4","actor_username":"custom@makerkit.dev","actor_via_sso":false,"log_type":"team"}', '2024-04-20 08:38:00.859507+00', ''),
        ('00000000-0000-0000-0000-000000000000', '498c38bf-318b-4653-b26b-d4e6daaca4f1', '{"action":"login","actor_id":"b73eb03e-fb7a-424d-84ff-18e2791ce0b4","actor_username":"custom@makerkit.dev","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"email"}}', '2024-04-20 08:38:00.937756+00', ''),
        ('00000000-0000-0000-0000-000000000000', 'f53e4bd9-87d3-42f7-8b83-5fa9a9b914fe', '{"action":"login","actor_id":"31a03e74-1639-45b6-bfa7-77447f1a4762","actor_username":"test@makerkit.dev","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-04-20 08:40:08.032833+00', ''),
        ('00000000-0000-0000-0000-000000000000', '24e13912-f40c-457c-a380-ee079b904df8', '{"action":"user_confirmation_requested","actor_id":"6b83d656-e4ab-48e3-a062-c0c54a427368","actor_username":"member@makerkit.dev","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-04-20 08:41:08.68908+00', ''),
        ('00000000-0000-0000-0000-000000000000', '4341c565-778d-4ea1-8ccc-1b99674c1c40', '{"action":"user_signedup","actor_id":"6b83d656-e4ab-48e3-a062-c0c54a427368","actor_username":"member@makerkit.dev","actor_via_sso":false,"log_type":"team"}', '2024-04-20 08:41:15.376428+00', ''),
        ('00000000-0000-0000-0000-000000000000', 'bb38e0c7-4cb1-4eea-8a06-5ee4b34b261a', '{"action":"login","actor_id":"6b83d656-e4ab-48e3-a062-c0c54a427368","actor_username":"member@makerkit.dev","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"email"}}', '2024-04-20 08:41:15.484323+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
        ('00000000-0000-0000-0000-000000000000', 'b73eb03e-fb7a-424d-84ff-18e2791ce0b4', 'authenticated', 'authenticated', 'custom@makerkit.dev', '$2a$10$b3ZPpU6TU3or30QzrXnZDuATPAx2pPq3JW.sNaneVY3aafMSuR4yi', '2024-04-20 08:38:00.860548+00', NULL, '', '2024-04-20 08:37:43.343769+00', '', NULL, '', '', NULL, '2024-04-20 08:38:00.93864+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "b73eb03e-fb7a-424d-84ff-18e2791ce0b4", "email": "custom@makerkit.dev", "email_verified": false, "phone_verified": false}', NULL, '2024-04-20 08:37:43.3385+00', '2024-04-20 08:38:00.942809+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
        ('00000000-0000-0000-0000-000000000000', '31a03e74-1639-45b6-bfa7-77447f1a4762', 'authenticated', 'authenticated', 'test@makerkit.dev', '$2a$10$uC911UKLmGbkp2Di7K2UfO9QYUQFz5et.gPpjhxWEob1jeXkLrNZu', '2024-04-20 08:20:38.165331+00', NULL, '', '2024-04-20 08:20:34.464746+00', '', NULL, '', '', NULL, '2024-04-20 08:40:08.033665+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "31a03e74-1639-45b6-bfa7-77447f1a4762", "email": "test@makerkit.dev", "email_verified": false, "phone_verified": false}', NULL, '2024-04-20 08:20:34.459113+00', '2024-04-20 08:40:08.035046+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
        ('00000000-0000-0000-0000-000000000000', '5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf', 'authenticated', 'authenticated', 'owner@makerkit.dev', '$2a$10$D6arGxWJShy8q4RTW18z7eW0vEm2hOxEUovUCj5f3NblyHfamm5/a', '2024-04-20 08:36:37.517993+00', NULL, '', '2024-04-20 08:36:27.639648+00', '', NULL, '', '', NULL, '2024-04-20 08:36:37.614337+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf", "email": "owner@makerkit.dev", "email_verified": false, "phone_verified": false}', NULL, '2024-04-20 08:36:27.630379+00', '2024-04-20 08:36:37.617955+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
        ('00000000-0000-0000-0000-000000000000', '6b83d656-e4ab-48e3-a062-c0c54a427368', 'authenticated', 'authenticated', 'member@makerkit.dev', '$2a$10$6h/x.AX.6zzphTfDXIJMzuYx13hIYEi/Iods9FXH19J2VxhsLycfa', '2024-04-20 08:41:15.376778+00', NULL, '', '2024-04-20 08:41:08.689674+00', '', NULL, '', '', NULL, '2024-04-20 08:41:15.484606+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "6b83d656-e4ab-48e3-a062-c0c54a427368", "email": "member@makerkit.dev", "email_verified": false, "phone_verified": false}', NULL, '2024-04-20 08:41:08.683395+00', '2024-04-20 08:41:15.485494+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
        ('31a03e74-1639-45b6-bfa7-77447f1a4762', '31a03e74-1639-45b6-bfa7-77447f1a4762', '{"sub": "31a03e74-1639-45b6-bfa7-77447f1a4762", "email": "test@makerkit.dev", "email_verified": false, "phone_verified": false}', 'email', '2024-04-20 08:20:34.46275+00', '2024-04-20 08:20:34.462773+00', '2024-04-20 08:20:34.462773+00', '9bb58bad-24a4-41a8-9742-1b5b4e2d8abd'),
        ('5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf', '5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf', '{"sub": "5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf", "email": "owner@makerkit.dev", "email_verified": false, "phone_verified": false}', 'email', '2024-04-20 08:36:27.637388+00', '2024-04-20 08:36:27.637409+00', '2024-04-20 08:36:27.637409+00', '090598a1-ebba-4879-bbe3-38d517d5066f'),
        ('b73eb03e-fb7a-424d-84ff-18e2791ce0b4', 'b73eb03e-fb7a-424d-84ff-18e2791ce0b4', '{"sub": "b73eb03e-fb7a-424d-84ff-18e2791ce0b4", "email": "custom@makerkit.dev", "email_verified": false, "phone_verified": false}', 'email', '2024-04-20 08:37:43.342194+00', '2024-04-20 08:37:43.342218+00', '2024-04-20 08:37:43.342218+00', '4392e228-a6d8-4295-a7d6-baed50c33e7c'),
        ('6b83d656-e4ab-48e3-a062-c0c54a427368', '6b83d656-e4ab-48e3-a062-c0c54a427368', '{"sub": "6b83d656-e4ab-48e3-a062-c0c54a427368", "email": "member@makerkit.dev", "email_verified": false, "phone_verified": false}', 'email', '2024-04-20 08:41:08.687948+00', '2024-04-20 08:41:08.687982+00', '2024-04-20 08:41:08.687982+00', 'd122aca5-4f29-43f0-b1b1-940b000638db');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
        ('6110bfeb-31e9-4c70-9c54-d723abd52048', 'b73eb03e-fb7a-424d-84ff-18e2791ce0b4', '2024-04-20 08:38:00.938815+00', '2024-04-20 08:38:00.938815+00', NULL, 'aal1', NULL, NULL, 'node', '192.168.228.1', NULL),
        ('d5086cc6-9897-47e0-874b-7f8f11649560', '31a03e74-1639-45b6-bfa7-77447f1a4762', '2024-04-20 08:40:08.033701+00', '2024-04-20 08:40:08.033701+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', '192.168.228.1', NULL),
        ('469be37b-b21f-46aa-b30b-52f828b1baad', '6b83d656-e4ab-48e3-a062-c0c54a427368', '2024-04-20 08:41:15.484635+00', '2024-04-20 08:41:15.484635+00', NULL, 'aal1', NULL, NULL, 'node', '192.168.228.1', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
        ('6110bfeb-31e9-4c70-9c54-d723abd52048', '2024-04-20 08:38:00.943514+00', '2024-04-20 08:38:00.943514+00', 'email/signup', '42337df0-b3d0-42f5-bff5-3740ccad191b'),
        ('d5086cc6-9897-47e0-874b-7f8f11649560', '2024-04-20 08:40:08.035464+00', '2024-04-20 08:40:08.035464+00', 'password', 'e0d54b55-9813-44b5-b502-06b081c3a44b'),
        ('469be37b-b21f-46aa-b30b-52f828b1baad', '2024-04-20 08:41:15.485666+00', '2024-04-20 08:41:15.485666+00', 'email/signup', '55704b9a-6a31-48e6-ae2b-662f6b7ce302');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
        ('00000000-0000-0000-0000-000000000000', 3, 'lRWBgOYDQHq2GfqAc5iPpw', 'b73eb03e-fb7a-424d-84ff-18e2791ce0b4', false, '2024-04-20 08:38:00.940523+00', '2024-04-20 08:38:00.940523+00', NULL, '6110bfeb-31e9-4c70-9c54-d723abd52048'),
        ('00000000-0000-0000-0000-000000000000', 4, 'XuRjZ1Ipdh8Eb19lPRUJhw', '31a03e74-1639-45b6-bfa7-77447f1a4762', false, '2024-04-20 08:40:08.03433+00', '2024-04-20 08:40:08.03433+00', NULL, 'd5086cc6-9897-47e0-874b-7f8f11649560'),
        ('00000000-0000-0000-0000-000000000000', 5, 'iQ0e1JiLv3R29gkHZYZggw', '6b83d656-e4ab-48e3-a062-c0c54a427368', false, '2024-04-20 08:41:15.484992+00', '2024-04-20 08:41:15.484992+00', NULL, '469be37b-b21f-46aa-b30b-52f828b1baad');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: supabase_admin
--



--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."accounts" ("id", "primary_owner_user_id", "name", "slug", "email", "is_personal_account", "updated_at", "created_at", "created_by", "updated_by", "picture_url", "public_data") VALUES
        ('31a03e74-1639-45b6-bfa7-77447f1a4762', '31a03e74-1639-45b6-bfa7-77447f1a4762', 'test', NULL, 'test@makerkit.dev', true, NULL, NULL, NULL, NULL, NULL, '{}'),
        ('5deaa894-2094-4da3-b4fd-1fada0809d1c', '31a03e74-1639-45b6-bfa7-77447f1a4762', 'Makerkit', 'makerkit', NULL, false, NULL, NULL, NULL, NULL, NULL, '{}'),
        ('5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf', '5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf', 'owner', NULL, 'owner@makerkit.dev', true, NULL, NULL, NULL, NULL, NULL, '{}'),
        ('b73eb03e-fb7a-424d-84ff-18e2791ce0b4', 'b73eb03e-fb7a-424d-84ff-18e2791ce0b4', 'custom', NULL, 'custom@makerkit.dev', true, NULL, NULL, NULL, NULL, NULL, '{}'),
        ('6b83d656-e4ab-48e3-a062-c0c54a427368', '6b83d656-e4ab-48e3-a062-c0c54a427368', 'member', NULL, 'member@makerkit.dev', true, NULL, NULL, NULL, NULL, NULL, '{}');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."roles" ("name", "hierarchy_level", "account_id") VALUES
        ('owner', 1, NULL),
        ('member', 2, NULL),
        ('custom-role', 4, '5deaa894-2094-4da3-b4fd-1fada0809d1c');


--
-- Data for Name: accounts_memberships; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."accounts_memberships" ("user_id", "account_id", "account_role", "created_at", "updated_at", "created_by", "updated_by") VALUES
        ('31a03e74-1639-45b6-bfa7-77447f1a4762', '5deaa894-2094-4da3-b4fd-1fada0809d1c', 'owner', '2024-04-20 08:21:16.802867+00', '2024-04-20 08:21:16.802867+00', NULL, NULL),
        ('5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf', '5deaa894-2094-4da3-b4fd-1fada0809d1c', 'owner', '2024-04-20 08:36:44.21028+00', '2024-04-20 08:36:44.21028+00', NULL, NULL),
        ('b73eb03e-fb7a-424d-84ff-18e2791ce0b4', '5deaa894-2094-4da3-b4fd-1fada0809d1c', 'custom-role', '2024-04-20 08:38:02.50993+00', '2024-04-20 08:38:02.50993+00', NULL, NULL),
        ('6b83d656-e4ab-48e3-a062-c0c54a427368', '5deaa894-2094-4da3-b4fd-1fada0809d1c', 'member', '2024-04-20 08:41:17.833709+00', '2024-04-20 08:41:17.833709+00', NULL, NULL);


--
-- Data for Name: billing_customers; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: config; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."config" ("enable_team_accounts", "enable_account_billing", "enable_team_account_billing", "billing_provider") VALUES
        (true, true, true, 'stripe');


--
-- Data for Name: invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."role_permissions" ("id", "role", "permission") VALUES
        (1, 'owner', 'roles.manage'),
        (2, 'owner', 'billing.manage'),
        (3, 'owner', 'settings.manage'),
        (4, 'owner', 'members.manage'),
        (5, 'owner', 'invites.manage'),
        (6, 'member', 'settings.manage'),
        (7, 'member', 'invites.manage');


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: subscription_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id") VALUES
        ('account_image', 'account_image', NULL, '2024-04-20 08:18:41.364926+00', '2024-04-20 08:18:41.364926+00', true, false, NULL, NULL, NULL);


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

INSERT INTO "supabase_functions"."hooks" ("id", "hook_table_id", "hook_name", "created_at", "request_id") VALUES
        (1, 17811, 'invitations_insert', '2024-04-20 08:22:15.403223+00', 1),
        (2, 17811, 'invitations_insert', '2024-04-20 08:22:15.403223+00', 2),
        (3, 17811, 'invitations_insert', '2024-04-20 08:22:15.403223+00', 3),
        (4, 17811, 'invitations_insert', '2024-04-20 08:25:04.593848+00', 4),
        (5, 17811, 'invitations_insert', '2024-04-20 08:25:04.593848+00', 5),
        (6, 17811, 'invitations_insert', '2024-04-20 08:25:04.593848+00', 6),
        (7, 17811, 'invitations_insert', '2024-04-20 08:26:43.163367+00', 7),
        (8, 17811, 'invitations_insert', '2024-04-20 08:26:43.163367+00', 8),
        (9, 17811, 'invitations_insert', '2024-04-20 08:26:43.163367+00', 9),
        (10, 17811, 'invitations_insert', '2024-04-20 08:28:46.753609+00', 10),
        (11, 17811, 'invitations_insert', '2024-04-20 08:28:46.753609+00', 11),
        (12, 17811, 'invitations_insert', '2024-04-20 08:28:46.753609+00', 12),
        (13, 17811, 'invitations_insert', '2024-04-20 08:30:12.356719+00', 13),
        (14, 17811, 'invitations_insert', '2024-04-20 08:33:11.210097+00', 14),
        (15, 17811, 'invitations_insert', '2024-04-20 08:33:52.113026+00', 15),
        (16, 17811, 'invitations_insert', '2024-04-20 08:35:21.557382+00', 16),
        (17, 17811, 'invitations_insert', '2024-04-20 08:35:21.557382+00', 17),
        (18, 17811, 'invitations_insert', '2024-04-20 08:35:21.557382+00', 18),
        (19, 17811, 'invitations_insert', '2024-04-20 08:40:20.99569+00', 19);


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 5, true);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- Name: billing_customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."billing_customers_id_seq"', 1, false);


--
-- Name: invitations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."invitations_id_seq"', 19, true);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."role_permissions_id_seq"', 7, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 19, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
