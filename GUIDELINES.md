# Angular Code Guidelines — CaiOS

These rules apply to every `.ts`, `.html`, and `.scss` file in `src/`.

---

## 1. `inject()` placement

`inject()` must only appear as a class field initialiser.

```ts
// ✅
private readonly lang = inject(LanguageService);

// ❌
constructor() {
  const lang = inject(LanguageService);
}
```

---

## 2. Injected fields must be `readonly`

Every field initialised with `inject()` must carry the `readonly` modifier.

---

## 3. Injected fields must have an access modifier

- Used only internally → `private readonly`
- Read by the template → `readonly` (public implicit)

Fields without any modifier are forbidden.

---

## 4. No `public` keyword on class members

`public` is the TypeScript default. Writing it is noise.

```ts
// ❌
public readonly lang = inject(LanguageService);
public ngOnInit(): void { }

// ✅
readonly lang = inject(LanguageService);
ngOnInit(): void { }
```

---

## 5. Lifecycle hooks

- Setup that does not depend on resolved `@Input()` values → `constructor`
- Cleanup → `destroyRef.onDestroy()`
- Avoid `ngOnDestroy` — replace with `destroyRef.onDestroy()`
- `ngOnInit` is required only when logic depends on `@Input()` already resolved
- `ngAfterViewInit` is required only when logic depends on `@ViewChild` resolved

---

## 6. Lifecycle interface declarations

Remove `implements OnInit` (and equivalents) if the corresponding hook method does not exist, and vice-versa.

---

## 7. Signals must be `readonly`

All `signal()`, `computed()`, `toSignal()`, `input()`, `output()`, and `model()` fields must be `readonly`.

```ts
// ✅
readonly count = signal(0);

// ❌
count = signal(0);
```

---

## 8. Observable subscriptions

Every manual `.subscribe()` must use `takeUntilDestroyed(this.destroyRef)` in the pipe, or `take(1)` when the observable completes after one emission.

---

## 9. No `any`, no `unknown`

`any` and `unknown` are both forbidden. Use concrete types, generics, or `Partial<T>`.

```ts
// ❌
let mock: any;
component: null as any;
type: 'x' as unknown as HermesActionType;

// ✅
let mock: Partial<DockService>;
component: null as Type<Base>;
type: 'x' as HermesActionType;
```

---

## 10. Method length ≤ 20 lines

Each method must do one thing and fit in roughly 20 lines. Extract private helpers for anything beyond that.

---

## 11. Naming conventions

- No `_` prefix on private fields (modern TypeScript)
- Boolean fields: `is`, `has`, `can`, `should` prefixes
- No single-letter names outside numeric loops (`i`, `j`)
- No ambiguous abbreviations: use `fileSystem` not `fs`, `processManager` not `manager`, `notificationService` not `notfService`
- Binary-search locals: `low`, `high`, `activeIndex` instead of `lo`, `hi`, `idx`
- No single-letter aliases inside methods (e.g. `const a = this.audio`)
- Event handler method names: `onDragStart` not `ondragStart` (camelCase)

---

## 12. No unused imports

Every import must be referenced in the file body. Remove any that are not.

---

## 13. No `console` or `debugger` in production code

`console.*` and `debugger` statements are forbidden outside `.spec.ts` files.

---

## 14. Thin components

Components coordinate template and services — they do not contain business logic.

- File/document loading → service
- Error classification → service
- Path resolution → service
- System info collection → `ScreenService` or dedicated service

A component method with more than 5 lines of logic that does not delegate to a service is a violation.

---

## 15. Accessibility minimums

- Every `<img>` must have an `alt` attribute (empty string `alt=""` is valid for decorative images)
- Every `<button>` without visible text must have `aria-label` or `[attr.aria-label]`

---

## 16. Class declaration order

Strict sequence inside every class:

1. Static fields (`static readonly`)
2. `inject()` fields — `private readonly` first, then `readonly`
3. Signals (`signal`, `computed`, `toSignal`)
4. Inputs / Outputs (`input()`, `output()`, `model()`, `@Input`, `@Output`)
5. `@ViewChild` / `@ViewChildren` / `@ContentChild`
6. Primitive and local-state fields
7. `constructor()` — only `destroyRef.onDestroy()` and `effect()`
8. Lifecycle hooks (`ngOnInit`, `ngAfterViewInit`, `ngOnChanges`)
9. Public methods
10. Private methods

---

## 17. Clean constructor

The constructor must contain **only** `destroyRef.onDestroy()` calls and `effect()` calls. No business logic, no service calls, no conditionals (except those required for `destroyRef`/`effect` setup).

Infrastructure setup (e.g. `ResizeObserver`) must be extracted into a private method and called from the constructor only if it immediately registers a `destroyRef.onDestroy()` cleanup.

---

## 18. Service cohesion (≤ 5 `inject()` per service)

A service with more than 5 injected dependencies is a signal of mixed responsibilities. Split it into focused services.

---

## 19. Field visibility vs template usage

- Field used only inside the class → `private readonly`
- Field read by the template → `readonly` (no `private`)
- Never expose a `private` field to the template
- Never keep a field without `private` if the template does not reference it

---

## 20. Explicit return types on public and protected methods

Every public and protected method must declare its return type explicitly.

```ts
// ❌
aboutApps() { return [...]; }

// ✅
aboutApps(): AboutAppEntry[] { return [...]; }
```

---

## 21. Folder structure

- **Services** must live in `src/app/core/services/` (filename: `kebab-case.ts`)
- **Interfaces and types** must live in `src/app/core/models/` (one model file per domain)

Never place services or model files inside feature folders.

---

## 22. Mandatory test coverage

Every file that contains logic must have a co-located `.spec.ts` file with the same base name.

Files that require a spec:

- Every `@Injectable()` service — including pipes
- Every `@Component()` — including layout and shared UI components
- Every class that contains methods (e.g. `AudioPlayer`, `LyricsService`)

Files that are **exempt** from this rule (they contain no logic):

- `core/models/*.ts` — pure interfaces, types, and enums
- `core/language/en.ts` and `core/language/pt.ts` — plain translation data objects
- `core/services/hermes-docs.ts` — plain string constants
- `*.routes.ts`, `*.config.ts` — Angular bootstrap configuration

Naming: the spec file must be placed next to its source file and named `<source>.spec.ts`.

### Running the test suite

```bash
ng test
```

This is the only valid command for running tests in this project. It uses `@angular/build:unit-test` configured in `angular.json` with the setup file `src/test-setup.ts`. Do not use `vitest`, `jest`, or `npx vitest` directly — they bypass the Angular build pipeline and will fail.

---

## General rules

- No code comments of any kind (inline `//`, block `/* */`, JSDoc `/** */`)
  - Exception: required Angular decorator metadata comments (none in this project)
- No `unknown` casts — use concrete types or `Partial<T>`
- No `any` — use concrete types or generics
- Minimal diffs: change only what the task requires, never refactor surrounding code
- Follow existing code style (2-space indent, single quotes, trailing commas)
