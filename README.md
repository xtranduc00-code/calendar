# React Calendar

Calendar is a bare-bones calendar built with React and Tailwindcss. It does not include event creation and display, as that's left up to your discretion.

### [Live Demo](https://calendar.vercel.app/)

### So what does it do? ✨

- Displays 12 months at once, with respect to the specified year.
- Allows for quick-navigation to specific months and Today.
- Clicking on a cell triggers the onClick event with (day, month, year).
- Responsive; supports mobile, tablet, and desktop views.

### Installation 💻

There is no npm package, it's just 1 file you can customize. Simply download or copy the file:

`/components/ContinuousCalendar.tsx`.

Additionally, I have applied the following global css:

```
*:focus:not(ol) {
  @apply outline-none ring-2 ring-cyan-400 border-cyan-400;
}

select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  text-indent: 1px;
  text-overflow: '';
}

@layer utilities {
  /* Hide scrollbar for Chrome, Safari and Opera */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  .no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
}
```

### Props ❄️

| Prop    | Required | Type                                                 | Description                                               |
| ------- | -------- | ---------------------------------------------------- | --------------------------------------------------------- |
| onClick | Optional | `(day:number, month: number, year: number) => void;` | Triggered whenever the user clicks a day on the calendar. |

### Height and Width 🎨

The height and width of the calendar component rely on a parent wrapper. Please refer to `components/DemoWrapper.tsx` as an example of how to structure your React component to achieve your desired calendar size.

### Push notifications (Supabase) 🔔

The app stores push subscriptions in Supabase. Create table and policies:

**Table `push_subscriptions`:**

```sql
create table public.push_subscriptions (
  endpoint text primary key,
  subscription text not null
);
```

**RLS:** enable RLS, then allow anonymous insert and select so the app and cron can work:

```sql
alter table public.push_subscriptions enable row level security;

create policy "Allow anon insert"
  on public.push_subscriptions for insert to anon
  with check (true);

create policy "Allow anon select"
  on public.push_subscriptions for select to anon
  using (true);

create policy "Allow anon delete"
  on public.push_subscriptions for delete to anon
  using (true);
```

If you see "No subscriptions" when testing: open the app from the **Home Screen icon** (not Safari), allow notifications, reload — then try "Test notification" again.

### Contribution 🔮

If you wish to contribute to this project, clone the repo and run it locally using `npm run dev`.

## Screenshots

![App Screenshot](https://i.postimg.cc/7qtz4srV/Screenshot-2024-08-19-at-10-28-57-PM.png)

![App Screenshot](https://i.postimg.cc/Q843fyB2/Screenshot-2024-08-19-at-10-36-31-PM.png)

![App Screenshot](https://github.com/user-attachments/assets/859cd344-8e53-4061-982d-63aff1da121b)

## Inspiration

![App Screenshot](https://i.postimg.cc/qk1gyQGF/Screenshot-2024-08-19-at-10-45-56-PM.png)
