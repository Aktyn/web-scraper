import { simplifyPageSource } from './source.helpers'
import fs from 'fs'
import path from 'path'

describe('source.helpers', () => {
  const examplePageSource1 = fs.readFileSync(
    path.join(__dirname, '..', '..', 'test-utils', 'zen-browser-release-notes.html'),
    'utf-8',
  )
  const baseURI = 'https://zen-browser.app/release-notes/'

  it('should simplify page source', () => {
    expect(simplifyPageSource(examplePageSource1, baseURI)).toBe(simplifiedPageSourceMock)
  }, 60_000)

  it('should simplify page source and keep its length under specified maximum', () => {
    const simplifiedPageSource = simplifyPageSource(examplePageSource1, baseURI, 8192)
    expect(simplifiedPageSource.length).toBeLessThanOrEqual(8192)
    expect(simplifiedPageSource.length).toBeGreaterThan(6144)
  }, 60_000)
})

const simplifiedPageSourceMock = `<html data-theme="dark" lang="en" data-lt-installed="true"> <body> <nav id="nav-bar" data-astro-cid-ymhdp2rl="">  <nav data-astro-cid-ymhdp2rl="true">  <a href="/" data-astro-cid-ymhdp2rl="">  <span data-astro-cid-ymhdp2rl="">zen browser</span> </a> <div data-astro-cid-ymhdp2rl=""> <div data-astro-cid-ymhdp2rl=""> <menu data-astro-cid-ymhdp2rl="true" aria-expanded="false"> <button data-astro-cid-ymhdp2rl=""> <span data-astro-cid-ymhdp2rl="">Getting Started</span>  </button> <div data-astro-cid-ymhdp2rl="true" aria-expanded="false">  <div data-astro-cid-ymhdp2rl=""> <a href="/mods" data-astro-cid-ymhdp2rl=""> <div data-astro-cid-ymhdp2rl="">Zen Mods</div> <div data-astro-cid-ymhdp2rl="">
  Customize your browsing experience with Zen Mods.
</div> <button data-astro-cid-vnzlvqnm="">
Try Zen Mods
</button> </a> <a href="/release-notes" data-astro-cid-ymhdp2rl=""> <div data-astro-cid-ymhdp2rl="">Release Notes</div> <div data-astro-cid-ymhdp2rl="">
Stay up to date with the latest features and improvements.
</div> </a> <a href="https://discord.gg/zen-browser" data-astro-cid-ymhdp2rl=""> <div data-astro-cid-ymhdp2rl="">Discord</div> <div data-astro-cid-ymhdp2rl="">
Join our community on Discord to chat with other Zen users!
</div> </a> </div>  </div> </menu> <menu data-astro-cid-ymhdp2rl="true" aria-expanded="false"> <button data-astro-cid-ymhdp2rl=""> <span data-astro-cid-ymhdp2rl="">Useful Links</span>  </button> <div data-astro-cid-ymhdp2rl="true" aria-expanded="false">  <div data-astro-cid-ymhdp2rl=""> <a href="/donate" data-astro-cid-ymhdp2rl=""> <div data-astro-cid-ymhdp2rl="">Donate &#x2764;&#xfe0f;</div> <div data-astro-cid-ymhdp2rl="">
Support the development of Zen Browser with a donation.
</div> </a> <a href="/about" data-astro-cid-ymhdp2rl=""> <div data-astro-cid-ymhdp2rl="">About Us &#x1f31f;</div> <div data-astro-cid-ymhdp2rl="">
Learn more about the team behind Zen Browser.
</div> </a> <a href="https://docs.zen-browser.app" data-astro-cid-ymhdp2rl=""> <div data-astro-cid-ymhdp2rl="">Documentation</div> <div data-astro-cid-ymhdp2rl="">
Learn how to use Zen Browser with our documentation.
</div> </a> <a href="https://github.com/zen-browser" target="_blank" data-astro-cid-ymhdp2rl=""> <div data-astro-cid-ymhdp2rl="">GitHub</div> <div data-astro-cid-ymhdp2rl="">
Contribute to the development of Zen Browser on GitHub.
</div> </a> </div>  </div> </menu> <a href="/mods" data-astro-cid-ymhdp2rl=""> <span data-astro-cid-ymhdp2rl="">Mods</span> </a> </div> </div> <div data-astro-cid-ymhdp2rl=""> <div id="theme-switcher" data-astro-cid-ymhdp2rl=""> <label data-astro-cid-c6ilrlll=""> <input data-theme-switch="" aria-checked="false" type="checkbox" data-astro-cid-c6ilrlll="">   <span data-astro-cid-c6ilrlll="">
Toggle theme
</span> </input>
</label>    </div> <a href="/download" data-astro-cid-vnzlvqnm=""> <span data-astro-cid-ymhdp2rl="">
Download
</span>  </a> </div>  </nav>   </nav>    <main> <div> <h1 data-astro-cid-zfufvvig=""> Release Notes </h1>  <p>
Stay up to date with the latest changes to Zen Browser! Since the <a href="#1.0.0-a.1">first release</a> till <a href="/release-notes#1.7.5b">1.7.5b</a>, we&apos;ve been working hard to make Zen Browser the best it can be.
Thanks everyone for your feedback! &#x2764;&#xfe0f;
</p>  <section id="1.7.5b"> <div>  <h1> Release notes for 1.7.5b &#x1f389; </h1> February 5, 2025 <div> <a rel="noopener noreferrer" target="_blank" href="https://github.com/zen-browser/desktop/releases/tag/1.7.5b">GitHub Release</a>  <span>&#x2022;</span> <a rel="noopener noreferrer" target="_blank" href="https://github.com/zen-browser/desktop/actions/runs/13184385191">
Workflow run
</a>  </div> <div>  <p>
If you encounter any issues, please report them on <a rel="noopener noreferrer" target="_blank" href="https://github.com/zen-browser/desktop/issues/">the issues page</a>.
</p> </div> <p> Another stability update while we are figuring big changes out!<br>
<br>This update has been focused on adding some cool new features such as removing the need of new tabs and a better glance experience. We have also fixed a lot of bugs that have been reported by the community, thank you for your feedback! </br>
</br>
</p>  <div data-astro-cid-azk5xhg2=""> <details data-accordion-item="" data-astro-cid-svy5pcib=""> <summary data-astro-cid-svy5pcib=""> <span data-astro-cid-svy5pcib="">Fixes</span> </summary> <div data-astro-cid-svy5pcib="">  <ul> <li> Fixed double clicking the sidebar not opening a new tab </li>
<li> Fixed having tabs for workspace containers not changing containers </li>
<li> Fixed tabs scrolling to the top each time a tab is closed </li>
<li> Fixed &apos;Switch to workspace where container is set as default when opening container tabs&apos; not working </li>
<li> Fixed sidebar spacings and styling issues </li>
<li> Fixed glance sometimes crashing when opening a new tab </li>
<li> Fixed workspaces switching randomly when closing a tab in certain scenarios </li>
<li> Fixed hard-locks randomly appearing, often due to keyboard shortcuts </li>
<li> Fixed essentials having scrollbar issues </li>
<li> Fixed glance tabs being unloaded </li>
<li> Fixed unloading about: pages making the browser unresponsive </li>
<li> Fixed settings page not displaying correctly some of the shortcut descriptions </li>
<li> Fixed mute button having a broken icon </li>
<li> Fixed bug where container-specific essentials don&apos;t remain focused when switching workspaces </li> </ul>  </div> </details> <details data-accordion-item="" data-astro-cid-svy5pcib=""> <summary data-astro-cid-svy5pcib=""> <span data-astro-cid-svy5pcib="">Features</span> </summary> <div data-astro-cid-svy5pcib="">  <ul> <li>Updated to firefox 135.0</li>
<li>NEW TABS HAVE BEEN REMOVED, instead we are opting for opening the URL bar and then pressing enter to open a new tab (&apos;zen.urlbar.replace-newtab&apos; to false in about:config to revert)</li>
<li>Added the ability to pinning or adding to essentials by simply dragging and dropping</li>
<li>Add thin scrollbar style to vertical tabs for improved aesthetics</li>
<li>Added support for having glance in multiple tabs!</li>
<li>Floating urlbar doesn&apos;t show the compact mode sidebar anymore</li>
<li>Added a &apos;copy current url as markdown&apos; shortcut</li>
<li>New glance UI and animations</li>
<li>New icons!</li>
<li>Improved workspace switching with gestures</li> </ul>  </div> </details> <details data-accordion-item="" data-astro-cid-svy5pcib=""> <summary data-astro-cid-svy5pcib=""> <span data-astro-cid-svy5pcib="">Breaking Changes</span> </summary> <div data-astro-cid-svy5pcib="">  <ul> <li> Disabled tab previews by default, can be enabled in settings </li>
<li> We now use the .tar.xz format for the linux release </li>
<li> New tabs have been removed, check the features section </li>
<li> Replaced default toolbar layout, the profile button with the settings icon </li> </ul>  </div> </details>  </div>   </div>  </section>
<section id="1.7.4b"> <div>  <h1> Release notes for 1.7.4b &#x1f389; </h1> January 30, 2025 <div> <a rel="noopener noreferrer" target="_blank" href="https://github.com/zen-browser/desktop/releases/tag/1.7.4b">GitHub Release</a>  <span>&#x2022;</span> <a rel="noopener noreferrer" target="_blank" href="https://github.com/zen-browser/desktop/actions/runs/13062083313">
  Workflow run
</a>  </div> <div>  <p>
If you encounter any issues, please report them on <a rel="noopener noreferrer" target="_blank" href="https://github.com/zen-browser/desktop/issues/">the issues page</a>.
</p> </div> <p> Quick fix for a critical bug that was introduced in the previous release. </p>  <div data-astro-cid-azk5xhg2=""> <details data-accordion-item="" data-astro-cid-svy5pcib=""> <summary data-astro-cid-svy5pcib=""> <span data-astro-cid-svy5pcib="">Fixes</span> </summary> <div data-astro-cid-svy5pcib="">  <ul> <li> Fixed the browser not opening when having multiple windows </li>
<li> Fixed macos fullscreen having a weird shadow </li> </ul>  </div> </details>  </div>   </div>  </section>
<section id="1.7.3b"> <div>  <h1> Release notes for 1.7.3b &#x1f389; </h1> January 30, 2025 <div> <a rel="noopener noreferrer" target="_blank" href="https://github.com/zen-browser/desktop/releases/tag/1.7.3b">GitHub Release</a>  <span>&#x2022;</span> <a rel="noopener noreferrer" target="_blank" href="https://github.com/zen-browser/desktop/actions/runs/13053102880">
  Workflow run
</a>  </div> <div>  <p>
If you encounter any issues, please report them on <a rel="noopener noreferrer" target="_blank" href="https://github.com/zen-browser/desktop/issues/">the issues page</a>.
</p> </div> <p> In this release, more stability and performance improvements have been made. </p>  <div data-astro-cid-azk5xhg2=""> <details data-accordion-item="" data-astro-cid-svy5pcib=""> <summary data-astro-cid-svy5pcib=""> <span data-astro-cid-svy5pcib="">Fixes</span> </summary> <div data-astro-cid-svy5pcib="">  <ul> <li> Fixed essentials background having the wrong border radius </li>
<li> Fixed compact mode sidebar not re-opening when the animation key is off </li>
<li> Fixed closing pinned tabs with CTRL+W making the browser unuseable </li>
<li> Fixed glance opening on essential tabs even if it&apos;s disabled<a href="https://github.com/zen-browser/desktop/issues/4564" rel="noopener noreferrer" target="_blank" aria-label="View issue number 4564 on GitHub">
  #4564 </a> </li>
  <li> Fixed crash on overflow menu in macos </li>
  <li> Fixed elements shifting on macos fullscreen </li>
  <li> Fixed changing entering on customizable mode when having multiple windows </li>
  <li> Fixed empty space ontop of the vertical tabs when there&apos;s no buttons inside it </li>
  <li> Fixed having an empty overflow menu when using single toolbar layout </li>
  <li> Fixed print dialog not opening and fixed website dialogs being clipped </li>
  <li> Fixed keyboard shortcuts not working after pinning extension to the bookmarks bar </li>
  <li> Fixed tabs overflowing the browser when closing multiple essential tabs </li>
  <li> Fixed visual inconsistency with split view confirmation popup </li> </ul>  </div> </details> <details data-accordion-item="" data-astro-cid-svy5pcib=""> <summary data-astro-cid-svy5pcib=""> <span data-astro-cid-svy5pcib="">Features</span> </summary> <div data-astro-cid-svy5pcib="">  <ul> <li>Macos users with single toolbar layout will now NOT have the three dots panel button. This is done to decreased used space. Alternatives can be using the macos native menu bar or disabling it with &apos;zen.view.mac.show-three-dot-menu&apos; in about:config</li>
  <li>MacOS builds are now in a single, unified DMG file</li>
  <li>Pinned tabs AND normal tabs will now scroll together in order to increase visibility</li>
  <li>Glance now has a more native feel to it</li>
  <li>Glance will now wait for the answer to &apos;this page might not save your data&apos; before closing the tab</li>
  <li>Better and more consistent workspace transition for touchpad users</li>
  <li>Added more native tab border radius</li>
  <li>Split view rearangement now has transition animations</li>
  <li>Improved the display of workspace icons in the workspace switcher</li>
  <li>New tab animation is now smoother</li>
  <li>Increase tab unloader timeout from 20 to 40 minutes</li>
  <li>Compact mode doesn&apos;t animate if the mouse is already on the sidebar</li>
  <li>Made the animation of workspace switching faster and smoother</li>
  <li>Add ellipsis to URL bar placeholder text for improved visibility</li>
  <li>If the newtab button is at the top, new tabs will be inserted at the top as well</li> </ul>  </div> </details> <details data-accordion-item="" data-astro-cid-svy5pcib=""> <summary data-astro-cid-svy5pcib=""> <span data-astro-cid-svy5pcib="">Breaking Changes</span> </summary> <div data-astro-cid-svy5pcib="">  <ul> <li> The default newtab possition is now at the top (can be disabled in the settings under Look &amp; Feel) </li>
  <li> Changed default pinned behaviour where it always opens a new tab if only pinned tabs exist </li> </ul>  </div> </details>  </div>   </div>  </section>
  <section id="1.7.2b"> <div>  <h1> Release notes for 1.7.2b &#x1f389; </h1> January 21, 2025 <div> <a rel="noopener noreferrer" target="_blank" href="https://github.com/zen-browser/desktop/releases/tag/1.7.2b">GitHub Release</a>  <span>&#x2022;</span> <a rel="noopener noreferrer" target="_blank" href="https://github.com/zen-browser/desktop/actions/runs/12896824615">
    Workflow run
  </a>  </div> <div>  <p>
  If you encounter any issues, please report them on <a rel="noopener noreferrer" target="_blank" href="https://github.com/zen-browser/desktop/issues/">the issues page</a>.
</p> </div> <p> Another stability update, where we&apos;ve fixed a few more bugs and improved the overall feel of the app.<br>
<br>This is a small update, released primarily to keep Firefox up to date while we work on the next big update. </br>
</br>
</p>  <div data-astro-cid-azk5xhg2=""> <details data-accordion-item="" data-astro-cid-svy5pcib=""> <summary data-astro-cid-svy5pcib=""> <span data-astro-cid-svy5pcib="">Fixes</span> </summary> <div data-astro-cid-svy5pcib="">  <ul> <li> Fixed firefox sidebar spacings </li>
<li> Fixed compact mode rounded corners </li>
<li> Fixed native fonts for windows and linux </li>
<li> Fixed sidebar hiding icons when they could easily fit </li>
<li> Fixed native rounded corners for each OS </li>
<li> Fixed an error when opening zen when having compact mode enabled </li>
<li> Fixed glance messing up with tabs after being closed </li>
<li> Fixed workspaces not initializing when the button is missing from the toolbar </li> </ul>  </div> </details> <details data-accordion-item="" data-astro-cid-svy5pcib=""> <summary data-astro-cid-svy5pcib=""> <span data-astro-cid-svy5pcib="">Features</span> </summary> <div data-astro-cid-svy5pcib="">  <ul> <li>Update Firefox version to 134.0.2</li>
<li>Improved glance animations</li>
<li>Glance now opens automatically on essential tabs instead of a new tab</li>
<li>Add dark mode support for dialog box</li>
<li>Essentials/Urlbar background is now calculated based on the window color, making it look more blended</li>
<li>Adjusted overall spacings and rounded corners around the browser for a better feel</li> </ul>  </div> </details>  </div>   </div>  </section>
<section id="1.7.1b"> <div>  <h1> Release notes for 1.7.1b &#x1f389; </h1> January 19, 2025 <div> <a rel="noopener noreferrer" target="_blank" href="https://github.com/zen-browser/desktop/releases/tag/1.7.1b">GitHub Release</a>  <span>&#x2022;</span> <a rel="noopener noreferrer" target="_blank" href="https://github.com/zen-browser/desktop/actions/runs/12858147265">
  Workflow run
</a>  </div> <div>  <p>
If you encounter any issues, please report them on <a rel="noopener noreferrer" target="_blank" href="https://github.com/zen-browser/desktop/issues/">the issues page</a>.
</p> </div> <p> <u>We are back again with yet another stability update!</u>
<br>
  <br>This update focused on finally fixing the main issues people have with essentials/pinned tabs and improving the experience and UI.<br>
    <br>We&apos;ve improved the browser&apos;s overall UI and feel, added new optimized and *bouncy* animations, made some quality-of-life improvements, and are having a great time!<br>
      <br>One thing to expect in future releases is the implementation of a new settings window, where all Zen-specific features can be easily customized and toggled. </br>
    </br>
  </br>
</br>
</br>
</br>
</p>  <div data-astro-cid-azk5xhg2=""> <details data-accordion-item="" data-astro-cid-svy5pcib=""> <summary data-astro-cid-svy5pcib=""> <span data-astro-cid-svy5pcib="">Fixes</span> </summary> <div data-astro-cid-svy5pcib="">  <ul> <li> Fixed essentials and pinned tabs not being correctly restored when using multiple windows </li>
<li> Fixed bookmarks failing to correctly initialize when using multiple windows </li>
<li> Fixed 1password always prompting for password with the message &apos;It looks like Firefox has been updated&apos; </li>
<li> Fixed macos users having all toolbar buttons on the right side </li>
<li> Fixed having one extra pixel on the web views, leading to weird UI </li> </ul>  </div> </details>    </div>   </div>  </section> </div> </main>
</body>
</html>`
