// Seed pages for a fresh browser session.
// Code licence: MIT. Content licence: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).

export const NEW_STARTER_ARTICLES = [
  'James Webb Space Telescope',
  'Artemis Program',
  'Renewable Energy Transition',
  'Electric Vehicles',
  'Large Language Models',
  'Quantum Computing',
  '2024 Summer Olympics',
  'Exoplanet Exploration',
  'Voyager Interstellar Mission',
  'Global Chip Manufacturing'
];

export const SEED_PAGES = {
  'Main Page': `== Welcome to pocket-wiki ==
'''pocket-wiki''' is a standalone personal wiki engine inspired by MediaWiki that runs entirely inside your web browser. There is no server, no account creation, and no cloud database: every page, revision, and edit summary is stored in your browser's local storage.

=== Core Highlights ===
* '''Your Pages Stay in This Browser:''' Your notes and knowledge stay on your device under your complete control.
* '''Wikitext Authoring:''' Familiar wiki syntax including headings, bold, italic, internal wikilinks, and lists.
* '''Full Revision History:''' Track changes over time with per-save edit summaries and past revision viewing.
* '''Export and Import:''' Export your entire wiki into a single JSON file via [[Special:Export]], or restore a backup file using [[Special:Import]].
* '''Zero Dependencies:''' Built with plain HTML, CSS, and modern JavaScript ES modules without external frameworks or CDNs.

=== Explore Example Pages ===
To discover how pocket-wiki works, explore these starter articles:
* [[Wikitext Guide]] — Examples of formatting, headings, links, and lists.
* [[Your Pages Stay in This Browser]] — Privacy, offline persistence, and browser data storage.
* [[Architecture]] — How the hash router, storage module, and renderer function together.
* [[Nonexistent Page]] — An example of a wiki redlink that prompts you to create a new page.

=== Popular Articles ===
Read 10 starter articles on space, science, and technology:
* [[James Webb Space Telescope]] — Infrared astronomy in deep space.
* [[Artemis Program]] — Human missions returning to the Moon.
* [[Renewable Energy Transition]] — Clean electricity from sun and wind.
* [[Electric Vehicles]] — Battery-powered transport.
* [[Large Language Models]] — Computers that write and understand language.
* [[Quantum Computing]] — Computers that calculate with quantum physics.
* [[2024 Summer Olympics]] — The summer games held across Paris.
* [[Exoplanet Exploration]] — Discovering worlds around other stars.
* [[Voyager Interstellar Mission]] — Space probes travelling beyond the Sun.
* [[Global Chip Manufacturing]] — Making computer chips from silicon.

=== Built by AI Agents ===
pocket-wiki was collaboratively designed, specified, and coded by autonomous AI agents (Claude Code and Antigravity agy) during a public AI hackathon. Learn more at [https://github.com/ai-hackathon-only/pocket-wiki the GitHub repository].`,

  'Wikitext Guide': `== Wikitext Guide ==
pocket-wiki supports an essential subset of MediaWiki wikitext.

=== Text Formatting ===
* Two apostrophes format text in ''italics'': \`''italics''\`
* Three apostrophes format text in '''bold''': \`'''bold'''\`
* Five apostrophes format text in '''''bold italics''''': \`'''''bold italics'''''\`

=== Headings ===
Headings are declared with surrounding equals signs:
* Level 2: \`== Section ==\`
* Level 3: \`=== Subsection ===\`
* Level 4: \`==== Sub-subsection ====\`

=== Links ===
* '''Internal link:''' \`[[Main Page]]\` renders as [[Main Page]].
* '''Piped internal link:''' \`[[Main Page|Home]]\` renders as [[Main Page|Home]].
* '''Redlinks:''' Links to uncreated pages such as [[Nonexistent Page]] turn red and open the editor.
* '''External links:''' \`[https://example.org Example]\` renders as [https://example.org Example]. Bare URLs also work: https://example.org

=== Lists ===
Unordered bullet lists start with an asterisk:
* First item
* Second item
** Indented sub-item

Ordered numbered lists start with a number sign:
# Step one
# Step two
## Sub-step

=== Paragraphs ===
Blank lines separate paragraphs. All raw HTML tags like \`<script>\` or \`<div>\` are automatically escaped for safety.

=== Tables ===
Create structured tables using standard wikitext table markup:
{| class="wikitable"
|+ Wikitext Feature Overview
|-
! Syntax !! Result
|-
| \`{{Name}}\` || Transcludes another page or template
|-
| \`{| ... |}\` || Renders a formatted data table
|}

=== Templates ===
Transclude another page or template into your article using \`{{Name}}\`:
* \`{{Note}}\` looks for [[Template:Note]] first, or page [[Note]].
* Template loops are automatically prevented.
Here is an inclusion of [[Template:Note]]:
{{Template:Note}}`,

  'Your Pages Stay in This Browser': `== Your Pages Stay in This Browser ==
pocket-wiki stores all page revisions directly inside your browser's \`localStorage\`.

=== Key Principles ===
* '''No Server:''' There is no backend server receiving or tracking your notes.
* '''Offline Availability:''' The application runs locally once loaded, even without an active internet connection.
* '''Export Often:''' Because data lives in browser storage, clearing website cookies or site data removes your pages. Use [[Special:Export]] regularly to save JSON backups to your computer.
* '''Single-File Portability:''' You can import any saved JSON export back into any browser using [[Special:Import]].`,

  'Architecture': `== Architecture ==
pocket-wiki is designed around small, single-purpose ES modules following clean web standards:

=== Core Modules ===
* '''\`js/app.js\`''': Application bootstrap and top-level lifecycle coordinator.
* '''\`js/storage.js\`''': Storage adapter encapsulating \`localStorage\` access, revision trees, and JSON serialization.
* '''\`js/renderer.js\`''': Safe wikitext parser and HTML sanitizer.
* '''\`js/router.js\`''': Client-side hash router supporting clean routes:
** \`#/wiki/:title\` — Read view
** \`#/edit/:title\` — Page editor
** \`#/history/:title\` — Revision history
** \`#/diff/:title/:oldId...:newId\` — Line diff between two revisions
** \`#/rev/:title/:id\` — Old revision view
** \`#/special/:name\` — Modular special pages
* '''\`js/special.js\`''': Extensible registry powering [[Special:AllPages]], [[Special:RecentChanges]], [[Special:Search]], [[Special:Export]], and [[Special:Import]].`,

  'Template:Note': `{| class="wikitable"
! Template Notice
|-
| This note is transcluded from [[Template:Note]]. You can edit this template to update everywhere it is included.
|}`,

  'James Webb Space Telescope': `== James Webb Space Telescope ==
The '''James Webb Space Telescope''' (JWST) is the largest space telescope ever built. Launched on Christmas Day in December 2021, it orbits the Sun about 1.5 million kilometres (one million miles) away from Earth.

=== What It Does ===
JWST sees infrared light, which human eyes cannot see. This lets the telescope peer through thick cosmic dust clouds to watch stars form and look back billions of years to see the first galaxies. It also analyzes the atmospheres of [[Exoplanet Exploration|planets orbiting other stars]] to check for gases like water vapour and carbon dioxide.

=== Golden Mirrors and Sunshield ===
The telescope uses a giant primary mirror made of 18 gold-plated hexagonal pieces that unfolded like origami in space. A five-layer tennis-court-sized sunshield blocks heat from the Sun, Moon, and Earth so its cameras stay at minus 233 degrees Celsius (minus 388 degrees Fahrenheit).`,

  'Artemis Program': `== Artemis Program ==
The '''Artemis Program''' is an international space effort led by NASA to send astronauts back to the Moon and establish a long-term human presence there.

=== Key Missions ===
# '''Artemis I (2022):''' Flew an uncrewed Orion spacecraft around the Moon and safely returned to Earth.
# '''Artemis II:''' Planned to carry four astronauts around the Moon in a test flight.
# '''Artemis III:''' Aims to land astronauts, including the first woman and first person of colour, near the lunar south pole.

=== How It Works ===
Astronauts ride inside the Orion capsule on top of the giant Space Launch System (SLS) rocket. Future missions will dock with a small planned space station called Gateway orbiting the Moon.`,

  'Renewable Energy Transition': `== Renewable Energy Transition ==
The '''renewable energy transition''' is the global move away from burning fossil fuels like coal, oil, and gas toward cleaner energy sources that do not produce greenhouse gases.

=== Common Clean Energy Sources ===
* '''Solar Power:''' Rooftop panels and large solar farms turn direct sunlight into electricity.
* '''Wind Power:''' Giant wind turbines generate electricity from natural air currents.
* '''Hydro and Geothermal:''' Water dams and underground Earth heat provide steady power around the clock.

=== Storing Energy ===
Because the sun sets and the wind changes, modern electric grids use large batteries and pumped-water reservoirs to store excess power for when people need it most. Clean electricity also powers everyday transport through [[Electric Vehicles]].`,

  'Electric Vehicles': `== Electric Vehicles ==
An '''electric vehicle''' (EV) runs on electricity stored in rechargeable battery packs instead of burning petrol or diesel in an internal combustion engine.

=== How They Work ===
* '''Battery Pack:''' Thousands of rechargeable battery cells sit along the car floor, keeping the vehicle balanced.
* '''Electric Motor:''' Converts battery electricity into instant movement, making the car quiet and quick to accelerate.
* '''Regenerative Braking:''' When the driver lifts off the accelerator, the motor reverses into a generator, slowing the car down and putting power back into the battery.

=== Charging ===
Drivers charge at home from normal wall sockets or at fast roadside charging stations while travelling. When plugged into electricity from the [[Renewable Energy Transition]], driving produces zero tailpipe emissions.`,

  'Large Language Models': `== Large Language Models ==
A '''large language model''' (LLM) is a computer program trained on billions of pages of writing to understand and generate human language.

=== How They Work ===
Instead of memorizing sentences, the model learns mathematical patterns between words. By reading vast libraries of books, articles, and websites, it figures out which words are most likely to follow one another in a conversation, poem, or computer program.

=== Common Uses ===
* Answering questions and explaining difficult ideas in simple words
* Translating text between different languages
* Writing and reviewing computer code
* Summarizing long documents and letters

Running these models takes massive computing power provided by thousands of chips built through [[Global Chip Manufacturing]].`,

  'Quantum Computing': `== Quantum Computing ==
'''Quantum computing''' is a new way of calculating that uses principles from quantum physics to solve specific problems that regular computers would take centuries to crack.

=== Qubits vs Bits ===
Regular computers store information in bits that are strictly 0 or 1, like tiny light switches. A quantum computer uses quantum bits, or '''qubits'''. Thanks to a physical property called superposition, a qubit can hold a weighted mix of 0 and 1 until measured.

=== Why It Matters ===
Working with qubits lets a quantum computer test millions of possible combinations simultaneously. Scientists hope to use them to invent new medicines, design better batteries, and improve cryptography.`,

  '2024 Summer Olympics': `== 2024 Summer Olympics ==
The '''2024 Summer Olympics''' took place in Paris, France from 26 July to 11 August 2024, welcoming over 10,500 athletes from 206 nations.

=== Famous City Backdrops ===
Rather than building single-use stadiums far away, Paris hosted competitions near historic landmarks:
* The opening ceremony featured athletes parading on boats along the River Seine.
* Beach volleyball was played directly under the Eiffel Tower.
* Skateboarding, 3x3 basketball, and breaking took over the historic Place de la Concorde.
* Surfing events took place thousands of miles away on the famous waves of Tahiti.

=== Notable Milestones ===
The Paris games achieved full gender parity among competing athletes for the first time in Olympic history.`,

  'Exoplanet Exploration': `== Exoplanet Exploration ==
An '''exoplanet''' is any planet that circles a star outside our Solar System. Before the 1990s, scientists were not sure other stars had planets at all. As of 2024, astronomers have discovered more than 5,500 confirmed exoplanets.

=== How Astronomers Find Them ===
Because planets are small and dim compared to their parent stars, scientists use clever indirect techniques:
* '''Transit Method:''' Watching for tiny dips in a star's brightness when an orbiting planet passes directly in front of it.
* '''Wobble Method:''' Detecting slight gravitational tugs that a planet exerts on its host star.

Space telescopes such as the [[James Webb Space Telescope]] can now inspect the thin atmospheres of these distant worlds to look for clouds, steam, and gases that might indicate habitability.`,

  'Voyager Interstellar Mission': `== Voyager Interstellar Mission ==
The '''Voyager Interstellar Mission''' is the longest-running space journey in human history. NASA launched the twin probes Voyager 1 and Voyager 2 in 1977 to explore Jupiter and Saturn.

=== Into Interstellar Space ===
Both probes kept flying past Neptune and Uranus until they passed beyond the boundary where the Sun's solar wind stops:
* '''Voyager 1''' entered interstellar space in 2012, more than 18 billion kilometres from Earth.
* '''Voyager 2''' followed in 2018.

=== Still Talking to Earth ===
Even after more than 45 years in space, both probes continue sending back scientific data about cosmic rays and space magnetic fields. Their radio signals take over 22 hours to reach Earth.`,

  'Global Chip Manufacturing': `== Global Chip Manufacturing ==
'''Chip manufacturing''' is the precise process of printing microscopic circuits on silicon to produce computer chips (microprocessors).

=== How Chips Are Made ===
* '''Silicon Wafers:''' Purified sand is melted into giant silicon crystals and sliced into paper-thin discs called wafers.
* '''Printing Circuits:''' Advanced machines use ultraviolet light to project tiny wiring patterns onto the silicon, layer by layer.
* '''Cutting and Packaging:''' A single wafer contains hundreds of chips. Once printed, they are sliced apart and sealed in protective black casings with metal pins.

Modern chips pack billions of tiny transistors onto a fingernail-sized piece of silicon, powering phones, cars, [[Large Language Models]], and experimental [[Quantum Computing]].`
};

