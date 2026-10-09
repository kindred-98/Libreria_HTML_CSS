# Fase 0 aplicada — ajustes de GitHub y Vercel

**Fecha:** 2026-10-02 · **Plan de referencia:**
[`PLAN-MEJORAS-OPENCODE.md`](../PLAN-MEJORAS-OPENCODE.md), §Fase 0 ·
**Alcance:** SOLO Ángel, no es para OpenCode · **Commits de código:** ninguno

La Fase 0 es la única de las ocho que no toca ni un fichero del repositorio: se
resuelve entera en la interfaz de GitHub y de Vercel, y lo único que se versiona es
esta constancia. Es además la que decide de verdad si alguien puede meter código en
`main` sin permiso, así que se ha hecho antes que nada.

---

## 1. Qué se hizo

| # | Punto del plan | Qué quedó configurado | Estado |
|---|---|---|---|
| 1 | 2FA en GitHub y Vercel | GitHub con app autenticadora + recovery codes; Vercel con 2FA | ✅ |
| 2 | Ruleset sobre `main` | Regla `Protege main`, activa, 4 reglas + CODEOWNERS | ✅ |
| 3 | Code security | Push protection, Dependabot alerts, reporte privado | ✅ |
| 4 | Actions → General | Token solo lectura, aprobación de forks y colaboradores nuevos | ✅ |
| 5 | Collaborators | 0 colaboradores, 0 invitaciones pendientes | ✅ |
| 6 | Vercel → Environment Variables | 0 variables definidas | ✅ |
| 7 | Revisar `Docs/` | 3 correos fuera de 4 informes (commit `024cb58`) | ✅ |

### 1.1 Ruleset `Protege main`

| Campo | Valor |
|---|---|
| Enforcement status | **Active** |
| Bypass list | **vacía** — nadie se salta las reglas, ni el dueño |
| Target branches | **`main`** (1 destino) |

Reglas activas, las cuatro que pide el plan más CODEOWNERS:

| Regla | Para qué sirve |
|---|---|
| **Require a pull request before merging** | ningún commit entra en `main` directamente |
| ↳ *Require review from Code Owners* | la revisión la tiene que dar un CODEOWNERS (`* @kindred-98`) |
| **Require status checks to pass** → `Validar sitio` | el CI tiene que pasar antes de poder mergear |
| **Block force pushes** | no se puede reescribir la rama |
| **Restrict deletions** | no se puede borrar `main` |

**Required approving reviews: 0.** Ver la decisión en §2.1; no es un olvido.

El botón **Restrict updates** está **desactivado a propósito**: hacer merge *es*
actualizar `main`, y con la lista de bypass vacía habría dejado de poder fusionar
cualquiera.

### 1.2 Code security and analysis

- **Push protection: On** — bloquea commits con secretos soportados. En repos
  públicos secret scanning lo corre GitHub siempre, sin interruptor que activar.
- **Dependabot alerts: On**, con **security updates** y **grouped security updates**.
- **Dependency graph: On.**
- **Private vulnerability reporting: Enable.** Era lo que faltaba y es la condición
  del **STOP de la fase 1.5**: con esto ya se puede quitar el correo de `SECURITY.md`.

### 1.3 Actions → General

- Se permiten todas las acciones, con **pinning por SHA** en las del propio proyecto.
- **Require approval for all outside collaborators** (PRs de forks y de
  colaboradores nuevos necesitan aprobación para correr workflows).
- **Workflow permissions: Read repository contents and packages permissions** por
  defecto.
- *Allow GitHub Actions to create and approve pull requests*: **apagado**.

### 1.4 Collaborators

`Settings → Access → Collaborators` quedó en:

```
2 entities have access to this repository. 1 collaborator. 1 invitation.   ← antes
1 collaborator. 0 invitations.                                            → ahora
```

- **@fatmaerm** — eliminado. El informe lo citaba con commits en
  `refs/remotes/origin/fatmaerm/main`, o sea que sí tuvo escritura; con el ruleset
  ya activo, si vuelve a necesitarla se reinvita y **aun con `Write` no podrá tocar
  `main` sin PR + CI**.
- **@davoker** (Eugenio David Domínguez Sánchez) — **invitación pendiente
  cancelada**. Estaba colgada sin aceptar; se reenvía en 10 segundos si hace falta.

No se pierde nada: **los commits de ambos siguen en la historia**, esta fase no
reescribe git.

### 1.5 Vercel → Environment Variables

```
No Environment Variables Added
```

Lista vacía, así que no hay nada que borrar y **los previews de forks no reciben
secretos** porque no existen. El código solo lee `PORT` y `VERCEL`, y ambas las pone
la propia plataforma; `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` ya está en `vercel.json`.

Dato aprovechado de paso, en `Settings → Environments`:

```
Preview  →  All unassigned git branches
```

Cualquier push a una rama que no sea `main` genera despliegue de preview, que es lo
que permite verificar la fase 1.1 sin tocar producción.

### 1.6 Revisar `Docs/`

`Docs/` es público en GitHub aunque Vercel no lo despliegue. Los tres correos
personales que la auditoría enumeraba estaban citados en cuatro informes:

