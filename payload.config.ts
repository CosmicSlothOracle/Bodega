/**
 * Payload v3 config skeleton — mounts at /admin in the same Next.js app.
 *
 * Status: not actively wired in this commit. To activate:
 *   1. Add deps:
 *        npm i payload @payloadcms/next @payloadcms/db-postgres @payloadcms/richtext-lexical
 *   2. Set DATABASE_URL to your Supabase Postgres connection string.
 *   3. Drop in the Next.js wiring: src/app/(payload)/admin/[...segments]/page.tsx
 *      (see https://payloadcms.com/docs/getting-started/installation)
 *   4. Generate types & run migrations:
 *        npx payload migrate
 *
 * Until then, /admin is served by the placeholder route at
 * src/app/admin/page.tsx, which surfaces these instructions to operators.
 */

// @ts-nocheck — Payload deps intentionally not installed yet.
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

export default buildConfig({
  admin: {
    user: "users",
    meta: {
      titleSuffix: "· Bloom OS",
      icons: [{ rel: "icon", url: "/favicon.ico" }],
    },
  },
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL ?? "",
    },
  }),
  collections: [
    {
      slug: "users",
      auth: true,
      admin: { useAsTitle: "email" },
      fields: [
        { name: "displayName", type: "text" },
        {
          name: "role",
          type: "select",
          options: ["owner", "manager", "staff", "marketing"],
          required: true,
        },
      ],
    },
    {
      slug: "events",
      admin: { useAsTitle: "title" },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "slug", type: "text", required: true, unique: true },
        { name: "date", type: "date", required: true },
        { name: "startTime", type: "text" },
        { name: "heroImage", type: "upload", relationTo: "media" },
        { name: "description", type: "richText" },
        { name: "capacity", type: "number" },
        { name: "ticketPrice", type: "number" },
        { name: "dj", type: "text" },
        { name: "published", type: "checkbox", defaultValue: false },
      ],
    },
    {
      slug: "menu-sections",
      admin: { useAsTitle: "title" },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "slug", type: "text", required: true, unique: true },
        { name: "intro", type: "textarea" },
        { name: "position", type: "number", defaultValue: 0 },
      ],
    },
    {
      slug: "menu-items",
      admin: { useAsTitle: "name" },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "section", type: "relationship", relationTo: "menu-sections", required: true },
        { name: "description", type: "textarea" },
        { name: "price", type: "number", required: true },
        { name: "allergens", type: "text", hasMany: true },
        { name: "isVegan", type: "checkbox", defaultValue: false },
        { name: "isVegetarian", type: "checkbox", defaultValue: false },
        { name: "isSpicy", type: "checkbox", defaultValue: false },
        { name: "image", type: "upload", relationTo: "media" },
        { name: "available", type: "checkbox", defaultValue: true },
        { name: "position", type: "number", defaultValue: 0 },
      ],
    },
    {
      slug: "media",
      upload: {
        adminThumbnail: "thumbnail",
        focalPoint: true,
        imageSizes: [
          { name: "thumbnail", width: 320, height: 240, position: "centre" },
          { name: "card", width: 800, height: 600, position: "centre" },
          { name: "hero", width: 1920, position: "centre" },
        ],
        mimeTypes: ["image/*"],
      },
      fields: [{ name: "alt", type: "text", required: true }],
    },
    {
      slug: "pages",
      admin: { useAsTitle: "title" },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "slug", type: "text", required: true, unique: true },
        { name: "blocks", type: "blocks", blocks: [
          {
            slug: "richText",
            fields: [{ name: "content", type: "richText" }],
          },
          {
            slug: "imagePair",
            fields: [
              { name: "image", type: "upload", relationTo: "media" },
              { name: "caption", type: "text" },
            ],
          },
        ] },
        { name: "published", type: "checkbox", defaultValue: true },
      ],
    },
    {
      slug: "hero-slides",
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "alt", type: "text", required: true },
        { name: "position", type: "number", defaultValue: 0 },
        { name: "active", type: "checkbox", defaultValue: true },
      ],
    },
  ],
});