export function seedIfEmpty(store) {
  if (!store.isEmpty()) {
    try {
      if (typeof localStorage !== 'undefined' && !localStorage.getItem('pocket_wiki_seed_migrated_v1')) {
        localStorage.setItem('pocket_wiki_seed_migrated_v1', '1');
        if (typeof store.exists === 'function' && store.exists('Local Sovereignty') && !store.exists('Your Pages Stay in This Browser')) {
          const oldRev = store.load('Local Sovereignty');
          if (oldRev) {
            store.save('Your Pages Stay in This Browser', oldRev.text, 'Update seed title for existing visitors');
          }
        }
      }
      if (typeof localStorage !== 'undefined' && !localStorage.getItem('pocket_wiki_seed_articles_v1')) {
        for (const title of NEW_STARTER_ARTICLES) {
          if (typeof store.exists === 'function' && !store.exists(title) && SEED_PAGES[title]) {
            store.save(title, SEED_PAGES[title], 'Seed starter article');
          }
        }
        if (typeof store.load === 'function' && store.exists('Main Page')) {
          const mainRev = store.load('Main Page');
          if (mainRev && !mainRev.text.includes('=== Popular Articles ===')) {
            const popularSection = `\n\n=== Popular Articles ===\nRead 10 starter articles on space, science, and technology:\n* [[James Webb Space Telescope]] — Infrared astronomy in deep space.\n* [[Artemis Program]] — Human missions returning to the Moon.\n* [[Renewable Energy Transition]] — Clean electricity from sun and wind.\n* [[Electric Vehicles]] — Battery-powered transport.\n* [[Large Language Models]] — Computers that write and understand language.\n* [[Quantum Computing]] — Computers that calculate with quantum physics.\n* [[2024 Summer Olympics]] — The summer games held across Paris.\n* [[Exoplanet Exploration]] — Discovering worlds around other stars.\n* [[Voyager Interstellar Mission]] — Space probes travelling beyond the Sun.\n* [[Global Chip Manufacturing]] — Making computer chips from silicon.`;

            if (mainRev.text.includes('=== Built by AI Agents ===')) {
              const updated = mainRev.text.replace('=== Built by AI Agents ===', popularSection.trim() + '\n\n=== Built by AI Agents ===');
              store.save('Main Page', updated, 'Add popular articles to Main Page');
            } else {
              store.save('Main Page', mainRev.text.trimEnd() + popularSection, 'Add popular articles to Main Page');
            }
          }
        }
        localStorage.setItem('pocket_wiki_seed_articles_v1', '1');
      }
    } catch (_) {
      // ignore storage access errors
    }
    return;
  }
  for (const [title, text] of Object.entries(SEED_PAGES)) {
    store.save(title, text, 'Initial seed revision');
  }
}
