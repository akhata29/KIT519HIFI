# Bonorong Wildlife Sanctuary — visitor app prototype

Interactive prototype of the Bonorong Wildlife Sanctuary visitor app, built for
**KIT519 Assignment 2 — Group 24 (University of Tasmania)**.

The Figma file remains the design artefact of record for the assignment. This
repository is the **testing instrument**: a working version of the same design in
which every control actually does something, so usability sessions can measure
real behaviour rather than a click-through.

---

## Live prototype

Once GitHub Pages is switched on (see below) the prototype runs at:

```
https://<your-github-username>.github.io/<repository-name>/
```

Open it on a phone. No account, no app install, no Figma.

---

## What actually works

| Area | Behaviour |
|---|---|
| **Search** | Real text entry. Results filter as you type across animals, facilities and shows. Category chips narrow the list. Results are sorted by distance. Empty state when nothing matches. Recent searches are kept and can be cleared. |
| **Map** | Every animal marker opens that animal's detail screen. Facility markers report their distance. Saved stops are ringed in gold. |
| **Animal detail** | One screen per animal, six animals in total. Working About / Feeding / Conservation tabs, a play/pause audio guide, a language switch, and a save button that really saves. "Take me there" saves the animal and opens the route. |
| **Show list** | Status is calculated, not drawn: *On now*, *Starts in n min*, *Finished*, *Closed today*, *Open all day*. The live talk sorts to the top. Shows can be saved. |
| **My Day** | Real add and remove from anywhere in the app. The counter, total walking distance and estimated time all recalculate. Empty state when nothing is saved. |
| **My Day on map** | Shows only the stops that are actually saved, with the next stop and its walking time. |
| **Accessibility** | The text-size setting genuinely rescales every screen in the app. All four toggles hold state. |
| **Settings** | "Clear My Day" really empties the list. Language and offline map respond. |
| **Q & A** | Questions filter as you type; answers expand and collapse. |
| **Feedback** | Star rating and free text. The form refuses to send when empty and confirms when it does. |
| **Membership / Donation** | Selecting a plan or amount updates the action button. |

Keyboard navigation and visible focus rings work throughout, and interactive
elements carry ARIA labels — so unlike the Figma prototype, this version **can**
be included in an accessibility evaluation.

---

## Notes for facilitators

**Resetting between participants.** All state is held in memory. **Refresh the
page** and the prototype returns to a clean slate — nothing saved, no recent
searches, default text size. Nothing is written to the device.

**The clock is fixed at 10:15 AM.** Show statuses are calculated against a fixed
demo time so every participant sees the same thing regardless of when the session
runs. At 10:15 the participant sees one talk on now, one starting in 45 minutes,
one closed and one running all day. To test other states, change `DEMO_TIME` at
the top of `js/data.js`.

**Photographs are deliberately absent.** Image areas are marked placeholders. No
third-party photography is used anywhere in this prototype.

**Content is fictional.** Animal facts, show times, prices and Q&A answers are
placeholder content written for this assignment. They are not official Bonorong
information, and the sanctuary has no involvement in this project.

---

## Publishing to GitHub Pages

1. Create a new repository on GitHub.
2. Upload these files, keeping the folder structure (`index.html` at the top level,
   with `css/` and `js/` beside it).
3. In the repository, go to **Settings → Pages**.
4. Under **Source**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
5. Wait about a minute, then open the URL GitHub shows you.

No build step, no dependencies, no framework — it is plain HTML, CSS and
JavaScript, so it will keep working without maintenance.

---

## Files

```
index.html        the phone shell, status bar and bottom navigation
css/styles.css    design tokens and every component style
js/data.js        animals, shows, facilities, Q&A, and the demo clock
js/app.js         state, screen rendering and all interaction handling
```

To change content — animal facts, show times, questions — edit `js/data.js`
only. Nothing else needs to be touched.

---

## Credits and academic declaration

Design and content by **Group 24**, KIT519, University of Tasmania.

This prototype was implemented with AI assistance (Claude). The underlying design,
the requirements it traces to, and all evaluation decisions are the group's own
work. AI assistance is declared in the assignment submission in line with the
unit's generative AI policy.

Not affiliated with, endorsed by, or connected to Bonorong Wildlife Sanctuary.
Created for university coursework only.
