This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Install dependencies and configure the backend URL:

```bash
npm install
```

In PowerShell, create `.env.local` from the example:

```powershell
Copy-Item .env.example .env.local
```

The default API URL is `http://localhost:3001`. Update it if your backend runs
at a different URL, then run the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API client

`lib/api.ts` provides typed `get`, `post`, `patch`, and `delete` helpers.
Non-success responses are normalized to `ApiError`, including NestJS validation
messages. The delete helper handles `204 No Content` without parsing a response
body.

Task response, request, and form schemas with inferred TypeScript types are in
`schemas/task.ts`. Date-picker values are converted to UTC ISO timestamps before
being sent to the API.

Tasks can be created or edited from the task list using the task dialog. The form
validates inputs with Zod, submits through the typed API client, refreshes task
queries on success, and shows success or API error notifications.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

TanStack Query is configured in `app/providers.tsx` and available throughout the
app. Query data is considered fresh for 60 seconds by default; create queries
with `useQuery` and mutations with `useMutation` in client components.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