| Fichero | Ocurrencias |
|---|---|
| `Docs/02-auditorias/Auditoria-2026-09-30.md` | borradas |
| `Docs/02-auditorias/Auditoria.md` | borradas |
| `Docs/01-planes/Plan_de_fases.md` | borradas |
| `Docs/02-auditorias/Fases-de-Auditoria-Aplicadas/Fase1-Aplicada.md` | borradas |

Commit **`024cb58`**. `SECURITY.md:22` **no se tocó**: le corresponde a la fase 1.5.

---

## 2. Decisiones y lo que no se activó

### 2.1 Por qué `Required approving reviews: 0`

El plan pide «exigir revisión de CODEOWNERS», y esa casilla sí está marcada. Pero
**`CODEOWNERS` tiene una sola entrada, `* @kindred-98`**, que es el propio autor de
los PRs, y **GitHub no cuenta la aprobación del autor**. Con `1`:

> abrirías un PR y **no podrías mergearlo nunca tú solo**, y acabamos de quitar a
> los otros colaboradores, así que no habría nadie que lo aprobara.

Con `0`, la revisión de CODEOWNERS queda sin efecto pero **todo lo demás sí corta**:
no hay colaboradores con acceso, `main` exige PR, el CI tiene que pasar y no hay
force-push. **Cuando entre una segunda persona** se sube a `1` y ya cobra sentido:
son dos clics.

### 2.2 Reglas del ruleset que quedaron desactivadas

Ninguna se pide en el plan, y varias estorbarían:

- **Restrict updates** — rompería el merge, que *es* actualizar `main`.
- **Restrict creations**, **Require signed commits**, **Require linear history**,
  **Require deployments to succeed**, **Require code scanning results**,
  **Require code quality results**, **Restrict code coverage**.
- **Require an additional approval for unattributed Copilot pull requests** —
  extra, **sí** activada: solo aplica a PRs redactados por Copilot sin atribución y
  no molesta a nadie.

### 2.3 Fuera de esta fase

- **Los correos siguen en el historial de git.** Sacarlos exige `git filter-repo`
  y es una decisión del mantenedor: fase 9 del plan.
- **`SECURITY.md:22`** sigue publicando la dirección, pendiente de la **fase 1.5**
  (STOP ya desbloqueado por el reporte privado de vulnerabilidades).

---

## 3. Verificación

Al ser configuración de interfaz, la comprobación es lo que se vio en pantalla:

```text
GitHub  → Settings → Rules → Rulesets
  Protege main · Active · Bypass list is empty · 4 branch rules targeting 1 branch

GitHub  → Settings → Code security and analysis
  Secret scanning / Push protection: Enabled
  Dependabot alerts: On   ·   Private vulnerability reporting: Enabled

GitHub  → Settings → Actions → General
  Workflow permissions: Read repository contents and packages permissions

GitHub  → Settings → Access
  1 collaborator. 0 invitations.

Vercel  → Settings → Environment Variables
  No Environment Variables Added
```

Comprobaciones de que el repositorio sigue sano tras la fase:

```text
npm run validar
  info  1018 componentes · 1018 descargables · 0 sin redistribucion
  Todo correcto: 1018 componentes coherentes con el disco.
  demos aisladas con sandbox: 1018 de 1018
  ok: el CSP cubre todos los recursos externos que usan los demos, y no sobra nada

npm run validar:layout
  info  5 paginas x 23 anchos = 115 medidas, tolerancia 1px
  Ninguna pagina se sale de lado en 23 anchos.
```

---

## 4. Estado después de la fase

| Punto del plan | Estado |
|---|---|
| 2FA GitHub + Vercel | **cerrado** |
| Ruleset sobre `main` | **cerrado** (aprobaciones en 0, §2.1) |
| Secret scanning + Push protection | **cerrado** |
| Dependabot alerts | **cerrado** |
| Private vulnerability reporting | **cerrado** → desbloquea fase 1.5 |
| Actions: token solo lectura + aprobación de forks | **cerrado** |
| Collaborators sin escritura sobrante | **cerrado** |
| Vercel Environment Variables limpias | **cerrado** |
| `Docs/` sin correos personales | **cerrado** (`024cb58`) |
| `SECURITY.md:22` | abierto → **fase 1.5** |
| Historial de git con los correos | abierto → **fase 9** (requiere decisión) |

---

## 5. Siguiente: Fase 1

La 1.1 ya está aplicada en esta misma sesión, en la rama `Update`, commit
**`d5c73a1`**: cuatro políticas de `sandbox` en `vercel.json` que aíslan las 1018
rutas de demo sin `allow-same-origin`, más los controles nuevos en
`Web/scripts/validar-csp.mjs` y el CSP por ruta de `Web/scripts/serve.mjs`. Queda
pendiente **una sola cosa de esa fase**: la verificación `curl` obligatoria contra
el despliegue de preview, que espera la URL del deployment.

Lo que sigue, por orden:

1. **Fase 1.2** — test de la dirección de donación en `Web/scripts/validate.mjs`.
2. **Fase 1.3** — `npm audit --audit-level=high` en `.github/workflows/validate.yml`.
3. **Fase 1.4** — `.github/workflows/codeql.yml`, con las acciones fijadas por SHA.
4. **Fase 1.5** — `SECURITY.md` sin correo personal. **STOP desbloqueado.**
