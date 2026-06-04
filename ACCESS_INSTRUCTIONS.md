# Access Instructions, COMP710 Personal Portfolio

**Student:** Bardia Khalifeh  
**Student ID:** 23196422  
**Course:** COMP710 Game Programming, AUT  
**Assignment:** Personal Portfolio  

---

## Portfolio URL

**https://amgkompressor.github.io/portfolio/**

(This is the live website. The GitHub repo at https://github.com/AMGKompressor/portfolio shows source files only, not the portfolio site.)

---

## How to access

1. Open the URL above in **Chrome**, **Firefox**, or **Safari**.
2. No login is required.
3. JavaScript is recommended for scroll animations; **all content is readable without JavaScript** via anchor navigation.

---

## Recommended reading order for markers

| Step | Section | What to review |
|------|---------|----------------|
| 1 | **Home** | Overview, skills, featured Boxu card |
| 2 | **Boxu** | Individual game (v0.5 alpha): screenshots, controls, feature cards with reflection |
| 3 | **Tech Demos** | Isolated proofs: shaders, collision, and audio |
| 4 | **Projects** | Timeline, GHL download, debug diary |
| 5 | **Team Game Project** | cardBoardEngine group deliverable, Mac + Windows builds, BFS + minimap |
| 6 | **Contact** | Email, GitHub links, APA references |

---

## Downloads on the site

- **GHL Log:** Projects section → "GHL Log" button → `assets/docs/GHL–23196422.txt`
- **GDD / TDD:** Projects section → `assets/docs/GDD-23196422.pdf` and `assets/docs/TDD-23196422.pdf`
- **Boxu (macOS):** Boxu section → expand **macOS build & run instructions**, or clone https://github.com/AMGKompressor/Boxu (no pre-built binary; macOS only)
- **Pitch PDF:** Projects section (when uploaded)
- **Source code:** Top banner or Contact → GitHub: https://github.com/AMGKompressor/Boxu

---

## Build / run Boxu on macOS (optional)

macOS only. Expand **macOS build & run instructions** on the Boxu page, or use:

```bash
brew install cmake sdl2 sdl2_image glew pkg-config
git clone https://github.com/AMGKompressor/Boxu.git
cd Boxu/source
cmake -S . -B ../temp/build-boxu -DCMAKE_BUILD_TYPE=Release
cmake --build ../temp/build-boxu --config Release
cd ../game && ../temp/build-boxu/gpframework
```

Run from `Boxu/game/` so textures and shaders resolve correctly.

---

## Browser note

Best viewed at 1280×720 or wider. Mobile layout supported with collapsible navigation.

---

*Attach the Individual Assignment Cover Sheet to the front of this document before zipping as `Portfolio - 23196422.zip` for Canvas submission.*
